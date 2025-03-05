import {
  ClassicComInfoPathItem, MARKETS_COLLECTION_NAME,
  SLUG_TOKEN_PARTS_DELIMITER
} from './migrate-markets-from-apify-kvs';
import {COUNTRY_CODE_NAME_MAP, CountryName} from './countries';
import {CURRENCY_INFO_LIST} from './currency';
import {coreServiceLocator} from '../serviceLocator';
import {DateHelper} from 'x-utils';
import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {apifyHelperFactory} from '../utils/apify-helper';
import {Market} from './markets/re-build-markets.extras';


const dateHelper: DateHelper = coreServiceLocator.get('dateHelper');
const dataCrudService: DataCrudWithRelators = coreServiceLocator.get('dataCrudService');
const apifyHelper = apifyHelperFactory();


const LISTINGS_COLLECTION_NAME = 'listings';


type TransmissionType = 'Manual' | 'Automatic';


interface ListingClassicComSpecs {
  'year': string;
  'make': string;
  'model family': string;
  'model generation': string;
  'model variant': string;
  'model trim': string;
  'engine': string;
  'transmission': TransmissionType;
  'drive type': string;
  'originality': string;
  'mileage': string;
  'vin': string;
  'vehicle type': string;
  'body style': string;
  'doors': string;
  'driver side': string;
  'ext. color group': string;
  'int. color group': string;
}


interface ListingClassicCom {
  url: string;
  title: string;
  status: string;
  price: string;
  offerLink: string; // auction link on classic.com
  dealerName: string;
  offerDate: string;
  forSaleLink: string; // lot link on auction website
  forSaleText: string;
  location: string;
  path: ClassicComInfoPathItem[];
  imageUrl: string;
  history: any[];
  specs: ListingClassicComSpecs;
  taxonomy: any[];
  fetchDatetime?: string;
  lastmod?: string;
}


interface ListingNodeContent {
  name: string;
  imageURLs: string[];
  description?: string;
  videoURLs?: string[];
}


type VehicleColor = "Black" | "Blue" | "Brown" | "Gold" | "Grey" | "Green" |
  "Orange" | "Pink" | "Purple" | "Red" | "Silver" | "White" | string;


type OdometerUnit = 'mi' | 'km' | string;


type StearingSide = 'Left' | 'Right' | 'Center' | string;


interface ListingNodeSpec {
  make: string;
  model: string;
  generation: string;
  variant: string;
  engine: string;
  year: number;
  vin: string;
  engineNumber: string;
  registrationNumber: string;
  odometer: number;
  odometerUnit: OdometerUnit;
  altOdometer?: number;
  altOdometerUnit?: OdometerUnit;
  odometerTMU: boolean;
  transmission: TransmissionType;
  stearingSide: StearingSide;
  exterior: VehicleColor;
  interior: VehicleColor;
  bodyStyle: string;
  doors: string;
}


type SaleType = 'Classified' | 'Auction' | string;


type SellerType = 'Private' | 'Dealer' | string;


type SaleStatus = 'For Sale' | 'Sold' | 'Not Sold' | 'Withdrawn' | string;


type Currency = 'GBP' | 'USD' | 'EUR' | string;


type PriceType = 'For Sale' | 'Sold' | 'High Bid' | string;


interface ListingNodeSaleDealer {
  name: string;
  website: string;
}


interface ListingNodeSale {
  saleType: SaleType;
  sellerType: SellerType;
  dealer: ListingNodeSaleDealer;
  saleStatus: SaleStatus;
  currency: Currency;
  priceType: PriceType;
  lotNumber: number;
  estimateFrom: number;
  estimateTo: number;
  price: number;
  auctionStart: string
  auctionEnd: string
  listingCreated: string;
  country: string
  address: string;
  listingSource: string;
  listingDomain: string;
}


interface ListingNodeDataSource {
  fetchTime: string;
  url: string;
  domain: string;
  html?: string;
}


interface ListingNodeMetadata {
  slug: string;
  marketSlugToken: string;
  marketSlugPath: string[];
  marketSlugPathReverse: string[];
  marketId?: string;
  modificationHistory?: string[];
}


