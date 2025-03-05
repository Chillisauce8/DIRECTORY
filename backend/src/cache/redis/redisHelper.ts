import Redis from 'ioredis';
import * as _ from 'lodash';


export class RedisHelper {
  constructor(private client: Redis) {}

  async get(key: string) {
    if (!this.client) {
      return null;
    }

    return this.client.get(key);
  }

  async getJSON(key: string) {
    if (!this.client) {
      return null;
    }

    try {
      const value = await this.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value);
    } catch (e) {
      console.log('Redis get error: ' + e);

      return null;
    }
  }

  async setJSON(key: string, value: any, seconds: number) {
    if (!this.client) {
      return;
    }

    try {
      const stringValue = JSON.stringify(value);

      if (seconds) {
        return this.client.set(key, stringValue, 'EX', seconds);
      } else {
        return this.client.set(key, stringValue);
      }
    } catch (e) {
      console.log('Redis set error: ' + e);
    }
  }

  async remove(key: string | string[]) {
    const keyListToRemove: string[] = typeof key === 'string' ? [key] : key;

    if (!keyListToRemove?.length) {
      return;
    }

    const chunkSize = 100;
    const chunkListOfKeyListToRemove: string[][] = _.chunk(keyListToRemove, chunkSize);

    const promiseList = chunkListOfKeyListToRemove
      .map(chunkOfKeyListToRemove => this.client.unlink(chunkOfKeyListToRemove));

    return Promise.all(promiseList);
  }

  async getKeys(match= '*', count= 10) {
    return new Promise((resolve, reject) => {
      const resultArray = [];

      const stream = this.client.scanStream({match, count});

      stream.on("error", (err) => {
        stream.removeAllListeners('data');
        stream.removeAllListeners('error');

        stream.destroy();

        reject(err);
      });

      stream.on("data", (resultKeys) => {
        resultArray.push(...resultKeys);
      });

      stream.on("end", () => {
        const uniqKeys = [...new Set(resultArray)];

        resolve(uniqKeys);
      });
    });
  }

  async getTTL(key: string) {
    return this.client.ttl(key);
  }
}


export function redisHelperFactory(client: Redis) {
  return new RedisHelper(client);
}