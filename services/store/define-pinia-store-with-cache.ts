import {
  _GettersTree,
  defineStore,
  DefineStoreOptions,
  StateTree,
  StoreDefinition,
} from 'pinia';
import {setStoreDefinition} from '~/services/store/pinia-store-definition-service-locator';


export interface PiniaStoreOptionsMeta {
  hasServerInitAction?: boolean;
}


declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    meta?: PiniaStoreOptionsMeta;
  }

  export interface PiniaCustomProperties {
    nuxtServerInit?: () => void | Promise<void>;
  }
}



// overloads copied from the defineStore overloads
function definePiniaStoreWithCache<Id extends string, S extends StateTree = {}, G extends _GettersTree<S> = {}, A = {}>(id: Id, options: Omit<DefineStoreOptions<Id, S, G, A>, 'id'>): StoreDefinition<Id, S, G, A>;
function definePiniaStoreWithCache<Id extends string, S extends StateTree = {}, G extends _GettersTree<S> = {}, A = {}>(options: DefineStoreOptions<Id, S, G, A>): StoreDefinition<Id, S, G, A>;
function definePiniaStoreWithCache(...args): StoreDefinition {
  const definition: StoreDefinition = defineStore.call(defineStore, ...args);

  const options: DefineStoreOptions<any, any, any, any> = args.length === 1 ? args[0] : args[1];
  const hasServerInitAction = options.actions.hasOwnProperty('nuxtServerInit');

  const meta: PiniaStoreOptionsMeta = {
    hasServerInitAction,
    ...(options?.meta ?? {}),
  };

  setStoreDefinition({definition, meta});

  return definition;
}


export {definePiniaStoreWithCache};
