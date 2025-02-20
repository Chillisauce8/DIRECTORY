import { serviceComposableFactory } from '~/service/service-composable-factory';
import type { HttpService } from '~/service/http/http.service';
import { httpService } from '~/service/http/http.service';

// Add MongoDB specific types
export interface MongoQuery {
    $exists?: boolean;
    $all?: any[];
    $in?: any[];
    $gt?: number;
    $gte?: number;
    $lt?: number;
    $lte?: number;
    $ne?: any;
    $or?: Record<string, any>[];
    $and?: Record<string, any>[];
    [key: string]: any;
}

export interface MongoQueryOptions {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    fields?: Record<string, 1 | 0>;
}

export type DbNodeIDFields = '_id';

export interface DbNode {
    _id: string;
    [prop: string]: any;
}

export interface Listing<T extends DbNode = any> {
    _id: string; // Changed from id to _id
    name: string;
    dbNode: T;
    [key: string]: any;
}

export class DbNodeCRUDService {
    constructor(private httpService: HttpService) {}

    async getList<Node extends DbNode = any>(
        collectionName: string, 
        query?: Record<string, MongoQuery>,
        options?: MongoQueryOptions
    ): Promise<Node[]> {
        const queryParams: any = { 
            collection: collectionName,
            query: query || {},
            ...options
        };

        return this.httpService.get<Node[]>('/api/query', queryParams)
            .then(({ data = [] }) => data as Node[]);
    }

    async get(collectionName: string, id: string): Promise<DbNode> {
        return this.httpService.get<DbNode>(`/api/get/${collectionName}/${id}`).then(({ data }) => data as DbNode);
    }

    async create<Node extends DbNode = any>(collectionName: string, dbNode: Omit<DbNode, DbNodeIDFields>): Promise<Node> {
        return this.httpService.post<Node>(`/api/create/${collectionName}`, dbNode).then(({ data }) => data as Node);
    }

    async update<Node extends DbNode = any>(collectionName: string, dbNode: DbNode): Promise<Node> {
        return this.httpService.update<Node>(`/api/update/${collectionName}`, dbNode).then(({ data }) => data as Node);
    }

    async delete<T extends DbNode>(collection: string, node: T): Promise<T> {
        try {
            const response = await this.httpService.delete(`${collection}/${node._id}`);
            if (!response) {
                throw new Error('Delete request failed - no response');
            }
            return node; // Return original node on successful delete
        } catch (error) {
            console.error('DbNodeCRUD delete failed:', error);
            throw error;
        }
    }

    // Add batch operations for better performance
    async batchCreate<Node extends DbNode = any>(
        collectionName: string, 
        nodes: Omit<DbNode, DbNodeIDFields>[]
    ): Promise<Node[]> {
        return this.httpService.post<Node[]>(
            `/api/batch-create/${collectionName}`, 
            nodes
        ).then(({ data }) => data as Node[]);
    }

    // Add caching support
    private cache = new Map<string, any>();
    
    async getCached<Node extends DbNode = any>(
        collectionName: string, 
        id: string,
        ttl = 60000 // 1 minute cache
    ): Promise<Node> {
        const cacheKey = `${collectionName}:${id}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const result = await this.get(collectionName, id);
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), ttl);
        return result as Node;
    }
}

export const useDbNodeCRUDService = serviceComposableFactory('dbNodeCRUDService', () => {
    return new DbNodeCRUDService(httpService);
});
