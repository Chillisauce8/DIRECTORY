import * as _ from 'lodash';
import {MongoCrudClient} from './mongo/client';
import type { Query } from './mongo/client';
import * as _Promise from 'bluebird';
import type {
    IBaseQueryParams,
    ICrudOptions,
    ICrudWriteOptions, IDataCrud,
    IQueryParams
} from './data-crud.interface';
import {ObjectId} from 'mongodb';
import {HistoryState} from './history-state';
import {ERROR_REASON} from '../const';
import {DateHelper, getObjHash} from 'x-utils';
import {deepDiffMapper} from './utils';
import {globalEmitter} from '../utils';
import type { CacheHelper } from '../cache/cacheHelper';


export const DATA_LIMITS = {
    fetchAllRecordsFilterLimit: 100000
};


export const CRUD_EVENTS = {
    nodeCreating: 'nodeCreating',
    nodeUpdating: 'nodeUpdating',
    nodeDeleting: 'nodeDeleting',
    nodeCreated: 'nodeCreated',
    nodeUpdated: 'nodeUpdated',
    nodeDeleted: 'nodeDeleted'
}


export class BaseDataCrud implements IDataCrud {

    constructor(private client: MongoCrudClient,
                private historyStateHelper: HistoryState,
                private dateHelper: DateHelper,
                private cacheHelper: CacheHelper,
                private COMMON_NODES_CACHE_TIMEOUT_SECONDS: number,
                private STANDARD_COLLECTIONS_DESCRIPTION: any) {
        //
    }

    public async readNode(req: Request,
                          collectionName: string,
                          queryParams: IQueryParams, options?: ICrudOptions) {
        let value = await this._readNodeFromCache(req, collectionName, queryParams, options);

        if (value) {
            if (_.isString(value['_id'])) {
                value['_id'] = new ObjectId(value['_id']);
            }

            return value;
        }

        const query = queryParams.query ? queryParams.query : {_id: new ObjectId(queryParams.nodeId)};
        value = await this.client.queryOne(collectionName, query);

        if (!value) {
            return _Promise.reject({
                reason: ERROR_REASON.objectNotFound,
                message: 'Node not found ' + queryParams.nodeId
            });
        }

        if (options?.updateCache !== false) {
            await this._writeNodeToCache(req, collectionName, queryParams, value, options);
        }

        return value;
    }

    public async queryNodes(req: Request, collectionName: string,
                            queryParams: IBaseQueryParams, options?: ICrudOptions) {
        let value = await this._readNodeFromCache(req, collectionName, queryParams, options);

        if (value) {
            return value;
        }

        value = await this.client.queryNodes(collectionName, queryParams.query, queryParams.pagination);

        if (value && options?.updateCache !== false) {
            await this._writeNodeToCache(req, collectionName, queryParams, value, options);
            return value;
        }

        return value;
    }

    public async queryAggregate(req: Request, collectionName, queryParams: IQueryParams,
                                options?: ICrudOptions) {
        const result = await this.client.queryAggregate(
          collectionName, queryParams.query as Query);

        return result.toArray();
    }

    public async queryNodeCount(req: Request, collectionName, queryParams: IBaseQueryParams,
                                options?: ICrudOptions) {
        return this.client.queryNodeCount(collectionName, queryParams.query);
    }

    public async querySingleNode(req: Request, collectionName, queryParams: IBaseQueryParams,
                                 options?: ICrudOptions) {
        let value = await this._readNodeFromCache(req, collectionName, queryParams, options);

        if (value) {
            return value;
        }

        value = await this.client.queryOne(collectionName, queryParams.query as Query);

        if (value && options?.updateCache !== false) {
            await this._writeNodeToCache(req, collectionName, queryParams, value, options);
            return value;
        }

        return value;
    }

    public async queryAllAvailableNodes(req: Request, collectionName: string,
                                        queryParams: IBaseQueryParams, options?: ICrudOptions) {
        let value = await this._readNodeFromCache(req, collectionName, queryParams, options);

        if (value) {
            return value;
        }

        value = await this._queryAllAvailableNodes(req, collectionName, queryParams, options);

        if (value && options?.updateCache !== false) {
            await this._writeNodeToCache(req, collectionName, queryParams, value, options);
            return value;
        }

        return value;
    }

