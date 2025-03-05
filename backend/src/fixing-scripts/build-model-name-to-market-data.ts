import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {coreServiceLocator} from '../serviceLocator';
import {promises as fsPromises} from 'fs';
import {join} from 'path';
import {Market} from './markets/re-build-markets.extras';


const {readFile, appendFile} = fsPromises;
const dataCrudService: DataCrudWithRelators = coreServiceLocator.get('dataCrudService');


const MARKETS_COLLECTION_NAME = 'markets';
const LISTINGS_COLLECTION_NAME = 'listings';


export async function buildModelNameToMarketData(req: Request) {
  const marketsIdList = await getLowestMarketIdListFromFile();

  const marketList = await loadLowestMarketListByIdList(req, marketsIdList);
  const processedMarketIdList = await getProcessedMarketIdList();

  const unprocessedMarketList = marketList.filter(i => !processedMarketIdList.includes(i._doc));

  for (const market of unprocessedMarketList) {
    const marketId = market?._doc;

    const yearList = market.years;
    const make = market.path?.[0]?.name ?? '';

    const node = {
      marketId,
      yearList,
      make,
      modelMatchList: [],
      modelMatchListLowercase: [],
    }

    const listingsNamesRelatedToMarket = await collectClassicComListingsNamesRelatedToMarket(req, marketId);

    for (const listingName of listingsNamesRelatedToMarket) {
      const matchStringList = getModelMatchStringsFromListingName(listingName, yearList, make);

      const uniqueMatchStringList = matchStringList
        .filter(s => !node.modelMatchList.includes(s));

      node.modelMatchList.push(...uniqueMatchStringList);
    }

    node.modelMatchListLowercase = node.modelMatchList.map(i => i.toLowerCase());

    await saveNode(node);

    console.log('Processes', marketList.indexOf(market) + 1, 'of', marketList.length);
  }
}


async function saveNode(node: any) {
  const filePath = join('src', 'fixing-scripts', '.tmp', 'modelNameToMarket.jsonl');

  const line = JSON.stringify(node) + '\n';

  await appendFile(filePath, line);
}


async function getProcessedMarketIdList(): Promise<string[]> {
  const filePath = join('src', 'fixing-scripts', '.tmp', 'modelNameToMarket.jsonl');

  const fileBuffer = await readFile(filePath);

  const fileContent = fileBuffer.toString();

  const strItemList = fileContent.split('\n').filter(i => !!i);

  return strItemList.map(i => JSON.parse(i)).map(i => i.marketId);
}


function getModelMatchStringsFromListingName(listingName: string, yearList: string[], make: string): string[] {
  listingName = listingName.trim();

  const modelMatchStringList: string[] = [
    listingName,
  ];

  const yearInListingName = yearList.find(y => listingName.startsWith(y)) ??
    /^(\d{4}).+/.exec(listingName)?.[1];

  if (yearInListingName) {
    modelMatchStringList.push(listingName.replace(yearInListingName, '').trim());
  }

  if (make && listingName.includes(make)) {
    modelMatchStringList.push((listingName.split(make)?.[1])?.trim())
  }

  return modelMatchStringList;
}


async function collectClassicComListingsNamesRelatedToMarket(req: Request, marketId: string): Promise<string[]> {
  const listingList = await dataCrudService.queryAllAvailableNodes(req, LISTINGS_COLLECTION_NAME, {
    query: {
      'metadata.marketId': marketId,
      _fields: {
        'content.name': 1,
      }
    },
  });

  return (listingList.map(i => i?.content?.name ?? null).filter(i => i !== null)) as string[];
}


async function getLowestMarketIdListFromFile(): Promise<string[]> {
  const path = join('src', 'fixing-scripts', '.tmp', 'lower-level-market-list.json');

  const fileBuffer = await readFile(path)

  const fileContent = fileBuffer.toString();

  return JSON.parse(fileContent);
}


async function loadLowestMarketListByIdList(req: Request, idList: string[]): Promise<Partial<Market>[]> {
  return dataCrudService.queryAllAvailableNodes(req, MARKETS_COLLECTION_NAME, {
    query: {
      _doc: {'$in': idList},
      _fields: {
        '_doc': 1,
        'years': 1,
        'type': 1,
        'path': 1,
      },
    },
  });
}


async function collectLowestLevelMarkets(req: Request) {
  const marketList: Partial<Market>[] = await dataCrudService
    .queryAllAvailableNodes(req, MARKETS_COLLECTION_NAME, {
      query: {
        type: 'Model',

        _fields: {
          '_doc': 1,
          'years': 1,
          'type': 1,
          'path': 1,
        },
      }
    });

  const lowestLevelMarketList: Partial<Market>[] = [];

  for (const market of marketList) {
    const hasChildMarkets = await checkMarketHasChildMarkets(req, market._doc);

    console.log(`filtered ${marketList.indexOf(market) + 1} of ${marketList.length}`)

    if (hasChildMarkets) {
      continue;
    }

    lowestLevelMarketList.push(market);
  }

  return lowestLevelMarketList;
}


async function checkMarketHasChildMarkets(req: Request, marketId: string): Promise<boolean> {
  const childMarket = await dataCrudService.querySingleNode(req, MARKETS_COLLECTION_NAME, {
    query: {
      _fields: {
        '_doc': 1,
      },
      'metadata.parentMarketId': marketId,
    },
  });

  return !!childMarket;
}
