import {IQueryParams} from '../../db/data-crud.interface';
import {CollectionCrud} from '../../db/collection-crud';
import {MongoCrudClient} from '../../db/mongo/client';
import * as _ from 'lodash';
import {RestoreHistoryStateHelper, restoreHistoryStateHelperFactory} from './restoreHistoryStateHelper';
import {IgnoreHistoryFieldListGetter, ignoreHistoryFieldListGetterFactory} from './ignoreHistoryFieldListGetter';
import {STANDARD_COLLECTIONS_DESCRIPTION} from '../../collectionNames';
import { coreServiceLocator } from '../../serviceLocator';


export type NodeLastUpdated = {name: string; userType: string};
export type HistoryStateItem = {diffId: string; dateTime: string; editor?: string};


export type DiffFieldValue = {
  type: 'created' | 'updated' | 'deleted';
  data: any;
  newData?: any;
};


export type Diff = {
  _id: any;
  dateTime: string;
  diff: {
    [prop: string]: any;
    lastUpdated?: {
      name: DiffFieldValue;
      userType: DiffFieldValue;
    };
  }
};


const AUTO_LAST_UPDATED_NAME = 'Auto';


export type StateListConfig = {
  nodeType: string;
  nodeId: string;
  filterIgnoreData?: string[];
  lastDateTime?: string;
  targetHash?: number;
};


export type RestoreHistoryStateConfig = {
  nodeType: string;
  nodeId: string;
  dateTime: string;
  nodeData?: any;
};


function keyChanges(base, object) {
  const changes = {};

  function walkObject(base, object, path = '') {
    for (const key of Object.keys(base)) {
      const currentPath = path === ''
          ? key
          : `${path}.${key}`;

      if (object[key] === undefined) {
        changes[currentPath] = '-';
      }
    }

    for (const [key, value] of Object.entries(object)) {
      const currentPath = Array.isArray(object)
          ? path + `[${key}]`
          : path === ''
              ? key
              : `${path}.${key}`;

      if (base[key] === undefined) {
        changes[currentPath] = '+';
      }
      else if (value !== base[key]) {
        if (typeof value === 'object' && typeof base[key] === 'object') {
          walkObject(base[key], value, currentPath)
        }
        else {
          changes[currentPath] = object[key];
        }
      }
    }
  }

  walkObject(base, object);

  return changes
}


export class HistoryState {
  constructor(private client: MongoCrudClient,
              private restoreHistoryStateHelper: RestoreHistoryStateHelper,
              private ignoreHistoryFieldListGetter: IgnoreHistoryFieldListGetter,
              private collectionCrud: CollectionCrud,
              private backward: boolean) {}

  public async getDiffToHistoryState(config: RestoreHistoryStateConfig) {
    const {nodeData} = config;

    const restoredNode = await this.restoreNodeHistoryState(config);

    if (!nodeData) {
      return restoredNode;
    }

    const diffList = keyChanges(nodeData, restoredNode);

    const changedPathList = _.keys(diffList);

    const changedRootFields = _.chain(changedPathList)
      .map(k => k.split('.')[0])
      .map(k => k.split('[')[0])
      .uniq()
      .value();

    for (const key of _.keys(restoredNode)) {
      if (changedRootFields.indexOf(key) !== -1) {
        continue;
      }

      delete restoredNode[key];
    }

    return restoredNode;
  }

  public async restoreNodeHistoryState(config: RestoreHistoryStateConfig) {
    const {nodeType, nodeId, dateTime, nodeData} = config;

    const definition = await this.loadDefinitionByNodeType(nodeType);
    let ignoreFields = this.ignoreHistoryFieldListGetter.process(definition);

    ignoreFields = [...ignoreFields, '_hash'];

    const diffList = await this.getNodeDiffList({nodeType, nodeId, lastDateTime: dateTime});

    let data;

    if (nodeData && diffList.length) {
      data = nodeData;
    } else {
      data = await this.client.queryOne(nodeType, {_doc: nodeId});
    }

    return this.restoreHistoryStateHelper.restoreHistoryState(data, diffList, ignoreFields);
  }

  public async addMissedStates(nodeData: any, config: StateListConfig) {
    const diffList = await this.getNodeDiffList(config);
    const ignoreFields = ['lastEdited', 'lastUpdated'];

    return this.restoreHistoryStateHelper.restoreHistoryState(nodeData, diffList, ignoreFields);
  }

  public getDiffListWithChanges(diffList: any[], ignoreFields: string[]): string[] {
    const deleteDiffFields = ['lastEdited', 'lastUpdated', '_hash']
      .concat(ignoreFields)
      .filter(f => f.indexOf('.') === -1);

    for (const diff of diffList) {
      deleteDiffFields.forEach(i => delete diff.diff[i]);
    }

    const diffListWithChanges = diffList
      .filter(d => _.keys(d.diff).length !== 0);

    return diffListWithChanges.map(d => d._id.toHexString())
  }

