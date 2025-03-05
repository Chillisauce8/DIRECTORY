import {RedisCacheProvider} from './providers/redis';
import {MemoryCacheProvider} from './providers/memory';
import {getRedisClient} from './redis/redisConnectHelper';


const privateSettings = require('../../privateSettings');


module.exports = function() {
    let cacheObject;

    if (privateSettings.CACHE.type === "redis") {
        cacheObject = new RedisCacheProvider(getRedisClient());
    } else {
        cacheObject = new MemoryCacheProvider();
    }

    cacheObject.init();

    return (req, res, next) => {
        req.cache = cacheObject;
        next();
    };
};
