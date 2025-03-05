import * as _ from 'lodash';
import * as BBPromise from 'bluebird';
import { RedisHelper } from './redis/redisHelper';
import {coreServiceLocator} from '../serviceLocator';

const constant = require('../const');


const privateSettings = coreServiceLocator.get('privateSettings');


export class CacheHelper {
  private readonly _commonDataPrefix = 'DATA@';
  private readonly _userTokenPrefix = "USERTOKEN@";
  private readonly _userServiceDataPrefix = "USERSVCDATA@";
  private readonly _eventCountCommonPrefix = 'EVENT_COUNT@';

  constructor(private redisHelper: RedisHelper) {
  }

  createCommonDataQueryCacheKey(query, pagination, sysparam) {
    return this._commonDataPrefix + 'LIST@' + query['_type'] + '@' + JSON.stringify(query) + '@' +
      JSON.stringify(pagination)
      + (sysparam ? '@' + JSON.stringify(sysparam) : '');
  }

  createCommonDataQueryCacheKey2(nodeType, query, pagination) {
    return this._commonDataPrefix + 'LIST@' + nodeType + '@' + JSON.stringify(query) + '@' +
      JSON.stringify(pagination);
  }

  createEventCountCacheKey(query) {
    return this._commonDataPrefix + this._eventCountCommonPrefix + JSON.stringify(query);
  }

  createCommonDataReadCacheKey(nodeType, nodeId) {
    return this._commonDataPrefix + nodeType + '@' + nodeId;
  }

  createUserTokenCacheKey(token) {
    return this._userTokenPrefix + token;
  }

  createUserServiceDataCacheKey(userId) {
    return this._userServiceDataPrefix + userId;
  };

  createRelatorsListCacheKey(type, query) {
    return this._commonDataPrefix + 'RELATORs@' + type + '@' + JSON.stringify(query);
  };

  createCustomCacheKey = function (...args: any[]) {
    const _args = Array.prototype.slice.call(arguments, 0);
    const validParams = _.filter(_args, function (item) {
      return item !== undefined && item !== '';
    });

    return validParams.join('@');
  };

  createCustomProcessedDataCacheKey(...args: any[]) {
    // @ts-ignore
    return this._commonDataPrefix + this.createCustomCacheKey.apply(null, args);
  };

  writeToCache(req, key, value, seconds=privateSettings.CACHE.defaultNodesTimeout) {
    if (!req.cache) {
      throw('No cache');
    }

    return req.cache.write(key, value, seconds);
  }

  batchWriteToCache(req, data) {
    return this._batchCacheAction(req, data, function (cache, item) {
      return cache.write(item.key, item.value, item.seconds);
    });
  }

  batchRemoveFromCache(req, keyList) {
    return this._batchCacheAction(req, keyList, function (cache, item) {
      return cache.remove(item);
    });
  }

  readFromCache(req, key) {
    if (!req.cache) {
      throw({message: 'cache is not initialized'});
    }

    return req.cache.read(key);
  }

  async readOrCreateCache(req, key, promiseToFillData) {
    let value = await this.readFromCache(req, key);

    if (value) {
      return value;
    }

    let result = await promiseToFillData();

    if (_.isNil(result)) {
      return null;
    }

    await this.writeToCache(req, key, result, privateSettings.CACHE.defaultNodesTimeout);

    return result;
  }

  removeFromCache(req, key) {
    if (!req.cache) {
      throw('No cache');
    }

    return req.cache.remove(key);
  }

  invalidateCache(req, prefix) {
    if (!req.cache) {
      throw('No cache');
    }

    return req.cache.invalidate(prefix);
  }

  getKeysByPrefix(req, prefix) {
    if (!req.cache) {
      throw('No cache');
    }

    return req.cache.keys(prefix);
  }

  invalidateForNodeType(req, nodeType) {
    return BBPromise.all(this._getInvalidateForNodeTypePromiseList(req, nodeType));
  }

  async invalidateForNodeChanged(req, type, id) {
    const clearCachePromiseList = this._getClearCacheByPrefixPromises(req, type);
    clearCachePromiseList.push(this.invalidateCache(req, this.createCommonDataReadCacheKey(type, id)));

    return BBPromise.all(clearCachePromiseList)
      .then(() => true);
  }

