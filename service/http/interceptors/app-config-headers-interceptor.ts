import {
  HttpInterceptor,
  type HttpInterceptorFetchOptions,
  HttpInterceptorType
} from '~/service/http/interceptor.composibles';
import type {AppConfig} from '@nuxt/schema';


export class AppConfigHeadersInterceptor extends HttpInterceptor {
  constructor(private appConfig: AppConfig) {
    super();
  }

  getType(): HttpInterceptorType {
    return HttpInterceptorType.request;
  }

  intercept(options: HttpInterceptorFetchOptions<any>): HttpInterceptorFetchOptions<any> {
    return {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        ...(this.appConfig?.http.headers ?? {}),
      },
    };
  }
}


export default () => new AppConfigHeadersInterceptor(useAppConfig());
