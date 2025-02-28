import {HttpInterceptor, HttpInterceptorType} from '~/services/helpers/api-common/interceptor.composibles';
import {UseFetchOptions} from '#app';
import {AppConfig} from '@nuxt/schema';


export class AppConfigBaseUrlInterceptor extends HttpInterceptor {
  constructor(private appConfig: AppConfig) {
    super();
  }

  getType(): HttpInterceptorType {
    return HttpInterceptorType.request;
  }

  intercept(options: UseFetchOptions<any>): UseFetchOptions<any> {
    const {baseURL, browserBaseURL} = (this?.appConfig?.http ?? {});

    const url = process.client ? (browserBaseURL ? browserBaseURL : baseURL) : baseURL;

    if (!url) {
      return options;
    }

    return {
      ...(options ?? {}),
      baseURL: url,
    };
  }
}


export default () => new AppConfigBaseUrlInterceptor(useAppConfig());
