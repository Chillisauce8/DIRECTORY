import * as _ from 'lodash';
import { ICrudOptions, IDataCrud, IQueryParams } from '../../db';
import { RequestHelper } from '../../utils';


export abstract class GridCrud {

  constructor(protected dataCrudService: IDataCrud, protected requestHelper: RequestHelper) {
  }

  abstract getDataList(req: Request, gridConfig): Promise<any[]>;

  protected async queryData(req: Request, collectionName: string): Promise<any[]> {
    const pagination = this.requestHelper.parseRequestPaginationParams(req);
    const query = this.requestHelper.parseRequestFiltrationParams(req);
    const fields = this.requestHelper.parseRequestFieldsParams(req);

    if (fields && !_.isEmpty(fields)) {
      query['_fields'] = fields;
    }

    const queryParams: IQueryParams = {
      query,
      pagination,
    };

    const options: ICrudOptions = {readFromCache: false, updateCache: false};

    return this.dataCrudService.queryNodes(req, collectionName, queryParams, options);
  }
}
