import {
  DEFAULT_LOCK_TIME,
  processWithLock
} from '../utils/lockHelper';
import type {
  LockResourceKey,
  LockTTL,
} from '../utils/lockHelper';
import {coreServiceLocator} from '../serviceLocator';
import { ObjectId } from 'mongodb';
import type { ICrudOptions, ICrudWriteOptions, IDataCrud, IQueryParams } from './data-crud.interface';



interface BaseDataNode {
  _id?: string;
}


export type DataCollectionCreateData<Data extends unknown> = Omit<Data, keyof BaseDataNode>;
export type DataCollectionMergeData<Data extends unknown> = BaseDataNode & Partial<Data>;
export type DataCollectionUpdatedDataGetter<Data extends unknown> = () => Promise<Data>;
export type DataCollectionDataForMergeGetter<Data extends unknown> = () => Promise<DataCollectionMergeData<Data>>;


export interface DataCollectionCrudLockParams {
  resourceKey: LockResourceKey;
  ttl?: LockTTL;
}


export abstract class DataCollectionCrud<Data extends unknown> {
  protected readonly privateSettings = coreServiceLocator.get('privateSettings');

  protected constructor(protected dataCrudService: IDataCrud) {}

  protected abstract getCollectionName(): string;
  protected abstract getPathOfNodeNameField(): string;


  public async getList(req: Request, query: IQueryParams, crudOptions?: ICrudOptions): Promise<Data[]> {
    return this.dataCrudService.queryAllAvailableNodes(
      this.getPreparedSwpRequest(req),
      this.getCollectionName(),
      query,
      this.getCrudOptions(crudOptions)
    );
  }

  public async get(req: Request, query: IQueryParams, crudOptions?: ICrudOptions): Promise<Data> {
    return this.dataCrudService.querySingleNode(this.getPreparedSwpRequest(req), this.getCollectionName(),
      query, this.getCrudOptions(crudOptions));
  }

  public async getById(req: Request, id: string, crudOptions?: ICrudOptions): Promise<Data> {
    const queryParams = {
      query: {_id: new ObjectId(id)},
    };

    return this.get(req, queryParams, crudOptions);
  }

  public async getByName(req: Request, name: string, crudOptions?: ICrudOptions): Promise<Data> {
    const queryParams = {
      query: {[this.getPathOfNodeNameField()]: name},
    };

    return this.get(req, queryParams, crudOptions);
  }

  public async create(req: Request, data: DataCollectionCreateData<Data>, crudOptions?: ICrudOptions): Promise<Data> {
    return this.dataCrudService.createNode(this.getPreparedSwpRequest(req), this.getCollectionName(),
      data, this.getCrudOptions(crudOptions));
  }

  public async update(req: Request, data: Data, crudOptions?: ICrudWriteOptions): Promise<Data> {
    return this.dataCrudService.updateNode(this.getPreparedSwpRequest(req), this.getCollectionName(),
      data, this.getCrudWriteOptions(crudOptions));
  }

  public async updateWithLock(req: Request,
                              crudLockParams: DataCollectionCrudLockParams,
                              dataGetter: DataCollectionUpdatedDataGetter<Data>,
                              crudOptions?: ICrudWriteOptions): Promise<Data> {
    const {resourceKey, ttl = DEFAULT_LOCK_TIME} = crudLockParams;

    const fn = async () => {
      const data = await dataGetter();

      return this.update(req, data, crudOptions);
    };

    return processWithLock<Data>(resourceKey, ttl, fn);
  }

  public async merge(req: Request,
                     data: DataCollectionMergeData<Data>,
                     crudOptions?: ICrudWriteOptions): Promise<Data> {
    return this.dataCrudService.mergeNode(this.getPreparedSwpRequest(req), this.getCollectionName(),
      data, this.getCrudWriteOptions(crudOptions));
  }

  public async mergeWithLock(req: Request,
                             crudLockParams: DataCollectionCrudLockParams,
                             dataGetter: DataCollectionDataForMergeGetter<Data>,
                             crudOptions?: ICrudWriteOptions): Promise<Data> {
    const {resourceKey, ttl = DEFAULT_LOCK_TIME} = crudLockParams;

    const fn = async () => {
      const organisation = await dataGetter();

      return this.merge(req, organisation, crudOptions);
    };

    return processWithLock<Data>(resourceKey, ttl, fn);
  }

  public async deleteById(req: Request, id: string, crudOptions?: ICrudOptions): Promise<void> {
    const queryParams = {
      nodeId: id,
    };

    return this.delete(req, queryParams, crudOptions);
  }

  public async delete(req: Request, queryParams: IQueryParams, crudOptions?: ICrudOptions): Promise<void> {
    return this.dataCrudService.deleteNode(this.getPreparedSwpRequest(req), this.getCollectionName(),
      queryParams, this.getCrudOptions(crudOptions));
  }

  protected getPreparedSwpRequest(req: Request): Request {
    return req;
  }

  protected getCrudOptions(crudOptionsExtension?: Partial<ICrudOptions>): ICrudOptions {
    return {
      ...(crudOptionsExtension ?? {}),
    };
  }

  protected getCrudWriteOptions(crudOptionsExtension?: ICrudWriteOptions): ICrudWriteOptions {
    return {
      ...(crudOptionsExtension ?? {}),
    };
  }
}
