import { httpService, HttpService } from '../http/http.service';


export class SchemaRelatorsFetchService {

  constructor(
    private httpService: HttpService,
    // private currentSupplier: CurrentSupplier
  ) {
  }

  getRelatorChoice(schemaName: string, path: string, limitWithIdList?: Array<string>): Promise<any> {
    return this.httpService.post('/api/relator',
      {schema: schemaName, path: path, limitWithIdList: limitWithIdList})
      .then((result : any) => {
        return result.data;
      })
      .then((data: any) => {
        return this._sortAlphanumeric(data);
      });
  }

  getRelatorChoiceInBulk(params: Array<any>): Promise<any> {
    return this.httpService.post('/api/relators/bulk', params)
      .then((result: any) => {
        return result.data;
      });
  }

  private _sortAlphanumeric(relatorData: Array<any>) {
    return relatorData.sort(function sortFunction(item1: any, item2: any) {
      let name1 = item1.title ? item1.title.toLowerCase() : item1.title;
      let name2 = item2.title ? item2.title.toLowerCase() : item2.title;

      if (name1 < name2) { return -1; }
      if (name1 > name2) { return 1; }
      return 0;
    });
  }
}


export const schemaRelatorsFetchService = new SchemaRelatorsFetchService(httpService);
