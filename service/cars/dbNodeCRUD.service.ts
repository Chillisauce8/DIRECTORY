import {serviceComposableFactory} from '~/service/service-composable-factory';
import type {HttpService} from '~/service/http/http.service';
import {httpService} from '~/service/http/http.service';


export type DbNodeIDFields = '_id' | '_doc';


export interface DbNode {
  _id: string;
  _doc: string;
  [prop: string]: any;
}


export class DbNodeCRUDService {
  constructor(private httpService: HttpService) {}

  async getList<Node extends DbNode = any>(collectionName: string, query?: Record<string, any>): Promise<Node[]> {
    const queryParams: any = {collection: collectionName};

    if (query) {
      queryParams.query = query;
    }

    return this.httpService.get<Node[]>('/api/query', queryParams)
      .then(({data = []}) => data as Node[]);
  }

  async get(collectionName: string, id: string): Promise<DbNode> {
    return this.httpService.get<DbNode>(`/api/get/${collectionName}/${id}`)
      .then(({data}) => data as DbNode);
  }

  async create<Node extends DbNode = any>(collectionName: string,
                                          dbNode: Omit<DbNode, DbNodeIDFields>): Promise<Node> {
    return this.httpService.post<Node>(`/api/create/${collectionName}`, dbNode)
      .then(({data}) => data as Node);
  }

  async update<Node extends DbNode = any>(collectionName: string, dbNode: DbNode): Promise<Node> {
    return this.httpService.update<Node>(`/api/update/${collectionName}`, dbNode)
      .then(({data}) => data as Node);
  }

  async delete<Node extends DbNode = any>(collectionName: string, dbNode: DbNode): Promise<Node> {
    const id = dbNode?._doc ?? dbNode?._id;

    return this.httpService.delete<Node>(`/api/delete/${collectionName}/${id}`)
      .then(({data}) => data as Node);
  }
}


export const useDbNodeCRUDService = serviceComposableFactory('dbNodeCRUDService', () => {
  return new DbNodeCRUDService(httpService);
});
