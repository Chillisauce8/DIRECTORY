import {StoreDefinition} from 'pinia';
import type {PiniaStoreOptionsMeta} from '~/services/store/define-pinia-store-with-cache';


interface PiniaStoreDefinitionWithMeta {
  definition: StoreDefinition;
  meta?: PiniaStoreOptionsMeta;
}



class PiniaStoreDefinitionServiceLocator {
  private map = new Map<string, PiniaStoreDefinitionWithMeta>();

  public registerStoreDefinition(value: PiniaStoreDefinitionWithMeta): void {
    const {definition, meta} = value;
    const id = definition.$id;

    this.map.set(id, value);
  }

  public getStoreWithMeta(id: string): PiniaStoreDefinitionWithMeta {
    if (!this.map.has(id)) {
      return null;
    }

    return this.map.get(id);
  }

  public getRegisteredStoreDefinitionWithMetaList(): PiniaStoreDefinitionWithMeta[] {
    const list = [];

    this.map.forEach(v => list.push(v));

    return list;
  }
}


let instance: PiniaStoreDefinitionServiceLocator = null;


export function usePiniaStoreDefinitionServiceLocator(): PiniaStoreDefinitionServiceLocator {
  if (instance) {
    return instance;
  }

  instance = new PiniaStoreDefinitionServiceLocator();

  return instance;
}


export function setStoreDefinition(storeDefinitionWithMeta: PiniaStoreDefinitionWithMeta): void {
  const locator = usePiniaStoreDefinitionServiceLocator();

  locator.registerStoreDefinition(storeDefinitionWithMeta);
}


export function getStoreDefinition(storeId: string): StoreDefinition {
  const locator = usePiniaStoreDefinitionServiceLocator();

  const storeWithMeta = locator.getStoreWithMeta(storeId);

  return storeWithMeta?.definition ?? null;
}
