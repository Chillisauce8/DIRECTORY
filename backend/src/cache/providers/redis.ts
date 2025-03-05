import Redis from 'ioredis';
import {BaseCacheProvider} from './base';
import {RedisHelper, redisHelperFactory} from '../redis/redisHelper';


export class RedisCacheProvider extends BaseCacheProvider {
    private redisHelper: RedisHelper;

    constructor(private client: Redis) {
        super();
    }

    init() {
        this.redisHelper = redisHelperFactory(this.client);
    }

    async read(key): Promise<any> {
        let preparedKey = this._prepareKey(key);

        return this.redisHelper.getJSON(preparedKey);
    }

    async write(key, value, seconds: number): Promise<any> {
        const preparedKey = this._prepareKey(key);

        return this.redisHelper.setJSON(preparedKey, value, seconds);
    }

    async remove(key: string | Array<string>): Promise<any> {
        const keyListToRemove = typeof key === 'string' ? [key] : key;

        const preparedKyeListToRemove = keyListToRemove.map(item => this._prepareKey(item))

        return this.redisHelper.remove(preparedKyeListToRemove);
    }

    async keys(prefix): Promise<any> {
        const preparedPrefix = this._prepareKey(prefix) + '*';

        return this.redisHelper.getKeys(preparedPrefix, 50);
    }

    async invalidate(prefix): Promise<any> {
        const keyList = await this.keys(prefix);

        return this.redisHelper.remove(keyList);
    }
}
