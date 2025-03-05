import {BaseCacheProvider} from './base';
import * as _ from 'lodash';


export class MemoryCacheProvider extends BaseCacheProvider {
    private valueMap = null;
    private expirationTimeMap = null;

    init() {
        this.valueMap = {};
        this.expirationTimeMap = {};
    }

    async read(key): Promise<any> {
        let preparedKey = this._prepareKey(key);

        let value = this.valueMap[preparedKey];

        let expirationTime = this.expirationTimeMap[preparedKey];

        if (expirationTime)
        {
            let now = new Date().getTime();
            if (now > expirationTime)
            {
                delete this.valueMap[preparedKey];
                delete this.expirationTimeMap[preparedKey];
                value = null;
            }
        }

        if (value) {
            return JSON.parse(value);
        }

        return value;
    }

    async write(key, value, seconds: number): Promise<any> {
        let preparedKey = this._prepareKey(key);
        let preparedValue = JSON.stringify(value);

        this.valueMap[preparedKey] = preparedValue;

        if (seconds > -1)
        {
            this.expirationTimeMap[preparedKey] = new Date().getTime() + (seconds * 1000);
        }
    }

    async remove(key: string | Array<string>): Promise<any> {
        let removeKeys: Array<string> = <Array<string>>key;

        if (_.isString(key)) {
            removeKeys = [<string>key];
        }

        removeKeys = removeKeys.map(item => this._prepareKey(item));

        removeKeys.forEach(key => {
            delete this.valueMap[key];
            delete this.expirationTimeMap[key];
        });
    }

    async keys(prefix): Promise<any> {
        let keys = [];

        for (let k in this.valueMap)
        {
            if (k.indexOf(prefix) > -1)
            {
                keys.push(k);
            }
        }

        return this._clearKeys(keys);
    }

    async invalidate(prefix): Promise<any> {
        return this.keys(prefix).then((keys: Array<string>) => {
            return this.remove(keys);
        });
    }
}
