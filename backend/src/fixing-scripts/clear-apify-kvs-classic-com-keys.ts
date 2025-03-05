import {apifyHelperFactory} from '../utils/apify-helper';

const apifyHelper = apifyHelperFactory();


export async function clearApifyKVSClassicComKeys() {
  const kvsName = 'cars-websites-data';


  const kvs = await apifyHelper.getKeyValueStoreByName(kvsName);

  const keyList = (await kvs.listKeys())?.items;

  const keyListToDelete = keyList
    .map(i => i.key)
    .filter(i => i.startsWith('classic-com-'))
    .filter(i => !i.includes('markets'));

  for (const key of keyListToDelete) {
    await kvs.deleteRecord(key);
  }
}