    private async _queryAllAvailableNodes(req: Request, collectionName: string,
                                          queryParams: IBaseQueryParams, options?: ICrudOptions) {
        let clonedQueryParams = _.clone(queryParams);

        let initialSkip = _.get(queryParams, 'pagination.skip', 0);
        const sort = _.get(queryParams, 'pagination.sort');
        let pagination = {limit: DATA_LIMITS.fetchAllRecordsFilterLimit, skip: initialSkip, sort};

        let result: any[] = [];

        let queryNext = async () => {
            clonedQueryParams['pagination'] = pagination;

            const queryNodesOptions = {
                readFromCache: false,
                updateCache: false,
            };

            let nodes: Array<any> = await this.queryNodes(req, collectionName,
                clonedQueryParams, queryNodesOptions);

            if (nodes && nodes.length) {
                result = [...result, ...nodes];
                pagination.skip += DATA_LIMITS.fetchAllRecordsFilterLimit;
            }

            if (nodes.length === DATA_LIMITS.fetchAllRecordsFilterLimit) {
                return queryNext();
            } else {
                return result;
            }
        };

        return queryNext();
    }

    public async createNode(req: Request, collectionName: string, nodeBody,
                            options?: ICrudWriteOptions) {
        return this._createUpdateNode(req, collectionName, nodeBody, this._createNode.bind(this), options);
    }

    public async updateNode(req: Request, collectionName: string, nodeBody,
                            options?: ICrudWriteOptions) {
        return this._createUpdateNode(req, collectionName, nodeBody, this._updateNode.bind(this), options);
    }

    public async mergeNode(req: Request, collectionName: string, nodeBody,
                           options?: ICrudWriteOptions) {
        return this._createUpdateNode(req, collectionName, nodeBody, this._mergeNode.bind(this), options);
    }

    public async deleteNode(req: Request, collectionName: string,
                            queryParams: IQueryParams, options?: ICrudWriteOptions) {
        let query = queryParams.query as Query;

        if (queryParams.nodeId) {
            query = {_id: queryParams.nodeId};
        }

        let fullNode;

        if (!options?.ignoreEventSending) {
            fullNode = await this.querySingleNode(req, collectionName, {query}, options);
        }

        if (!options?.ignoreEventSending && fullNode) {
            await this._emitEvent(req, CRUD_EVENTS.nodeDeleting, fullNode, null);
        }

        await this.client.deleteNode(collectionName, query);

        if (queryParams.nodeId && (!options || !options.ignoreDiff)) {
            this.client.deleteNodes(collectionName + ':diff', {nodeId: queryParams.nodeId});
        }

        await this._invalidateCache(req, collectionName, queryParams.nodeId);

        if (!options?.ignoreEventSending && fullNode) {
            this._emitEvent(req, CRUD_EVENTS.nodeDeleted, fullNode, null);
        }
    }

    public async deleteNodes(req: Request, collectionName: string,
                             queryParams: IQueryParams, options?: ICrudWriteOptions) {
        await this.client.deleteNodes(collectionName, queryParams.query as Query);

        await this._invalidateCache(req, collectionName);
    }

    public async insertNodeArray(req: Request, collectionName: string,
                                 dataList: any[], options?: ICrudWriteOptions) {
        const preparedDataList: any[] = [];

        for (const dataItem of dataList) {
            const preparedDataItem: any = await this.prepareDataToSave(req, collectionName, null,
              {...dataItem}, options);

            preparedDataList.push(preparedDataItem);
        }

        const result = await this.client.insertNodeArray(collectionName, preparedDataList);

        await this._invalidateCache(req, collectionName);

        return result;
    }

    public async getCollectionList(dbConnection) {
        return this.client.getCollectionList();
    }

    protected async setDefaultFields(req: Request, collectionName: string, node, initialNode?) {
        node['_type'] = collectionName;

        const defaultName = node.general?.name || node.name;
        const prevDefaultName = initialNode?.general?.name || initialNode?.name;
        const prevTitle = initialNode?.title;

        if (prevTitle === node.title || !node.title) {
            node.title = defaultName;
        }
    };

    protected async prepareDataToSave(req: Request, collectionName: string,
                                      initialNode, nodeBody, options?: ICrudWriteOptions) {
        const initialNodeCreation = !initialNode;

        if (initialNodeCreation ?? options?.ignoreIDSet) {
            delete nodeBody['_id'];
        }

        if (initialNodeCreation) {
            await this._setCreatedData(req, nodeBody);
        }

        await this.setDefaultFields(req, collectionName, nodeBody, initialNode);

        if (!options?.ignoreLastUpdatedInfo) {
            await this._setLastUpdatedData(req, nodeBody);
        }

        delete nodeBody['_hash'];
        nodeBody['_hash'] = this.prepareNodeHash(nodeBody);

        return nodeBody;
    }

