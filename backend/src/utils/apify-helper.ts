import {
  ApifyClient,
  Dataset,
  DatasetClient,
  DatasetClientListItemOptions,
  KeyValueStoreClient,
  KeyValueStore
} from 'apify-client';


let settings = require('../../privateSettings');


export interface ApifyHelperConfig {
  apiToken: string;
}


type ApifyKeyValueStoreGetterConfigKeyFilterFn = (keyName: string) => boolean | Promise<boolean>;


export interface ApifyKeyValueStoreGetterConfig {
  keyValueStoreName: string;
  keyFilter?: ApifyKeyValueStoreGetterConfigKeyFilterFn;
}


export interface ApifyKeyValueStoreRecord<T = unknown> {
  key: string;
  value: T;
}


export interface ApifyDatasetGetterConfig {
  idOrName: string;
  options?: Partial<DatasetClientListItemOptions>;
}


export class ApifyHelper {
  private apifyClient: ApifyClient;

  constructor(private config: ApifyHelperConfig) {}

  public async loadRecordsFromApifyKVS<T>(config: ApifyKeyValueStoreGetterConfig): Promise<ApifyKeyValueStoreRecord<T[]>[]> {
    const {
      keyValueStoreName,
      keyFilter = (key: string) => true,
    } = config;

    const result: ApifyKeyValueStoreRecord<T[]>[] = [];

    const kvsClient = await this.getKeyValueStoreByName(keyValueStoreName);

    const keyListResult = await kvsClient.listKeys();

    const keyList = keyListResult.items
      .map(k => k.key);

    const filteredKeyList = await this.filterKVSKeys(keyList, keyFilter);

    console.log('suitable keys count', filteredKeyList.length);

    for (const key of filteredKeyList) {
      const timerLabel = `load record ${key}`;

      console.time(timerLabel);
      const record = await kvsClient.getRecord(key);
      console.timeEnd(timerLabel);

      if (!Array.isArray(record.value)) {
        continue;
      }

      result.push({key, value: (record.value as any)});

      console.log('items count', record.value.length);
    }

    return result;
  }

  public async getKeyValueStoreByName(name: string): Promise<KeyValueStoreClient> {
    const apifyClient = this.getApifyClient();

    const storesClient = apifyClient.keyValueStores();

    const storesList = await storesClient.list();

    const store = storesList.items.find(s => s.name === name) ?? null;

    if (!store) {
      return null;
    }

    return this.getKeyValueStoreById(store.id);
  }

  public async getKeyValueStoreById(id: string): Promise<KeyValueStoreClient> {
    const apifyClient = this.getApifyClient();

    return apifyClient.keyValueStore(id);
  }

  public async loadItemsFromDataset<Item extends unknown>(config: ApifyDatasetGetterConfig): Promise<Item[]> {
    if (!config?.idOrName) {
      return null;
    }

    const datasetClient = await this.getDataset(config.idOrName);

    return (await datasetClient.listItems(config?.options))?.items as Item[];
  }

  public async getDataset<Item extends unknown>(name: string): Promise<DatasetClient> {
    const apifyClient = this.getApifyClient();

    return apifyClient.dataset(name);
  }

  public async storeDataInKVS(kvsName: string, key: string, data: any): Promise<void> {
    const kvsClient = await this.getKeyValueStoreByName(kvsName);

    await kvsClient.setRecord({key, value: data});
  }

  private getApifyClient(): ApifyClient {
    if (!this.apifyClient) {
      this.apifyClient = new ApifyClient({token: this.config.apiToken});
    }

    return this.apifyClient;
  }

  private async filterKVSKeys(keyList: string[], filterFn: (key: string) => boolean | Promise<boolean>) {
    if (!filterFn) {
      return keyList;
    }

    const result = [];

    for (const key of keyList) {
      const isKeySuitable = await Promise.resolve(filterFn(key));

      if (!isKeySuitable) {
        continue;
      }

      result.push(key);
    }

    return result;
  }
}


export function apifyHelperFactory(): ApifyHelper {
  return new ApifyHelper({apiToken: settings.APIFY.apiKey});
}
