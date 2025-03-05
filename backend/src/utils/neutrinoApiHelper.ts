import {coreServiceLocator} from '../serviceLocator';
import {CacheHelper} from '../cache/cacheHelper';
import { IpHelper } from './ip-helper';

let request = require('request-promise');


const privateSettings = coreServiceLocator.get('privateSettings');


export class NeutrinoApiHelper {

  constructor(private ipHelper: IpHelper,
              private cacheHelper: CacheHelper) {
    //
  }

  private _baseUrl: string = 'https://neutrinoapi.com';

  private _ipInfoCachePrefix: string = 'IP_INFO';
  private _ipInfoCacheSuffix: string = '$';
  private _ipInfoCacheTtl: number = 600;

  async getIpInfo(req: Request): Promise<string> {
    let ipAddr = req['ip'];

    if (!this.ipHelper.isIpAddressValid(ipAddr)) {
      return null;
    }

    let cacheKey = this._createCacheKey(req, ipAddr);

    let ipInfoFromCache = await this.cacheHelper.readFromCache(req, cacheKey);

    if (ipInfoFromCache) {
      return ipInfoFromCache;
    }

    let response = await request({
      url: this._getUrlForGetResponse('ip-info') + `&ip=${ipAddr}`,
      method: 'GET',
      json: true
    });

    await this.cacheHelper.writeToCache(req, cacheKey, response, this._ipInfoCacheTtl);

    return response;
  }

  async validatePhone(req: Request, phone: string): Promise<any> {
    let response = await request({
      url: this._baseUrl + '/phone-validate',
      body: {
        'user-id': privateSettings.NEUTRINO_API.userId,
        'api-key': privateSettings.NEUTRINO_API.apiKey,
        'output-format': 'JSON',
        'output-case': 'camel',
        'number': phone,
        'country-code': 'GB'
      },
      method: 'POST',
      json: true
    });

    return response;
  }

  parseUserAgent(userAgent: string): Promise<any> {
    return request({
      url: this._baseUrl + '/user-agent-info',
      method: 'POST',
      body: {
        'user-id': privateSettings.NEUTRINO_API.userId,
        'api-key': privateSettings.NEUTRINO_API.apiKey,
        'output-format': 'JSON',
        'output-case': 'camel',
        'user-agent': userAgent
      },
      json: true
    });
  }

  private _getUrlForGetResponse(api: string): string {
    return `${this._baseUrl}/${api}?user-id=${privateSettings.NEUTRINO_API.userId}&api-key=${privateSettings.NEUTRINO_API.apiKey}&output-format=JSON&output-case=camel`;
  }

  private _createCacheKey(req: Request, ip: string): string {
    return this.cacheHelper.createCustomCacheKey(
        this._ipInfoCachePrefix, ip, this._ipInfoCacheSuffix);
  }
}
