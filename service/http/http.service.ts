import {AsyncData} from '#app';
import {AppConfig} from '@nuxt/schema';
import {getHttpInterceptorListByType, HttpInterceptorType, HttpInterceptorFetchOptions}
  from './interceptor.composibles';
import {getWindowSafe} from '../browser/browser.helpers';
// import {CurrentUser} from '../user-common/current-user.service';
import { isUndefined } from '../utils';
import { serverURL } from '~/environment';
// @ts-ignore
import { NitroFetchOptions } from 'nitropack';
import { $fetch } from 'ofetch';



export type HttpRequestHeaders = Record<string, string>;
export type HttpRequestQueryParams = Record<string, any>;
export type HttpRequestData = Record<string, any> | any[];

export type HttpResult<T> = Promise<HttpResponse<T>>;
export type QueryParams = Record<string, string | number | boolean | null>;

type AvailableHttpMethods = 'get' | 'post' | 'put' | 'delete';

export type OFetchOptions = NitroFetchOptions<any, AvailableHttpMethods>;


interface QueryCollectionParams {
  path?: string;
  limit?: any;
  skip?: any;
  filter?: any;
  sort?: any;
  headers?: HttpRequestHeaders;
  additionalParams?: Object;
  fields?: Object;
}


export interface BaseHttpResponseData {
  ok: boolean;
}



export type CustomHttpResponseData<Data extends unknown = any> = BaseHttpResponseData & {
  [Property in keyof Data]: Data[Property];
}


export interface CommonHttpResponseData<Data extends unknown = any> extends BaseHttpResponseData {
  ok: boolean;
  data?: Data;
}


export type HttpResponseData<Data extends unknown> =
  Data extends CustomHttpResponseData ? Data : CommonHttpResponseData<Data>;


export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface HttpOptions {
    headers?: Record<string, string>;
    params?: Record<string, string>;
    timeout?: number;
    withCredentials?: boolean;
}

export interface HttpResponse<T = any> {
    data?: T;
    status: number;
    headers?: Record<string, string>;
}

export interface HttpError extends Error {
    status?: number;
    response?: HttpResponse;
}

export interface HttpService {
    get<T>(url: string, options?: HttpOptions): Promise<HttpResponse<T>>;
    post<T>(url: string, data?: unknown, options?: HttpOptions): Promise<HttpResponse<T>>;
    put<T>(url: string, data?: unknown, options?: HttpOptions): Promise<HttpResponse<T>>;
    delete<T>(url: string, options?: HttpOptions): Promise<HttpResponse<T>>;
}


export class HttpService {
  private defaultHeaders: any = {};

  static _parseErrorResponse(response: AsyncData<any, any>): string {
    // @ts-ignore
    const data = response?.data || response._data;

    if (!data) {
      return 'Failed operation';
    }

    const responseData = unref(data);

    let error: any = responseData?.error || 'Failed operation';

    if (error instanceof Array) {
      const resultErrors = [];

      for (const e of error) {
        resultErrors.push(e.error || e.message || e);
      }

      error = resultErrors.join(', ');
    } else if (error?.errors) {
      // error = error;
    } else if (error && error['message']) {
      error = error['message'];
    } else if (responseData.message) {
      error = responseData.message;
    } else if (responseData.msg) {
      error = responseData.msg;
    }

    console.log((new Date()).toISOString(), 'error', 'HttpService', response?.url, error);

    return error;
  }

  constructor(private ofetch: typeof $fetch,
              // private currentUser: CurrentUser,
              ) {

  }

  public async rawGet(path: string,
                params?: HttpRequestQueryParams): Promise<string> {
    const requestConfig = {
      method: 'get' as AvailableHttpMethods,
      query: this.makeUrlSearchParamsFromObject(params),
      responseType: 'text' as 'text',
    };

    const optionsWithInterceptors = this.extendFetchOptionsWithInterceptorHandler<string>(path, requestConfig);
    const optionsWithInterceptorsAndServerBaseUrl = this.extendWithServerBaseUrl(optionsWithInterceptors);


    return this.ofetch<string>(path, optionsWithInterceptorsAndServerBaseUrl)
      .then(r => r as string)
      .catch(e => this.processError(e));
  }

  public async request<Data = any>(path: string,
                                  options: OFetchOptions): Promise<HttpResponseData<Data>> {
    return this.fetch(path, options);
  }