  public async getStateList(nodeType: string, nodeId: string): Promise<HistoryStateItem[]> {
    const definition = await this.loadDefinitionByNodeType(nodeType);
    const ignoreFields = this.ignoreHistoryFieldListGetter.process(definition);

    const filterIgnoreData =  ignoreFields.map(f => `diff.${f}`);

    const diffList = await this.getNodeDiffList({nodeType, nodeId, filterIgnoreData});

    if (!diffList || !diffList.length) {
      return [];
    }

    const historyStateItemList: Object[] = [];

    let currentLastUpdatedName: string|null = null;

    const sortedDiffList = _.orderBy(diffList, ['dateTime'], [this.backward ? 'asc' : 'desc']);

    for (const diff of sortedDiffList) {
      currentLastUpdatedName = this.getLastUpdatedNameFromDiff(diff) || currentLastUpdatedName;

      const {dateTime, _id} = diff;

      historyStateItemList.push({
        editor: currentLastUpdatedName,
        diffId: _id.toHexString(),
        dateTime,
      })
    }

    const diffListWithChanges = this.getDiffListWithChanges(diffList, ignoreFields);

    const historyStateWithChangesItemList = historyStateItemList.filter((h: any) => diffListWithChanges.indexOf(h.diffId) !== -1);

    return _.orderBy(historyStateWithChangesItemList, ['dateTime'], [this.backward ? 'desc' : 'asc'])
      .filter((v: any) => v.editor !== AUTO_LAST_UPDATED_NAME) as HistoryStateItem[];
  }

  private async getNodeDiffList(config: StateListConfig): Promise<Diff[]> {
    let {nodeId, nodeType, lastDateTime, filterIgnoreData, targetHash} = config;

    const query: any = {nodeId};

    if (filterIgnoreData) {
      query._fields = (filterIgnoreData || []).reduce((ignoreFields, field) => {
        ignoreFields[field] = 0;
        return ignoreFields;
      }, {});
    }

    if (lastDateTime) {
      query.dateTime = {
        $gt: lastDateTime
      };
    }

    if (targetHash) {
      const getHashNodeQuery: any = {nodeId};
      getHashNodeQuery['diff._hash.data'] = targetHash;

      const hashNodes = await this.client.queryNodes(nodeType + ':diff', getHashNodeQuery);

      if (hashNodes && hashNodes.length) {
        query.dateTime = {
          $gte: hashNodes[0].dateTime
        };

      }
    }

    let diffList: Object[] = [];

    try {
      const diffNodeType = nodeType + ':diff';

      const queryParams: IQueryParams = {
        query,
      };

      diffList = await this.client.queryNodes(diffNodeType, queryParams.query);

    } catch (e) {
      console.error('Diff loading error', e);

      return [];
    }

    return _.orderBy(diffList, ['dateTime'], [this.backward ? 'desc' : 'asc']) as Diff[];
  }

  private async getCurrentNodeLastEdit(nodeType: string, nodeId: string): Promise<NodeLastUpdated|null> {
    let nodeData;

    try {
      nodeData = await this.client.queryOne(nodeType,
          {_doc: nodeId, _fields: {lastUpdated: 1,}});
    } catch (e) {
      console.error('Last updated getting error', e);

      return null;
    }

    if (!nodeData) {
      return null;
    }

    return nodeData.lastUpdated;
  }

  private getLastUpdatedNameFromDiff(diffNode: Diff): string|null {
    const {lastUpdated} = diffNode.diff;

    if (!lastUpdated) {
      return null;
    }

    let userType;

    if (lastUpdated.userType) {
      userType = lastUpdated.userType.type === 'created' ?
        lastUpdated.userType.data : lastUpdated.userType.newData;
    } else {
      userType = null;
    }

    if (userType === 'auto') {
      return AUTO_LAST_UPDATED_NAME;
    }

    if (!lastUpdated.name) {
      return null;
    }

    if (lastUpdated.name.type === 'created') {
      return lastUpdated.name.data;
    } else {
      return lastUpdated.name.newData;
    }
  }

  private getLastUpdateNameFromNode(lastUpdated: NodeLastUpdated): string {
    return lastUpdated.userType === 'auto' ?  AUTO_LAST_UPDATED_NAME : lastUpdated.name;
  }

  private async loadDefinitionByNodeType(nodeType): Promise<any> {
    return this.client.queryOne(STANDARD_COLLECTIONS_DESCRIPTION.collections.name, {
      name: nodeType,
    });
  }
}


export function historyStateHelperFactory(backward: boolean = true): HistoryState {
  const mongoCrud = coreServiceLocator.get('mongoCrud');
  const collectionCrud: CollectionCrud = coreServiceLocator.get('collectionCrud');

  return new HistoryState(
    mongoCrud,
    restoreHistoryStateHelperFactory(backward),
    ignoreHistoryFieldListGetterFactory(),
    collectionCrud,
    backward
  );
}