    protected getDiffResult(initialNode, nodeBody) {
        let rawDiff = deepDiffMapper().map(initialNode, nodeBody);

        return _.pickBy(rawDiff, (value) => {
            return value && value.type !== 'unchanged';
        });
    }
    protected onDiffProcessed(req: Request, collectionName: string,
                              nodeId: string, diffResult, isUpdated, options?: ICrudWriteOptions) {
        //
    }

    protected async onNodeSaved(req: Request, nodeId: string, options?: ICrudWriteOptions) {
        //
    }

    protected saveDiff(req: Request, collectionName: string, nodeId, diffResult) {
        return this.client.insertNode(collectionName + ':diff',
            {nodeId, diff: diffResult, dateTime: this._getCurrentDateTime()});
    }

    private _getCurrentDateTime(): string {
        return this.dateHelper.saveDateTimeFormat(new Date());
    }

    private async processDiff(req: Request, collectionName: string, initialNode,
                              newNode, isUpdated,
                              options?: ICrudWriteOptions): Promise<any> {
        let diffResult = this.getDiffResult(initialNode, newNode);

        if (Object.keys(diffResult).length > 0) {
            await this.saveDiff(req, collectionName, newNode._id, diffResult);
        }

        await this.onDiffProcessed(req, collectionName, newNode._id, diffResult, isUpdated, options);

        return diffResult;
    }

    private async _createNode(req: Request, collectionName: string, nodeBody,
                              options?: ICrudWriteOptions) {
        let dataToSave = await this.prepareDataToSave(req, collectionName,
            null, nodeBody, options);

        if (options && options.onIDSet) {
            dataToSave = options.onIDSet(dataToSave) || dataToSave;
        }

        if (!options?.ignoreEventSending) {
            await this._emitEvent(req, CRUD_EVENTS.nodeCreating, null, dataToSave);
        }

        if (!options || !options.ignoreDiff) {
            await this.processDiff(req, collectionName, undefined, nodeBody, false, options);
        }

        const resultNode = await this.client.insertNode(collectionName, dataToSave);

        await this.onNodeSaved(req, resultNode._id, options);

        if (!options?.ignoreEventSending) {
            this._emitEvent(req, CRUD_EVENTS.nodeCreated, null, resultNode);
        }

        return resultNode;
    }

    private _updateNode(req: Request, collectionName: string, nodeBody,
                        options?: ICrudWriteOptions) {
        return this._nodeUpdateReplace(req, collectionName, nodeBody, true, options);
    }

    private _mergeNode(req: Request, collectionName: string, nodeBody,
                       options?: ICrudWriteOptions) {
        return this._nodeUpdateReplace(req, collectionName, nodeBody, false, options);
    }

    private needCheckNodeSlugUniq(nodeBody): boolean {
        return !!(nodeBody?.general?.slug);
    }

    private async checkNodeSlugUniq(req: Request, collectionName: string, nodeBody): Promise<boolean> {
        const queryParams = {query: {slug: nodeBody?.general?.slug}};

        let slugNode;

        try {
            slugNode = await this.querySingleNode(req,
                this.STANDARD_COLLECTIONS_DESCRIPTION.slugs.name,
                queryParams);
        } catch (e) {
            console.error('Impossible to check node SLUG is unique');

            return true;
        }

        if (!slugNode) {
            return true;
        }

        return slugNode?._id !== nodeBody._id;
    }

    private async _createUpdateNode(req: Request, collectionName: string, nodeBody,
                                    crudFunction, options?: ICrudWriteOptions) {
        let resNode;

        if (this.needCheckNodeSlugUniq(nodeBody)) {
            const isSlugUniq = await this.checkNodeSlugUniq(req, collectionName, nodeBody);

            if (!isSlugUniq) {
                throw new Error('Document SLUG is not unique');
            }
        }

        try {
            resNode = await crudFunction(req, collectionName, nodeBody, options);
        } catch (ex: any) {
            if (ex?.message === 'Document failed validation') {
                const message = `nodeType: ${collectionName}, id: ${nodeBody._id}`;
                await globalEmitter.emit('sendReport', req, 'Document failed validation', message);
            }

            throw ex;
        }

        await this._invalidateCache(req, collectionName, resNode._id);

        if (options?.updateCache !== false) {
            await this._writeNodeToCache(req, collectionName,
                {nodeId: resNode._id}, resNode, options);
        }

        return _Promise.resolve(resNode);
    }

