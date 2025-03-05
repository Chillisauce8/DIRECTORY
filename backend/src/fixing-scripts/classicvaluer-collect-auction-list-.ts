import {promises} from 'fs';
import {join} from 'path';
import {apifyHelperFactory} from '../utils/apify-helper';
const {readdir, readFile} = promises;

const apifyHelper = apifyHelperFactory();


export async function classicvaluerCollectAuctionList() {
  const dirPath = join('src', 'fixing-scripts', '.tmp', 'classicvaluer-auc');

  const fileNameList = await readdir(dirPath);

  const result = [];

  for (const fileName of fileNameList) {
    const file = await readFile(join(dirPath, fileName));

    const data = JSON.parse(file.toString());

    const aucList = data?.result?.values ?? [];

    result.push(...aucList);
  }

  const sortedAucList = result
    .sort((a, b) => (a.start_date < b.start_date) ? -1 : ((a.start_date > b.start_date) ? 1 : 0));

  const kvsName = 'cars-websites-data';

  const kvs = await apifyHelper.getKeyValueStoreByName(kvsName);

  await kvs.setRecord({key: 'theclassicvaluer-com-auctions', value: sortedAucList});
}
