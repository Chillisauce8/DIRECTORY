import { DefinitionCrud, type IDataCrud, type IQueryParams } from '../db';
import { RequestHelper } from '../utils';
// import { PermissionAction, PermissionsHelper, PermissionView } from '../../auth/permissions-helper';
import { ERROR_REASON } from '../const';
import { ObjectId } from 'mongodb';



export class DataApiHelper {

  constructor(private dataCrud: IDataCrud,
              private definitionCrud: DefinitionCrud,
              private requestHelper: RequestHelper,
              // private permissionsHelper: PermissionsHelper
  ) {

  }

  async dataQuery(req: Request) {
    const apiName = req['query']['api-name'];
    const collectionName = req['query']['collection'];
    const valueId = req['query']['value-id'];

    const data = await this.collectionDataQuery(req, collectionName, apiName, valueId);

    return data;
  }

  async prepareQueryByApiName(definition: any, apiName: string): Promise<IQueryParams> {
    const apiDescription = definition?.api.find(item => item.name === apiName);

    if (!apiDescription) {
      return null;
    }

    const query = apiDescription['query'] || {};
    const pagination = apiDescription.pagination;

    query._fields = query._fields || {};

    if (apiDescription.include) {
      apiDescription.include.forEach(item => {
        query._fields[item] = 1;
      });
    } else if (apiDescription.exclude) {
      apiDescription.exclude.forEach(item => {
        query._fields[item] = 0;
      });
    }

    return {query, pagination};
  }

  async prepareQueryByParams(req: Request, valueId: string): Promise<IQueryParams> {
    let query, pagination, aggregate;

    if (valueId) {
      query = {_id: new ObjectId(valueId)};
      query._fields = this.requestHelper.parseRequestFieldsParams(req) || {};
    } else {
      query = this.requestHelper.parseRequestFiltrationParams(req);
      query._fields = this.requestHelper.parseRequestFieldsParams(req) || {};
      pagination = this.requestHelper.parseRequestPaginationParams(req);
      aggregate = this.requestHelper.parseAggregation(req);
    }

    return {query, pagination, aggregate};
  }

  async dataCreateForCollection(req: Request, collectionName: string, nodeData: any) {
    const collection = await this.getCollectionByName(req, collectionName);

    if (!collection) {
      return null;
    }

    return this.dataCrud.createNode(req, collectionName, nodeData);
  }

  async dataUpdateForCollection(req: Request, collectionName: string, nodeData: any) {
    const collection = await this.getCollectionByName(req, collectionName);

    if (!collection) {
      return null;
    }

    return this.dataCrud.updateNode(req, collectionName, nodeData);
  }

  async dataDelete(req: Request, collectionName: string, nodeId: string) {
    const collection = await this.getCollectionByName(req, collectionName);

    if (!collection) {
      return null;
    }

    return this.dataCrud.deleteNode(req, collectionName, {nodeId});
  }

  async dataGet(req: Request, collectionName: string, nodeId: string) {
    const collection = await this.getCollectionByName(req, collectionName);

    if (!collection) {
      return null;
    }

    const fields = this.requestHelper.parseRequestFieldsParams(req) || {};

    if (fields) {
      return this.dataCrud.querySingleNode(req, collectionName,
        {query: {_id: new ObjectId(nodeId), _fields: fields}});
    }

    return this.dataCrud.readNode(req, collectionName, {nodeId});
  }

  private async getCollectionByName(req: Request, collectionName: string) {
    const collection = await this.definitionCrud.getDefinitionByType(req, collectionName);

    if (!collection) {
      return null;
    }

    return collection;
  }

  private async collectionDataQuery(req: Request, collectionName: string, apiName: string, valueId?: string) {
    const collection = await this.getCollectionByName(req, collectionName);

    if (!collection) {
      throw Error('No collection with name: ' + collectionName);
    }

    let hasPermission;

    // if (collection.skipPermission?.read?.page === true) {
    //   hasPermission = true
    // } else {
    //   hasPermission = await this.permissionsHelper.userHasReadPermissionsFor(req, {
    //     name: collectionName,
    //     action: PermissionAction.read,
    //     view: PermissionView.page,
    //   });
    // }
    //
    // if (!hasPermission) {
    //   throw {
    //     reason: ERROR_REASON.genericAuthError,
    //     errors: 'Forbidden',
    //   };
    // }

    let resultQuery: IQueryParams;

    if (apiName) {
      resultQuery = await this.prepareQueryByApiName(collection, apiName);
    } else {
      resultQuery = await this.prepareQueryByParams(req, valueId);
    }

    if (valueId) {
      return this.dataCrud.querySingleNode(req, collectionName, resultQuery);
    } else if (resultQuery.aggregate) {
      return this.dataCrud.queryAggregate(req, collectionName, {query: resultQuery.aggregate});
    } else {
      return this.dataCrud.queryNodes(req, collectionName, resultQuery);
    }
  }
}
