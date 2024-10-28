import {UseFetchOptions} from '#app';


export enum HttpInterceptorType {
  request = 'request',
}


export interface HttpInterceptorFetchOptions<Result extends unknown = any> extends UseFetchOptions<Result> {
  path: string;
}


export abstract class HttpInterceptor {
  public abstract getType(): HttpInterceptorType;
  public abstract intercept<Result extends unknown = any>(options: HttpInterceptorFetchOptions<Result>): HttpInterceptorFetchOptions<Result>;
}


const interceptorList: HttpInterceptor[] = [];


export function useHttpInterceptor(interceptor: HttpInterceptor): void {
  interceptorList.push(interceptor);
}


export function getHttpInterceptorList(): HttpInterceptor[] {
  return interceptorList;
}


export function getHttpInterceptorListByType(type: HttpInterceptorType): HttpInterceptor[] {
  return interceptorList.filter(i => i.getType() === type);
}
