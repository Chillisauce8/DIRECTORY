import {StoreDefinition} from 'pinia';
import {usePiniaStoreDefinitionServiceLocator} from '~/services/store/pinia-store-definition-service-locator';


function parseDispatchType(dispatchType: string): {storeName: string; action: string} {
  if (!dispatchType) {
    return null;
  }

  if (dispatchType.indexOf('/') === -1) {
    return null;
  }

  const [storeName, action] = dispatchType.split('/');

  return {storeName, action};
}


function getStoreDefinitionByName(storeName: string): StoreDefinition {
  if (!storeName) {
    return null;
  }

  const locator = usePiniaStoreDefinitionServiceLocator();

  return locator.getStoreWithMeta(storeName)?.definition ?? null;
}


export function storeDispatchIfEmpty<Result extends unknown = void>(dispatchType: string, payload: any, get?: string): Result {
  const {storeName, action} = parseDispatchType(dispatchType) ?? {};

  if (!storeName || !action) {
    return;
  }

  const storeDefinition = getStoreDefinitionByName(storeName);

  if (!storeDefinition) {
    return;
  }

  const store = storeDefinition();

  if (typeof store?.[action] !== 'function') {
    return;
  }

  if (get && typeof store?.[get] !== 'function' && !!store[get]) {
    return;
  }

  store[action](payload);
}

export function storeDispatch<Result extends unknown = void>(dispatchType: string, payload: any): Result {
  return storeDispatchIfEmpty(dispatchType, payload);
}