export interface ListingNode {
  [fieldName: string]: any;
  content: ListingNodeContent;
  spec: Partial<ListingNodeSpec>;
  sale: Partial<ListingNodeSale>;
  dataSource: ListingNodeDataSource;
  metadata: ListingNodeMetadata;
}


interface MileageData {
  tmu: boolean;
  odometer?: number;
  odometerUnit?: OdometerUnit;
  altOdometer?: number;
  altOdometerUnit?: OdometerUnit;
}


export async function migrateLatestListingFromApifyKvs(req: Request) {
  const listingList = await loadNewListingsFromApifyKVW();

  console.log(`fetched ${listingList.length} listings`);

  await processClassicComListingList(req, listingList);
}


export async function migrateAllListingsHistoryFromDataset(req: Request): Promise<void> {
  const {skip, limitPerStep: limit = 10000} = req.body as any;

  let listingList;
  let currentSkip = skip;

  do {
    listingList = await processListingMigrationFromDataSet(req, {offset: currentSkip, limit});

    currentSkip += limit;
  } while (listingList.length === limit);
}


async function processListingMigrationFromDataSet(req: Request, params: {offset: number; limit: number}): Promise<ListingClassicCom[]> {
  const {offset, limit} = params;

  const listingList = await apifyHelper.loadItemsFromDataset<ListingClassicCom>({
    idOrName: 'chillisauce-main/classic-com-full-listing',
    options: {
      limit,
      offset,
      omit: ['history', 'taxonomy'],
    }
  });

  for (const listing of listingList) {
    try {
      await createListingIfNewInDB(req, listing);
      console.log(`processed ${listing.url} (${listingList.indexOf(listing) + 1 + offset} of ${listingList.length + offset})`);
    } catch (e) {
      console.error(`errored ${listing.url} (${listingList.indexOf(listing) + 1 + offset} of ${listingList.length + offset})`, e?.message ?? e);
    }
  }

  return listingList;
}

export async function migrateListingHistoryFromDataset(req: Request): Promise<void> {
  const {skip, limit = 10000} = req.body as any;

  await processListingMigrationFromDataSet(req, {offset: skip, limit});
}


export async function migrateListingHistoryFromApifyKvs(req: Request) {
  const listingList = await loadListingsFromHistoryFromApifyKVS();

  console.log(`fetched ${listingList.length} listings`);

  await processClassicComListingList(req, listingList);
}


async function processClassicComListingList(req: Request, listingList: ListingClassicCom[]): Promise<void> {
  for (const listing of listingList) {
    try {
      const listingNode = await processClassicComListing(req, listing);
      console.log(`processed ${listing.url} (${listingList.indexOf(listing) + 1} of ${listingList.length})`);
    } catch (e) {
      console.error(`errored ${listing.url} (${listingList.indexOf(listing) + 1} of ${listingList.length})`, e?.message ?? e);
    }
  }
}


async function getListingFromDbByUrl(req: Request, url: string): Promise<ListingNode> {
  return dataCrudService.querySingleNode(req, LISTINGS_COLLECTION_NAME, {
    query: {
      'dataSource.url': url,
    },
  });
}


async function processClassicComListing(req: Request, classicComListing: ListingClassicCom): Promise<ListingNode> {
  return updateOrCreateListing(req, classicComListing);
}


async function createListingIfNewInDB(req: Request, classicComListing: ListingClassicCom): Promise<ListingNode> {
  const existingListing = await getListingFromDbByUrl(req, classicComListing.url);

  if (existingListing) {
    return null;
  }

  const listing = await prepareListingNodeFromClassicComNode(req, classicComListing);

  return dataCrudService.createNode(req, LISTINGS_COLLECTION_NAME, listing);
}


