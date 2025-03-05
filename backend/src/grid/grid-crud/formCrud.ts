import { IDataCrud } from '../../db';


export class FormCrud {
  constructor(private dataCrud: IDataCrud) {
  }

  async get(req: Request, collectionName: string, id: string): Promise<any> {
    const queryParams = {query: {_doc: id}};
    return this.dataCrud.querySingleNode(req, collectionName, queryParams);
  }

  async delete(req: Request, collectionName: string, id: string): Promise<any> {
    const queryParams = {nodeId: id};
    return this.dataCrud.deleteNode(req, collectionName, queryParams);
  }

  async create(req: Request, collectionName: string, item): Promise<any> {
    return this.dataCrud.createNode(req, collectionName, item);
  }

  async update(req: Request, collectionName: string, item): Promise<any> {
    return this.dataCrud.updateNode(req, collectionName, item);
  }
}

