import type {NuxtApp} from '#app';
import {getServiceInstance, storeServiceInstance} from '~/service/services-store';


export function serviceComposableFactory<Service extends unknown>(serviceToken: string, serviceFactory: (nuxtApp?: NuxtApp) => Service): (nuxtApp?: NuxtApp) => Service {
  return (nuxtApp?: NuxtApp) => {
    nuxtApp = nuxtApp ?? tryUseNuxtApp();

    let instance = getServiceInstance(nuxtApp, serviceToken);

    if (instance) {
      return instance;
    }

    instance = serviceFactory(nuxtApp);

    storeServiceInstance(nuxtApp, serviceToken, instance);

    return instance;
  };
}