async function updateOrCreateListing(req: Request, classicComListing: ListingClassicCom): Promise<ListingNode> {
  const existingListing = await getListingFromDbByUrl(req, classicComListing.url);

  if (!!existingListing && !classicComListing.fetchDatetime) {
    return null;
  }

  if (existingListing?.lastUpdated?.date > classicComListing.fetchDatetime) {
    return null;
  }

  if (existingListing) {
    const preparedListingData = await prepareListingNodeFromClassicComNode(req, classicComListing);

    preparedListingData.metadata.modificationHistory = [
      classicComListing?.lastmod,
      ...existingListing.metadata.modificationHistory
    ];

    if (!isListingUpdated(existingListing, preparedListingData)) {
      return null;
    }

    const listing = {...existingListing, ...preparedListingData};

    return dataCrudService.updateNode(req, LISTINGS_COLLECTION_NAME, listing);
  } else {
    const listing = await prepareListingNodeFromClassicComNode(req, classicComListing);

    return dataCrudService.createNode(req, LISTINGS_COLLECTION_NAME, listing);
  }
}


function isListingUpdated(existingListing: ListingNode, fetchedListing: ListingNode): boolean {
  const existingStatus = existingListing.sale.saleStatus;
  const existingPrice = existingListing.sale.price;
  const existingAuctionEnd = existingListing.sale.auctionEnd;

  const {
    saleStatus,
    price,
    auctionEnd
  } = fetchedListing;

  if (existingStatus !== saleStatus) {
    return true;
  }

  if (existingPrice !== price) {
    return true;
  }

  if (existingAuctionEnd !== auctionEnd) {
    return true;
  }

  return false;
}


async function loadNewListingsFromApifyKVW() {
  const kvsName = 'cars-websites-data';
  const newItemKey = 'classic-com-new-listings-dynamic';

  const kvsRecord = await apifyHelper.loadRecordsFromApifyKVS<ListingClassicCom>({
    keyValueStoreName: kvsName,
    keyFilter: key => [newItemKey].includes(key),
  });

  const listingList: ListingClassicCom[] = kvsRecord
    .reduce((res, item) => ([...res, ...(item?.value ?? [])]), []);

  return orderAndGetUniqueClassicComListing(listingList);
}


async function loadListingsFromHistoryFromApifyKVS() {
  const kvsName = 'cars-websites-data';
  const listingHistoryKeyStartWith = 'classic-com-new-listings-history-';

  const storeRecord = await apifyHelper.loadRecordsFromApifyKVS<{items: ListingClassicCom[]}>({
    keyValueStoreName: kvsName,
    keyFilter: key => key.startsWith(listingHistoryKeyStartWith),
  });

  const listingList = (storeRecord
    .find(i => i.key.startsWith(listingHistoryKeyStartWith))?.value ?? [])
    .reduce((list, item) => [...list, ...item.items], []);

  return orderAndGetUniqueClassicComListing(listingList);
}


function orderAndGetUniqueClassicComListing(fetchedListingList: ListingClassicCom[]) {
  const urlListingMap = new Map<string, ListingClassicCom>();

  fetchedListingList
    .sort((a, b) => a?.lastmod > b?.lastmod ? -1 : (a?.lastmod < b?.lastmod ? 1 : 0))
    .sort((a, b) => a?.fetchDatetime > b?.fetchDatetime ? -1 : (a?.fetchDatetime < b?.fetchDatetime ? 1 : 0))
    .forEach(i => {
      if (urlListingMap.has(i.url)) {
        return;
      }

      urlListingMap.set(i.url, i);
    });

  return Array.from(urlListingMap.values());
}


async function prepareListingNodeFromClassicComNode(req: Request, listing: ListingClassicCom): Promise<ListingNode> {
  return {
    content: await prepareContentFromClassicComListing(req, listing),
    spec: await prepareSpecFromClassicComListing(req, listing),
    sale: await prepareSaleFromClassicComListing(req, listing),
    dataSource: await prepareDataSourceFromClassicComListing(req, listing),
    metadata: await prepareMetadataFromClassicComListing(req, listing),
  };
}


async function prepareMetadataFromClassicComListing(req: Request, listing: ListingClassicCom): Promise<ListingNodeMetadata> {
  const path = listing?.path ?? [];

  if (!path.length) {
    return null;
  }

  const slug = path[path.length - 1].slug;
  const pathToMarket = path.slice(0, path.length - 1);

  const marketSlugPath = pathToMarket.map(i => i.slug);
  const marketSlugPathReverse = [...marketSlugPath].reverse();
  const marketSlugToken = marketSlugPath.join(SLUG_TOKEN_PARTS_DELIMITER);
  const modificationHistory = listing?.lastmod ? [listing.lastmod] : [];

  const market: Market = await dataCrudService
    .querySingleNode(req, MARKETS_COLLECTION_NAME, {
      query: {
        'metadata.slugToken': marketSlugToken,
      },
    });

  const marketId = market?._doc ?? null;

  return {slug, marketSlugToken, marketSlugPath, marketSlugPathReverse, marketId, modificationHistory};
}


