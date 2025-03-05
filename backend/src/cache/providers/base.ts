import {ICacheProvider} from '../cacheProvider.interface';
var privateSettings = require('../../../privateSettings');


export abstract class BaseCacheProvider implements ICacheProvider {

    init() {
        //
    }

    async read(key): Promise<any> {
        //
    }

    async write(key, value, seconds: number): Promise<any> {
        //
    }

    async remove(key: string | Array<string>): Promise<any> {
        //
    }

    async keys(prefix): Promise<any> {
        //
    }

    async invalidate(prefix): Promise<any> {
        //
    }

    protected _prepareKey(key) {
        return privateSettings.CACHE.prefix + '/' + key;
    }

    protected _clearKeys(keys: Array<string>): Array<string> {
        return keys.map(item => item.replace(privateSettings.CACHE.prefix + '/', ''));
    }
}