  public async get<Data = any>(path: string,
                               params?: HttpRequestQueryParams,
                               headers?: HttpRequestHeaders,
                               options?: OFetchOptions): Promise<HttpResponseData<Data>> {
    const requestConfig = {
      ...options,
      method: 'get' as AvailableHttpMethods,
      headers: path[0] === '/' ? this.extendDefaultHeaders(headers as HttpRequestHeaders) : null,
      query: this.makeUrlSearchParamsFromObject(params),
    };

    return this.fetch(path, requestConfig);
  }

  public async post<T>(path: string, data?: unknown, headers?: HttpRequestHeaders): HttpResult<T> {
    if (!path) throw new Error('Path is required for POST request');

    console.log('HTTP request:', {
        method: 'POST',
        path,
        body: data, // Log the full request body
        hasData: !!data,
        timestamp: new Date().toISOString()
    });

    const requestConfig = {
        method: 'post' as const,
        headers: this.extendDefaultHeaders(headers ?? {}),
        body: data
    };

    return this.fetch<T>(path, requestConfig).catch(this.handleError);
}

  public update<Data>(path: string,
                      data: HttpRequestData,
                      headers?: HttpRequestHeaders): Promise<HttpResponseData<Data>> {
    const requestConfig = {
      method: 'put' as AvailableHttpMethods,
      headers: this.extendDefaultHeaders(headers as HttpRequestHeaders),
      body: data,
    };

    return this.fetch(path, requestConfig);
  }

  public delete<Data = any>(path: string,
                            headers?: HttpRequestHeaders): Promise<HttpResponseData<Data>> {
    const requestConfig = {
      method: 'delete' as AvailableHttpMethods,
      headers: this.extendDefaultHeaders(headers as HttpRequestHeaders),
      body: []
    };

    return this.fetch(path, requestConfig);
  }


  public getCollectionNodeById<Data = any>(collectionName: string,
                                           nodeId: string,
                                           headers?: HttpRequestHeaders): Promise<HttpResponseData<Data>> {
    const path = `/api/query`;

    const requestConfig = {
      method: 'get' as AvailableHttpMethods,
      headers: headers,
      query: {
        'collection': collectionName,
        'value-id': nodeId,
      },
    };

    return this.fetch(path, requestConfig);
  }

  public queryCollection<Data = any>(collectionName: string,
                                     params: QueryCollectionParams): Promise<HttpResponseData<Data>> {
    let sort = params.sort;
    if (sort) {
      if (typeof sort === 'string') {
        const key: string = sort;
        sort = {};
        sort[key] = 1;
      }

      sort = JSON.stringify(sort);
    }

    let filter: any = params.filter;
    if (filter) {
      if (filter instanceof Array) {

        if (filter.length === 1) {
          filter = filter[0];
        } else if (filter.length > 1) {
          const _filter: any = {};
          _filter['$and'] = filter;
          filter = _filter;
        } else {
          filter = {};
        }
      }

      filter = JSON.stringify(filter);
    }

    let fields = params.fields;
    if (fields) {
      if (fields instanceof Array && fields.length > 0) {
        const _fields: any = {};
        fields.forEach(item => _fields[item] = 1);
        fields = _fields;
      }

      fields = JSON.stringify(fields);
    }

    const getParams = {/*'q': */filter, 'limit': params.limit, 'skip': params.skip, 'sort': sort, '_fields': fields};
    if (params.additionalParams) {
      Object.assign(getParams, params.additionalParams);
    }

    const path = params.path || `/api/query?collection=${collectionName}`;

    return this.get<Data>(path, getParams, params.headers);
  }

  protected async fetch<Data extends unknown, R extends 'json' | 'text' = 'json'>(path: string,
                                                                                  options: OFetchOptions): Promise<HttpResponseData<Data>> {
    const optionsWithInterceptors = this.extendFetchOptionsWithInterceptorHandler(path, options);
    const optionsWithInterceptorsAndServerBaseUrl = this.extendWithServerBaseUrl(optionsWithInterceptors);

    return this.ofetch<HttpResponseData<Data>>(path, optionsWithInterceptorsAndServerBaseUrl)
      .catch(e => this.processError(e));
  }

  protected extendWithServerBaseUrl(options: OFetchOptions): OFetchOptions {
    if (!process.server) {
      return {...options};
    }

    return {
      ...options,
      baseURL: serverURL,
    }
  }

