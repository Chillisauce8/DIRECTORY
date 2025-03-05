import { IDataCrud, IQueryParams } from '../db/data-crud.interface';
import {STANDARD_COLLECTIONS_DESCRIPTION} from '../collectionNames';


export class TemplateManagement {
  constructor(private dataCrudService: IDataCrud) {

  }

  async getByName(req: Request, name: string): Promise<any> {
    return this._queryByName(name, async query =>
        this.dataCrudService.querySingleNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.settings.name, query));
  }

  async getByNameFromDB(req: Request, name: string): Promise<any> {
    const options = {readFromCache: false, updateCache: false};
    return this._queryByName(name, async query =>
        this.dataCrudService.querySingleNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.settings.name, query, options));
  }

  private async _queryByName(name: string, queryFunc: Function): Promise<any> {
    const query: IQueryParams = {
      query: {'setting.name': name},
    };

    return queryFunc(query);
  }
}


