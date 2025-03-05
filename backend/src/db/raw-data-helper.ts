import {ObjectId} from 'mongodb';
import { DefinitionCrud } from './definition-crud';
import { AssociationCrud } from './associations/associationCrud';
import { AssociationTasksCrud } from './associations/associationTasksCrud';
import { RequestHelper } from '../utils';
import { DataCrudWithRelators } from './data-crud-with-relators';


export class RawDataHelper {
  constructor(
      private dataCrudService: DataCrudWithRelators,
      private requestHelper: RequestHelper,
      private definitionCrud: DefinitionCrud,
      private associationCrud: AssociationCrud,
      private associationTasksCrud: AssociationTasksCrud,
      private STANDARD_COLLECTIONS_DESCRIPTION: any,
  ) {}

  public async getCollectionList(req: Request) {

    const collectionList: Array<any> =
        await this.dataCrudService.getCollectionList(req) as Array<any>;

    return collectionList
        .filter(collection => {
          if (!collection?.name) {
            return false;
          }

          const nameWithoutDiff = this.getCollectionNameWithoutDiff(collection.name);

          if (nameWithoutDiff === this.STANDARD_COLLECTIONS_DESCRIPTION.users.name) {
            return true;
          }

          return nameWithoutDiff.indexOf(':') === -1;
        })
        .map(collection => {
          return collection.name;
        })
        .sort();
  }

  public async queryList(req: Request, nodeType: string) {
    if (!nodeType) {
      return {
        count: 0,
        data: 0
      };
    }

    const pagination = this.requestHelper.parseRequestPaginationParams(req);
    const query = this.requestHelper.parseRequestFiltrationParams(req);
    query['_fields'] = this.requestHelper.parseRequestFieldsParams(req);

    const data = await this.dataCrudService.queryNodes(req, nodeType,
        {query, pagination}, {
      readFromCache: false, updateCache: false});

    const count = await this.dataCrudService.queryNodeCount(req, nodeType, {query});

    return {data, count};
  }

  public async readNode(req: Request, nodeType: string, nodeId: string) {
    const query = {'_id': new ObjectId(nodeId)};

    return this.dataCrudService.querySingleNode(req, nodeType, {query}, {
      readFromCache: false
    });
  }

  public async deleteNode(req: Request, nodeType: string, nodeId: string) {
    if (nodeType === this.STANDARD_COLLECTIONS_DESCRIPTION.collections.name) {
        return this.definitionCrud.deleteDefinitionById(req, nodeId);
    }

    if (nodeType === this.STANDARD_COLLECTIONS_DESCRIPTION.associations.name) {
        return this.associationCrud.removeAssociation(nodeId);
    }

    if (nodeType === this.STANDARD_COLLECTIONS_DESCRIPTION.associationTasks.name) {
        return this.associationTasksCrud.removeTaskById(nodeId);
    }

    if (nodeType === this.STANDARD_COLLECTIONS_DESCRIPTION.associationDetails.name) {
        await this.associationCrud.removeAssociationsByAssocDetailsId(nodeId);
        await this.associationCrud.removeAssocDetail(nodeId);
    }

    if (nodeType === this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name) {
        return this.dataCrudService.deleteNode(req, this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name,
            {query: {_id: new ObjectId(nodeId)}});
    }

    return this.dataCrudService.deleteNode(req, nodeType, {nodeId});
  }

  public async createNode(req: Request, nodeType: string, nodeData) {
    const nodeInfo = this.getCollectionNameWithoutDiff(nodeType);
    return this.dataCrudService.createNode(req, nodeInfo, nodeData);
  }

  public async updateNode(req: Request, nodeType, nodeData) {
    const nodeInfo = this.getCollectionNameWithoutDiff(nodeType);
    return this.dataCrudService.updateNode(req, nodeInfo, nodeData);
  }

  private getCollectionNameWithoutDiff(nodeType: string) {
    if (nodeType.endsWith(':diff')) {
      nodeType = nodeType.replace(':diff', '');
    }

    return nodeType;
  }
}

