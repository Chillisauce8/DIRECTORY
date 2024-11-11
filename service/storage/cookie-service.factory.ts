import { CookieService } from '~/service/storage/cookie.service';
import { serviceComposableFactory } from '~/service/service-composable-factory';



const serviceToken = 'useCookieService';

export const useCookieService =
  serviceComposableFactory(serviceToken, nuxtApp => new CookieService());