  async invalidateForNodeTypeList(req, nodeTypeList) {
    if (nodeTypeList && nodeTypeList.length) {
      let tasks: any[] = [];
      nodeTypeList.forEach((item) => {
        tasks = tasks.concat(this._getInvalidateForNodeTypePromiseList(req, item));
      });

      return BBPromise.all(tasks);
    }

    return BBPromise.resolve(null);
  }

  invalidateEventCountCache(req) {
    const prefix = this._commonDataPrefix + this._eventCountCommonPrefix;

    return this.invalidateCache(req, prefix);
  }

  clearAllCommonData(req) {
    return this.invalidateCache(req, this._commonDataPrefix);
  }

  clearAllData(req) {
    return this.invalidateCache(req, '');
  }

  clearDataByPrefix(req, prefix, clearAll=false) {
    let clearCachePromiseList = this._getClearCacheByPrefixPromises(req, prefix, clearAll);

    return BBPromise.all(clearCachePromiseList)
      .then(() => true);
  }

  clearDataByFullKey(req, key)  {
    const keyToClear = this._commonDataPrefix + key;

    return this.invalidateCache(req, keyToClear);
  }

  getTTLByKey(key) {
    return this.redisHelper.getTTL(key);
  }

  private _createCommonDataInvalidateCacheKey(nodeType) {
    return this._commonDataPrefix + nodeType;
  }

  private _createCommonRelatorInvalidateCacheKey(nodeType) {
    return this._commonDataPrefix + 'RELATORs@' + nodeType + '@';
  }

  private _createCommonListInvalidateCacheKey(nodeType) {
    return this._commonDataPrefix + 'LIST@' + nodeType + '@';
  }

  private _batchCacheAction(req, dataList, action) {
    if (!req.cache) {
      throw('No cache');
    }

    if (!dataList) {
      throw('No data');
    }

    return BBPromise.each(dataList, item => {
      return action(req.cache, item);
    });
  }

  private _getInvalidateForNodeTypePromiseList(req, nodeType): any[] {
    const publicDataType = constant.dataTypesToCollectionPublicNames[nodeType] || nodeType;
    const privateDataType = constant.publicNamesToDataTypes[nodeType] || nodeType;

    let result = [
      this.invalidateCache(req, this._createCommonDataInvalidateCacheKey(privateDataType)),
      this.invalidateCache(req, this._createCommonRelatorInvalidateCacheKey(privateDataType)),
      this.invalidateCache(req, this._createCommonListInvalidateCacheKey(privateDataType)),
    ];

    if (publicDataType !== privateDataType) {
      result = [
        ...result,
        this.invalidateCache(req, this._createCommonDataInvalidateCacheKey(publicDataType)),
        this.invalidateCache(req, this._createCommonRelatorInvalidateCacheKey(publicDataType)),
        this.invalidateCache(req, this._createCommonListInvalidateCacheKey(publicDataType)),
      ];
    }

    return result;
  }

  private _getClearCacheByPrefixPromises(req, prefix, clearAll=false) {
    const publicDataType = constant.dataTypesToCollectionPublicNames[prefix] || prefix;
    const privateDataType = constant.publicNamesToDataTypes[prefix] || prefix;


    let clearCachePromiseList = [
      this.invalidateCache(req, this._createCommonRelatorInvalidateCacheKey(publicDataType)),
      this.invalidateCache(req, this._createCommonListInvalidateCacheKey(publicDataType)),
      // r.invalidateCache(req, _createCommonDataInvalidateCacheKey(publicDataType)),
    ];

    if (clearAll) {
      clearCachePromiseList.push(this.invalidateCache(req, this._createCommonDataInvalidateCacheKey(publicDataType)));
    }

    if (publicDataType !== privateDataType) {
      clearCachePromiseList = [...clearCachePromiseList,
        this.invalidateCache(req, this._createCommonRelatorInvalidateCacheKey(privateDataType)),
        this.invalidateCache(req, this._createCommonListInvalidateCacheKey(privateDataType)),
        // this.invalidateCache(req, this._createCommonDataInvalidateCacheKey(privateDataType))
      ];

      if (clearAll) {
        clearCachePromiseList.push(this.invalidateCache(req, this._createCommonDataInvalidateCacheKey(privateDataType)));
      }
    }

    return clearCachePromiseList;
  }
}