async function prepareContentFromClassicComListing(req: Request, listing: ListingClassicCom): Promise<ListingNodeContent> {
  return {
    name: listing.title,
    imageURLs: listing.imageUrl ? [
      listing.imageUrl,
    ] : [],
    description: null,
    videoURLs: []
  }
}


async function prepareSaleFromClassicComListing(req: Request, listing: ListingClassicCom): Promise<Partial<ListingNodeSale>> {
  const {address, country} = parseLocationFromClassicComNode(listing) ?? {};
  const {price, currency, priceType} = getPriceDetailsFromClassicComListing(listing) ?? {};

  let sellerType;

  if (listing?.dealerName === 'Private Seller') {
    sellerType = 'Private'
  } else {
    sellerType = listing?.dealerName ? 'Dealer' : 'Private';
  }

  return {
    saleType: getSaleTypeFromClassicComListing(listing),
    sellerType,
    dealer: getDealerDetailsFromFromClassicComListing(listing),
    saleStatus: listing?.status,
    currency,
    price,
    priceType,
    auctionEnd: getAuctionEndDateFromClassicComListing(listing),
    listingCreated: null,
    country,
    address,
    listingSource: listing?.forSaleLink,
    listingDomain: getDomainFromLink(listing?.forSaleLink),
  };
}


async function prepareSpecFromClassicComListing(req: Request, listing: ListingClassicCom): Promise<Partial<ListingNodeSpec>> {
  const {
    tmu: odometerTMU,
    odometer,
    odometerUnit,
    altOdometer,
    altOdometerUnit
  } = getOdometerDataFromClassicComNode(listing) ?? {};

  return {
    odometer,
    odometerUnit,
    altOdometer,
    altOdometerUnit,
    odometerTMU,
    make: listing?.specs?.make,
    model: listing?.specs?.['model family'],
    generation: listing?.specs?.['model generation'],
    variant: listing?.specs?.['model variant'],
    engine: listing?.specs?.engine,
    year: parseInt(listing?.specs?.year, 10),
    vin: listing?.specs?.vin,
    engineNumber: null,
    registrationNumber: null,
    transmission: listing?.specs?.transmission,
    stearingSide: getStearingSideFromClassicComNode(listing),
    exterior: listing?.specs?.['ext. color group'],
    interior: listing?.specs?.['int. color group'],
    bodyStyle: listing?.specs?.['body style'],
    doors: listing?.specs?.doors,
  };
}


async function prepareDataSourceFromClassicComListing(req: Request, listing: ListingClassicCom): Promise<ListingNodeDataSource> {
  return {
    url: listing?.url,
    domain: getDomainFromLink(listing?.url),
    fetchTime: listing?.fetchDatetime,
    html: null
  };
}


function getSaleTypeFromClassicComListing(listing: ListingClassicCom): SaleType {
  const auctionButtonText = 'bid now';
  const forSaleText = (listing?.forSaleText ?? '').toLowerCase();

  return forSaleText?.includes(auctionButtonText) ? 'Auction' : 'Classified';
}


function getAuctionEndDateFromClassicComListing(listing: ListingClassicCom): string {
  const dateSeparatorFromSaleText = 'ends'
  const forSaleText = listing?.forSaleText ?? '';

  if (!forSaleText.includes(dateSeparatorFromSaleText)) {
    return null;
  }

  const dateStr = forSaleText.split(dateSeparatorFromSaleText)?.[1].trim();

  return transformClassicComDateStr(dateStr);
}


function transformClassicComDateStr(dateStr: string): string {
  if (!dateStr) {
    return null;
  }

  const format = 'MMM d, yyyy';

  const parsedDate = dateHelper.parse(dateStr, format);

  return dateHelper.saveDateFormat(parsedDate);
}


