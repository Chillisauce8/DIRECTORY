import { httpService, HttpService } from '../http/http.service';


export class SchemaRelatorsFetchService {

  constructor(
    private httpService: HttpService,
    // private currentSupplier: CurrentSupplier
  ) {
  }

  /**
   * Fetches relator choices for a given schema and path
   * @param schemaName Name of the schema to fetch from
   * @param path Path within schema to fetch
   * @param limitWithIdList Optional list of IDs to limit results
   * @returns Promise resolving with sorted relator choices
   */
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

  /**
   * Fetches multiple relator choices in bulk
   * @param params Array of bulk request parameters
   * @returns Promise resolving with bulk relator data
   */
  getRelatorChoiceInBulk(params: Array<any>): Promise<any> {
    return this.httpService.post('/api/relators/bulk', params)
      .then((result: any) => {
        return result.data;
      });
  }

  /**
   * Sorts relator data alphabetically by title
   * @param relatorData Array of relator items to sort
   * @returns Sorted array of relator items
   */
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
