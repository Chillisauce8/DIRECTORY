import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {coreServiceLocator} from '../serviceLocator';
import {getDomainFromLink, ListingNode} from './migrate-listings-from-apify-kvs';


const dataCrudService: DataCrudWithRelators = coreServiceLocator.get("dataCrudService");


const LISTINGS_COLLECTION_NAME = "listings";


export async function premiumListingFix(req: Request): Promise<void> {
  const listingList = await loadPremiumListingsToFix(req);

  for (const listing of listingList) {
    try {
      await fixPremiumListing(req, listing);

      console.log(`processed ${listingList.indexOf(listing) + 1} of ${listingList.length} (${listingList.length})`);
    } catch (e) {
      console.log(`errored ${listingList.indexOf(listing) + 1} of ${listingList.length} (${listingList.length})`);
    }
  }
}


async function loadPremiumListingsToFix(req: Request): Promise<ListingNode[]> {
  const query = {
    "sale.dealer.name": {"$in": ["Private Seller", "Premium Listings"]},
  };

  return dataCrudService.queryAllAvailableNodes(req, LISTINGS_COLLECTION_NAME, {query});
}


async function fixPremiumListing(req: Request, listing: ListingNode): Promise<ListingNode> {
  const forSaleLink = listing?.dataSource?.url;

  if (!forSaleLink) {
    return null;
  }

  listing.sale.listingSource = forSaleLink;
  listing.sale.listingDomain = getDomainFromLink(forSaleLink);
  listing.sale.dealer.website = getDomainFromLink(forSaleLink);

  return dataCrudService.updateNode(req, LISTINGS_COLLECTION_NAME, listing);
}