function getDealerDetailsFromFromClassicComListing(listing: ListingClassicCom): ListingNodeSaleDealer {
  const name = listing?.dealerName;

  if (!name) {
    return null;
  }

  const website = getDomainFromLink(listing.forSaleLink);

  return {name, website};
}


function getPriceDetailsFromClassicComListing(listing: ListingClassicCom): {currency: Currency; price: number; priceType: PriceType} {
  const priceRegex = /([^0-9,]+)([0-9,]+)/;
  const rawPriceStr = (listing?.price ?? '').split(' ')?.[0];

  if (!rawPriceStr) {
    return {currency: null, price: null, priceType: null};
  }

  const [p, currencySymbolOrCode, priceStr] = priceRegex.exec(rawPriceStr);

  if (!currencySymbolOrCode || !priceStr) {
    return {currency: null, price: null, priceType: null};
  }

  const price = parseInt(priceStr.replace(/,/g, ''));

  const currency = (currencySymbolOrCode.length === 3 ?
    currencySymbolOrCode :
    CURRENCY_INFO_LIST
      .find(i => i.symbol === currencySymbolOrCode)?.code) ?? currencySymbolOrCode;

  let priceType: PriceType;

  if (listing.price?.toLowerCase().includes('highest bid')) {
    priceType = 'High Bid';
  } else if (listing.status.toLowerCase() === 'sold') {
    priceType = 'Sold';
  } else {
    priceType = 'For Sale'
  }

  return {price, currency, priceType};
}


export function getDomainFromLink(link: string): string {
  if (!link) {
    return null;
  }

  try {
    const url = new URL(link.startsWith("http") ? link : `https://${link}`);

    return `${url.protocol}//${url.hostname}`;
  } catch (e) {
    console.error(e);
    return null;
  }
}


function parseLocationFromClassicComNode(listing: ListingClassicCom): {address: string; country: CountryName} {
  const locationStr = (listing?.location ?? '');

  if (!locationStr) {
    return null;
  }

  const locationParts = locationStr.split(', ');

  const address = locationParts.slice(0, locationParts.length - 1).join(', ');
  const countryCode = locationParts[locationParts.length - 1] ?? '';
  const country = COUNTRY_CODE_NAME_MAP[countryCode.toUpperCase()];

  if (!address && !country) {
    return {address, country: null};
  }

  if (!address && country) {
    return {address: null, country};
  }

  return {address, country};
}


function getOdometerDataFromClassicComNode(listing: ListingClassicCom): MileageData {
  const unknownMileage = 'tmu';
  const alternativeOdometerRegex = /\(([0-9a-z, ]+)\)/;

  const mileageStr = (listing?.specs?.mileage ?? '').toLowerCase();

  if (!mileageStr) {
    return {tmu: true};
  }

  if (mileageStr === unknownMileage) {
    return {tmu: true};
  }

  const tmu = mileageStr.includes(unknownMileage);

  const odometerStr = mileageStr.split(' ', 2).map(i => i.trim()).join(' ');

  const [
    altOdometerStrRaw,
    altOdometerStr
  ] = (alternativeOdometerRegex.exec(mileageStr)) ?? [];

  const {value: odometer, unit: odometerUnit} = parseMileage(odometerStr);
  const {value: altOdometer, unit: altOdometerUnit} = parseMileage(altOdometerStr);

  return {tmu, odometer, odometerUnit, altOdometer, altOdometerUnit};
}


function parseMileage(mileageStr: string): {value: number, unit: OdometerUnit} {
  if (!mileageStr) {
    return {value: null, unit: null};
  }

  const [rawValue, unit] = mileageStr.split(' ');

  return {value: parseInt(rawValue.replace(/,/g, ''), 10), unit};
}


function getStearingSideFromClassicComNode(listing: ListingClassicCom): StearingSide {
  const rawDriverSide = (listing?.specs?.['driver side'] ?? '').toLowerCase();

  if (!rawDriverSide) {
    return null;
  }

  if (rawDriverSide.includes('left')) {
    return 'Left';
  } else if (rawDriverSide.includes('right')) {
    return 'Right';
  } else if (rawDriverSide.includes('center')) {
    return 'Center';
  }

  return null;
}
