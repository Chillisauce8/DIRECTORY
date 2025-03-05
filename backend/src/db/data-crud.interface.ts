import type { Query } from './mongo/client';


export interface IBaseQueryParams {
    query?: Query;
    pagination?: Object;
    aggregate?: Array<Object>;
}


export interface IQueryParams extends IBaseQueryParams {
    nodeId?: string;
}


export interface ICrudBaseOptions {
    useRawCollectionName?: boolean;
}


export interface ICrudOptions extends ICrudBaseOptions {
    readFromCache?: boolean;
    updateCache?: boolean;
    updateCacheTimeoutSec?: number;
}


export interface ICrudWriteOptions extends ICrudBaseOptions {
    ignoreDiff?: boolean;
    ignoreRelators?: boolean;
    ignoreEventSending?: boolean;
    ignoreStateRestore?: boolean;
    ignoreLastUpdatedInfo?: boolean;
    ignoreIDSet?: boolean;
    updateCache?: boolean;
    onIDSet?: {(nodeWithDoc: any): any;}
}


export interface IDataCrud {
    readNode(req: Request, collectionName: string, queryParams: IQueryParams, options?: ICrudOptions): Promise<any>;
    queryNodes(req: Request, collectionName: string, queryParams: IBaseQueryParams, options?: ICrudOptions): Promise<any>;
    queryNodeCount(req: Request, collectionName: string, queryParams: IBaseQueryParams): Promise<any>;
    querySingleNode(req: Request, collectionName: string, queryParams: IBaseQueryParams, options?: ICrudOptions): Promise<any>;
    queryAllAvailableNodes(req: Request, collectionName: string, queryParams: IBaseQueryParams, options?: ICrudOptions): Promise<any>;
    queryAggregate(req: Request, collectionName: string, query, options?: ICrudOptions): Promise<any>;
    createNode(req: Request, collectionName: string, nodeBody, options?: ICrudWriteOptions): Promise<any>;
    updateNode(req: Request, collectionName: string, nodeBody, options?: ICrudWriteOptions): Promise<any>;
    insertNodeArray(req: Request, collectionName: string, dataList: any[], options?: ICrudWriteOptions): Promise<any>;
    mergeNode(req: Request, collectionName: string, nodeBody, options?: ICrudWriteOptions): Promise<any>;
    deleteNode(req: Request, collectionName: string, queryParams: IQueryParams, options?: ICrudWriteOptions): Promise<any>;
    deleteNodes(req: Request, collectionName: string, queryParams: IQueryParams, options?: ICrudWriteOptions): Promise<any>;
    getCollectionList(req: Request): Promise<any>;
}
