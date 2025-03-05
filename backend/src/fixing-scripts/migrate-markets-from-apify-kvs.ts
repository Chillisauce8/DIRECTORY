import {apifyHelperFactory} from '../utils/apify-helper';
import {coreServiceLocator} from '../serviceLocator';
import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {nodeSystemDataHelper} from '../db/node-system-data-helper';
import {Market} from './markets/re-build-markets.extras';


const dataCrudService: DataCrudWithRelators = coreServiceLocator.get('dataCrudService');
const apifyHelper = apifyHelperFactory();


export interface ClassicComInfoPathItem {
  slug: string;
  name: string;
}


interface MarketClassicCom {
  url: string;
  name: string;
  description: string;
  years: string[];
  path: ClassicComInfoPathItem[];
  breadcrumsJSONLD?: string;
}


export const SLUG_TOKEN_PARTS_DELIMITER = '@';
export const MARKETS_COLLECTION_NAME = 'markets';


export async function migrateMarketsFromApifyKVS(req: Request) {
  await processMarketsFromClassicCom(req);
}


export async function updateMarketsFromClassicComWithYearsRange(req: Request) {
  const marketsDataset = await apifyHelper.getDataset('SMSckqNKCQNKk0Tff');

  const marketsData = await marketsDataset.listItems({fields: ['url', 'years', 'yearsRange']});

  const filteredMarketDataList = marketsData.items.filter(i => {
    if (!i?.yearsRange) {
      return false;
    }

    if ((i.years as string[])?.length) {
      return false
    }

    return true;
  });

  for (const marketData of filteredMarketDataList) {
    const {url, yearsRange} = marketData;

    const marketNode: Market = await dataCrudService
      .querySingleNode(req, MARKETS_COLLECTION_NAME, {query: {classicUrl: url}});

    if (!marketNode) {
      console.log('node not found', url);
      continue;
    }

    marketNode.years = prepareYearsArrayFromYearsRangeStr(yearsRange as string);

    await dataCrudService.updateNode(req, MARKETS_COLLECTION_NAME, marketNode);

    console.log(`processed ${filteredMarketDataList.indexOf(marketData) + 1} of ${filteredMarketDataList.length}`);
  }
}


function prepareYearsArrayFromYearsRangeStr(yearsRange: string): string[] {
  if (!yearsRange) {
    return [];
  }

  const [startYearStr, endYearStr] = yearsRange
    .trim()
    .replace('(', '')
    .replace(')', '')
    .split(' to ')
    .map(i => i.trim());

  if (!startYearStr) {
    return [];
  }

  if (!endYearStr) {
    return [];
  }

  const startYear = parseInt(startYearStr, 10);
  const endYear = parseInt(endYearStr, 10);

  if (!isFinite(startYear)) {
    return [];
  }

  if (!isFinite(endYear)) {
    return [];
  }

  if (startYear === endYear) {
    return [startYear.toString()];
  }

  const offset = endYear - startYear;

  const yearList = [];

  for (let i = 0; i <= offset; ++i) {
    yearList.push(startYear + i);
  }

  return yearList.map(i => i.toString());
}


export async function createNewMarketsFromClassicCom(req: Request) {
  const marketsDataset = await apifyHelper.getDataset('SMSckqNKCQNKk0Tff');

  // @ts-ignore
  const marketClassicComList = (await marketsDataset.listItems()).items as MarketClassicCom[];
  const sortedMarketList = sortClassicComMarkets(marketClassicComList);

  for (const marketInfo of sortedMarketList) {
    const {url} = marketInfo;

    const existingNode = await dataCrudService.querySingleNode(req, MARKETS_COLLECTION_NAME, {
      query: {classicUrl: url},
    });

    if (existingNode) {
      console.log(`processed ${sortedMarketList.indexOf(marketInfo) + 1} of ${sortedMarketList.length}`);

      continue;
    }

    await createMarketNode(req, marketInfo);

    console.log(`processed ${sortedMarketList.indexOf(marketInfo) + 1} of ${sortedMarketList.length}`);
  }
}


async function processMarketsFromClassicCom(req: Request) {
  const marketList = await loadClassicComMarkets();
  const sortedMarketList = sortClassicComMarkets(marketList);
  // const slicedMarketList = sortedMarketList.slice(699);

  for (const marketInfo of sortedMarketList) {
    await createMarketNode(req, marketInfo);
    console.log(
      `Created market node ${marketInfo.name}`,
      `${sortedMarketList.indexOf(marketInfo) + 1} of ${sortedMarketList.length}`
    );
  }
}