  protected extendFetchOptionsWithInterceptorHandler<Data extends unknown>(path: string, options: OFetchOptions): OFetchOptions {
    return  {
      ...options,
      headers: this.extendDefaultHeaders((options?.headers ?? {}) as Record<string, string>),
      onRequest({options}) {
        const interceptorList = getHttpInterceptorListByType(HttpInterceptorType.request);

        let updatedOptions = {...options} as HttpInterceptorFetchOptions<HttpResponseData<Data>>;

        updatedOptions.path = path;

        for (const interceptor of interceptorList) {
          updatedOptions = interceptor.intercept(updatedOptions as any);
        }

        // @ts-ignore
        delete updatedOptions.path;

        Object.assign(options, updatedOptions);
      },
    };
  }

  protected makeUrlSearchParamsFromObject(params: any): Record<string, string> {
    const searchParams: any = {};

    for (const key in params) {
      const val = params[key];
      if (!params.hasOwnProperty(key) || isUndefined(val)) {
        continue;
      }

      if (val instanceof Array) {
        // val.forEach((item: any) => {
        //   const value = (typeof item === 'string') ? item : JSON.stringify(item);
        //   searchParams[key] = value;
        // });

        searchParams[key] = JSON.stringify(val);

        continue;
      }

      const value = (typeof val === 'string') ? val : JSON.stringify(val);

      searchParams[key] = value;
    }

    return searchParams;
  }

  private extendDefaultHeaders(headersObj: Record<string, string>): Record<string, string> {
    let resultHeaders = {...this.defaultHeaders};

    for (const key in headersObj) {
      if (!headersObj.hasOwnProperty(key)) {
        continue;
      }

      resultHeaders[key] = headersObj[key];
    }

    return resultHeaders;
  }

  private processError(error: any): never {
    if (!error.response) {
      throw error;
    }

    const response = error.response;
    const url: string = response.url;

    const parsedError = HttpService._parseErrorResponse(response);
    throw parsedError;

    // TODO:
    // if (url?.includes('/api/') && response.status === 403 && this.currentUser.isLoggedIn()) {
    //   this.get('/api/user')
    //     .then(data => {
    //       const window = getWindowSafe();
    //
    //       if (!window) {
    //         return;
    //       }
    //
    //       const queryParams = [`noPermissionsMessage=true`];
    //
    //       if (data.user) {
    //         queryParams.push(`redirectToArea=true`);
    //       }
    //
    //       window.open('/?' + queryParams.join('&'), '_self');
    //     });
    //
    //   throw HttpService._parseErrorResponse(response);
    // } else if (url?.includes('/api/') && response.status === 403 && !this.currentUser.isLoggedIn()) {
    //   if (url.includes('/api/login')) {
    //     const parsedError = HttpService._parseErrorResponse(response);
    //     throw parsedError;
    //   }
    //
    //   throw 'Access error - anon user';
    // } else if (response.status === -1) {
    //   throw 'Timeout error';
    // } else {
    //   const parsedError = HttpService._parseErrorResponse(response);
    //   throw parsedError;
    // }
  }

  private handleError(error: unknown): never {
    const message = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
        
    console.error('HTTP error:', {
        message,
        timestamp: new Date().toISOString()
    });
    
    throw new Error(message);
}

  private isResponseFromAnotherHost(response: AsyncData<any, any>) {
    // if (process.server) {
    //   return false;
    // }
    //
    // const parts = response.request.url.split('/');
    // return parts[2].indexOf(window.location.hostname) !== 0;
  }
}


export const httpService = {
  async get(url, config = {}) {
    console.log(`📡 HTTP GET: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        ...config
      });
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ HTTP Response: ${url}`, data);
      return data;
    } catch (error) {
      console.error(`❌ HTTP Request Failed: ${url}`, error);
      throw error;
    }
  },
  
  async post(url, data = {}, config = {}) {
    console.log(`📡 HTTP POST: ${url}`, data);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: JSON.stringify(data),
        ...config
      });
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log(`✅ HTTP Response: ${url}`, responseData);
      return responseData;
    } catch (error) {
      console.error(`❌ HTTP Request Failed: ${url}`, error);
      throw error;
    }
  },
  
  // ...existing code for other methods...
}
