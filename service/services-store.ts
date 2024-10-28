import type {NuxtApp} from '#app';


export function storeServiceInstance(nuxtApp: NuxtApp, token: string, value: any) {
  const store: any = nuxtApp?.$composibleInstanceStore;

  if (!store) {
    return;
  }

  store[token] = value;
}


export function getServiceInstance(nuxtApp: NuxtApp, token: string) {
  const store: any = nuxtApp?.$composibleInstanceStore;
  return store?.[token] ?? null;
}