async function createMarketNode(req: Request, info: MarketClassicCom): Promise<Market> {
  const preparedNodeToSave = await prepareMarketNodeForClassicComInfo(req, info);

  if (!preparedNodeToSave) {
    return;
  }

  const existingNode = await requestMarketNodeBySlugToken(req, preparedNodeToSave?.metadata?.slugToken);

  if (existingNode) {
    console.log('exists');
    return;
  }

  return dataCrudService.createNode(req, MARKETS_COLLECTION_NAME, preparedNodeToSave, {ignoreIDSet: true});
}


function createParentMarketByChildClassicComMarketInfo(req: Request, info: MarketClassicCom): Promise<Market> {
  const url = info.url.split('/').slice(0, -1).join('/');
  const path =  info.path.slice(0, -1).map(i => ({...i}));
  const lastPartItem = path[path.length - 1];

  const name = lastPartItem.name;

  const marketInfo: MarketClassicCom = {
    name,
    url,
    path,
    description: '',
    years: [],
  };

  return createMarketNode(req, marketInfo);
}

function getPathFromClassicComMarketInfo(info: MarketClassicCom): ClassicComInfoPathItem[] {
  if (info.path.length) {
    return info.path;
  }

  let parsedSJONLD;

  try {
    parsedSJONLD = JSON.parse(info.breadcrumsJSONLD.trim());
  } catch (e) {
    return [];
  }

  return (parsedSJONLD?.itemListElement ?? [])
    .filter(i => !['Home', 'Markets'].includes(i.item.name))
    .map(i => i.item)
    .map(i => {
      const slug = i['@id'].split('/').filter(p => !!p).pop();
      const name = i.name;

      return {slug, name};
    });
}

async function prepareMarketNodeForClassicComInfo(req: Request, info: MarketClassicCom): Promise<Market> {
  const rawPath = getPathFromClassicComMarketInfo(info);

  if (!rawPath.length) {
    console.log('No path for', info.url);
    return null;
  }

  const doc = nodeSystemDataHelper.getUniqueID();
  const slugList = info.path.map(i => i.slug);
  const slugToken = slugList.join(SLUG_TOKEN_PARTS_DELIMITER);
  const parentSlugPath = slugList.slice(0, -1);
  const parentSlugToken = parentSlugPath.join(SLUG_TOKEN_PARTS_DELIMITER);

  let parentMarket = await requestMarketNodeBySlugToken(req, parentSlugToken);

  if (!parentMarket && info.path.length > 1) {
    parentMarket = await createParentMarketByChildClassicComMarketInfo(req, info) ?? null;

    if (!parentMarket) {
      console.log(`Problems with ${info.url} market`);
      return null;
    }
  }

  const path = [
    ...(parentMarket?.path ?? []),
    {
      ...info.path[info.path.length - 1],
      id: doc,
    }
  ];

  return {
    _doc: doc,
    name: info.name,
    years:info.years,
    classicUrl: info.url,
    classicDescription: info.description,
    path,
    metadata: {
      slugToken: slugToken,
      parentMarketId: parentMarket?._doc,
      parentSlugPathReverse: [...parentSlugPath].reverse(),
      parentSlugPath,
    }
  }
}


async function requestMarketNodeBySlugToken(req: Request, slugToken: string): Promise<Market> {
  return dataCrudService.querySingleNode(req, MARKETS_COLLECTION_NAME, {
    query: {
      'metadata.slugToken': slugToken,
    },

  });
}


async function loadClassicComMarkets(): Promise<MarketClassicCom[]> {
  const kvsName = 'cars-websites-data';
  const marketsKey = 'classic-com-markets';

  const kvs = await apifyHelper.loadRecordsFromApifyKVS<MarketClassicCom>({
    keyValueStoreName: kvsName,
    keyFilter: key => key === marketsKey,
  });

  return kvs.find(i => i.key === marketsKey).value;
}


function sortClassicComMarkets(list: MarketClassicCom[]): MarketClassicCom[] {
  return list
    .sort((a, b) => a.path.length - b.path.length)
    .sort((a, b) => {
      const slugA = a.path?.[0].slug;
      const slugB = b.path?.[0].slug;

      if (slugA > slugB) {
        return 1;
      }

      if (slugA < slugB) {
        return -1;
      }

      return 0;
    });
}
