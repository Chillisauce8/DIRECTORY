import {ListingNode} from './migrate-listings-from-apify-kvs';
import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {coreServiceLocator} from '../serviceLocator';


const dataCrudService: DataCrudWithRelators = coreServiceLocator.get('dataCrudService');


const LISTINGS_COLLECTION_NAME = 'listings';


export async function fixListingsIncorrectCurrencies(req: Request) {
  await fixListingsWithBMDCurrency(req);
}


async function fixListingsWithBMDCurrency(req: Request): Promise<void> {
  let page = 0;
  let limit = 1000;
  let skip = page * limit;

  let listingList = [];

  do {
    listingList = await loadListingListWithBMDCurrency(req, {skip, limit});

    await processListingListWithBMDCurrency(req, listingList, {skip, limit});

    page += 1;
    skip = page * limit;
  } while (listingList.length === limit);
}


async function processListingListWithBMDCurrency(req: Request,
                                                 listingList: ListingNode[],
                                                 queryParams: {skip: number; limit: number}): Promise<void> {
  for (const listing of listingList) {
    try {
      await processListingWithBMDCurrency(req, listing);
      console.log(`Fixed ${queryParams.skip + listingList.indexOf(listing) + 1} of ${queryParams.skip + listingList.length}`);
    } catch (e) {
      console.log(`Errored ${queryParams.skip + listingList.indexOf(listing) + 1} of ${queryParams.skip + listingList.length}`, listing?._doc);
    }
  }
}


async function processListingWithBMDCurrency(req: Request, listing: ListingNode): Promise<void> {
  if (listing.sale.currency !== 'BMD') {
    return;
  }

  listing.sale.currency = 'USD';

  return dataCrudService.updateNode(req, LISTINGS_COLLECTION_NAME, listing);
}


async function loadListingListWithBMDCurrency(req: Request, params: {skip: number; limit: number}): Promise<ListingNode[]> {
  const {skip, limit} = params;

  return loadListings(req, {
    query: {'sale.currency': 'BMD'},
    skip,
    limit
  });
}

async function loadListings(req: Request, params: {query: Record<string, any>; skip: number; limit: number}): Promise<ListingNode[]> {
  const {query, skip, limit} = params;

  return dataCrudService.queryNodes(req, LISTINGS_COLLECTION_NAME, {query, pagination: {skip, limit}});
}
