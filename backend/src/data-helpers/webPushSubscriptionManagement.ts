import { CacheHelper } from '../cache/cacheHelper';
import {STANDARD_COLLECTIONS_DESCRIPTION} from "../collectionNames";
import { IDataCrud } from '../db';


export class WebPushSubscriptionManagement {

  constructor(private dataCrudService: IDataCrud, private cacheHelper: CacheHelper) {
  }

  public async create(req: Request, data): Promise<any> {
    let creationResult;

    try {
      creationResult = await this.dataCrudService.createNode(req,
          STANDARD_COLLECTIONS_DESCRIPTION.webPushSubscription.name, data);
    } catch (e) {
      throw e;
    }

    await this.invalidateSubscriptionCacheByUserId(req, data.userId);

    return creationResult;
  }

  public async findSubscriptionByEndpoint(req: Request, endpoint) {
    const queryParams = {
      query: {
        'subscription.endpoint': endpoint
      }
    };

    return this.dataCrudService.querySingleNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.webPushSubscription.name, queryParams);
  }

  public async findSubscriptionListByUserId(req: Request, userId): Promise<Array<any>> {
    const queryParams = {
      query: {userId}
    };

    return this.dataCrudService.queryAllAvailableNodes(req,
        STANDARD_COLLECTIONS_DESCRIPTION.webPushSubscription.name, queryParams);
  }

  public async delete(req: Request, nodeId: string) {
    return this.dataCrudService.deleteNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.webPushSubscription.name, {nodeId});
  }

  public async invalidateSubscriptionCacheByUserId(req: Request, userId) {
    const queryParams = {
      query: {userId}
    };

    const key = this.cacheHelper.createCommonDataQueryCacheKey2(
        STANDARD_COLLECTIONS_DESCRIPTION.webPushSubscription.name, queryParams.query, undefined);

    return this.cacheHelper.invalidateCache(req, key);
  }
}
