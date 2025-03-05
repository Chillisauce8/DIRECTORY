import Redis from 'ioredis';
let Redlock = require('redlock');

import {coreServiceLocator} from '../serviceLocator';


let redlock;


export interface LockInstance {
    release(): Promise<any>
    extend(duration: number): Promise<any>
}


export type LockResourceKey = string;
export type LockTTL = number;
export type FnToCallWithLock<Data extends unknown = any> = (lockInstance?: LockInstance) => Promise<Data>;


export function initRedisLock(client: Redis) {

    const privateSettings = coreServiceLocator.get('privateSettings');

  if (privateSettings.CACHE.type !== 'redis') {
    return;
  }

  if (!client) {
    return;
  }

  redlock = new Redlock([client], {
    retryCount: 50,
    retryDelay: 1000 // time in ms
  });
}


export const DEFAULT_LOCK_TIME = 30000;

let i = 0;


export async function processWithLock<Data extends unknown = any>(resourceKey: LockResourceKey,
                                                                  ttl: LockTTL,
                                                                  functionToCall: FnToCallWithLock<Data>): Promise<Data> {
    const loggingHelper = coreServiceLocator.get('loggingHelper');
    if (!redlock) {
        const functionResult = await functionToCall();
        return functionResult;
    }

    let lockInstance;

    try {
        i++;
        lockInstance = await redlock.lock('lock:' + resourceKey, ttl + i);
        const functionResult = await functionToCall(lockInstance);
        await redlock.unlock(lockInstance);

        return functionResult;
    } catch(error) {
        if (!lockInstance) {
            throw error;
        }

        redlock.unlock(lockInstance);
        loggingHelper.toLogError(error);
        throw error;
    }
}
