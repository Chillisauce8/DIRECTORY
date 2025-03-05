import { coreServiceLocator } from '../serviceLocator';
import { RedisHelper, redisHelperFactory } from './redis/redisHelper';
import { getRedisClient } from './redis/redisConnectHelper';


export async function initCacheServices() {
    const {CacheHelper} = await import('./cacheHelper');

    const redisHelper: RedisHelper = redisHelperFactory(getRedisClient());
    coreServiceLocator.register('redisHelper', redisHelper);

    const cacheHelper = new CacheHelper(redisHelper);
    coreServiceLocator.register('cacheHelper', cacheHelper);
}
