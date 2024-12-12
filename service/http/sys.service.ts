import { httpService, HttpService } from './http.service';


export interface ITouchConfig {
  type?: string;
  nodeId?: string;
  targetId?: string;
}


export class SysService {

  constructor(private httpService: HttpService) {
    //
  };

  private schemasCache = {};

  async getSchema(name : string): Promise<any> {
    if (this.schemasCache[name]) {
      return this.schemasCache[name];
    }

    return this.httpService.get('/api/sys/definitions/' + name)
      .then((data : any) => {
        this.schemasCache[name] = data.data;
        return data.data;
      });
  }

  async getAllSchemas(): Promise<any> {
    return this.httpService.get('/api/sys/definitions')
      .then((data : any) => {
        return data.data;
      })
      .then((data: any) => {
        return this._sortAlphanumeric(data);
      });
  }

  private _sortAlphanumeric(relatorData: any[]): any[] {
    return relatorData.sort(function sortFunction(item1: any, item2: any) {
      let name1 = item1.title ? item1.title.toLowerCase() : item1.title;
      let name2 = item2.title ? item2.title.toLowerCase() : item2.title;

      if (name1 < name2) { return -1; }
      if (name1 > name2) { return 1; }
      return 0;
    });
  }
}


export const sysService = new SysService(httpService);
