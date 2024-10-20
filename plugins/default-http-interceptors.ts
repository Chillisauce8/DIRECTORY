import {useHttpInterceptor} from '~/service/http/interceptor.composibles';
import appConfigHeadersInterceptor from '~/service/http/interceptors/app-config-headers-interceptor';


export default defineNuxtPlugin(() => {
  
  useHttpInterceptor(appConfigHeadersInterceptor());


});
