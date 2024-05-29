import {HttpInterceptor, HttpInterceptorType} from '~/service/http/interceptor.composibles';
import {UseFetchOptions} from '#app';
import {AppConfig} from '@nuxt/schema';


export class AppConfigHeadersInterceptor extends HttpInterceptor {
  constructor(private appConfig: AppConfig) {
    super();
  }

  getType(): HttpInterceptorType {
    return HttpInterceptorType.request;
  }

  intercept(options: UseFetchOptions<any>): UseFetchOptions<any> {
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