    private async _nodeUpdateReplace(req: Request, collectionName: string, nodeBody, isReplace, options?: ICrudWriteOptions) {
        const queryParams = {nodeId: nodeBody._id};
        const queryOptions = {...options, readFromCache: false, updateCache: true};

        const initialNode = await this.readNode(req, collectionName, queryParams, queryOptions);

        if (!options?.ignoreStateRestore && isReplace && initialNode['_hash']
            && nodeBody['_hash']
            && nodeBody['_hash'] !== initialNode['_hash']) {
            nodeBody = await this.historyStateHelper.addMissedStates(nodeBody,
                {nodeType: collectionName, nodeId: nodeBody._id,
                  targetHash: nodeBody['_hash']});

            if (nodeBody['_hash'] !== initialNode['_hash']) {
                throw {
                    reason: ERROR_REASON.invalidData,
                    message: `Data was modified. Please update it and try to save again, (initial hash: ${initialNode['_hash']}, your hash: ${nodeBody['_hash']} )`
                };
            }
        }

        let nodeToSave;

        if (isReplace) {
            nodeToSave = nodeBody;
            nodeToSave['_id'] = initialNode['_id'];
            nodeToSave['_type'] = initialNode['_type'];
        } else {
            nodeToSave = _.clone(initialNode);

            for (let key in nodeBody) {
                if (key !== '_id') {
                    _.set(nodeToSave, key, _.get(nodeBody, key));
                    // nodeToSave[key] = nodeBody[key];
                }
            }
        }

        const dataToSave = await this.prepareDataToSave(req, collectionName, initialNode, nodeToSave, options);

        if (!options?.ignoreEventSending) {
            await this._emitEvent(req, CRUD_EVENTS.nodeUpdating, initialNode, dataToSave);
        }

        const updatedNode = await this.client.updateNode(collectionName,
          {_id: dataToSave._id}, dataToSave);

        let diff;

        if (!options?.ignoreDiff) {
            diff = await this.processDiff(req, initialNode, updatedNode, true, options);
        }

        await this.onNodeSaved(req, updatedNode._id, options);

        if (!options?.ignoreEventSending) {
            this._emitEvent(req, CRUD_EVENTS.nodeUpdated, initialNode, updatedNode, diff);
        }

        return updatedNode;
    }

    private _emitEvent(req: Request, eventName, prevNode, resultNode, diff?) {
        return globalEmitter.emit(eventName, req, prevNode, resultNode, diff);
    }

    private async _setLastUpdatedData(req: Request, data) {
        //TODO:
        const info = await this.prepareLastUpdatedObject(req);

        if (info) {
            data.lastUpdated = info;

            if (info.userType !== 'auto') {
                data.lastEdited = info;
            }
        }

        return data;
    }

    private async _setCreatedData(req: Request, data) {
        let info = await this.prepareLastUpdatedObject(req);

        if (info) {
            data.created = info;
        }

        return data;
    }

    private prepareLastUpdatedObject(req: Request) {
      const user = req['userDetails'];

      let userName = '';

      if (user) {
        userName = user.name || user.general?.name;
      }

      return {
        name: userName,
        userType: user.type || user.general?.type,
        date: new Date(),
      };
    }

    private async _readNodeFromCache(req: Request, nodeType: string, keyData: object, options?: ICrudOptions) {
        if (options && options.readFromCache === false) {
            return _Promise.resolve();
        }

        const cacheKey = this._prepareCacheKey(req, nodeType, keyData);

        return await this.cacheHelper.readFromCache(req, cacheKey);
    }

    private async _writeNodeToCache(req: Request, nodeType: string, keyData: object, data,
                                    options?: ICrudOptions) {
        const cacheKey = this._prepareCacheKey(req, nodeType, keyData);
        await this.cacheHelper.writeToCache(req, cacheKey, data,
            options?.updateCacheTimeoutSec ?? this.COMMON_NODES_CACHE_TIMEOUT_SECONDS);
        return data;
    }

    private _prepareCacheKey(req: Request, nodeType: string, keyData: object): string {
        if (keyData['nodeId']) {
            return this.cacheHelper.createCommonDataReadCacheKey(nodeType, keyData['nodeId']);
        }

        return this.cacheHelper.createCommonDataQueryCacheKey2(nodeType,
            keyData['query'], keyData['pagination']);
    }

    private _invalidateCache(req: Request, nodeType: string, nodeId?: string) {
        if (nodeId) {
            return this.cacheHelper.invalidateForNodeChanged(req, nodeType, nodeId);
        } else {
            return this.cacheHelper.invalidateForNodeType(req, nodeType);
        }
    }

    private prepareNodeHash(nodeData: any) {
        return getObjHash(nodeData);
    }
}
