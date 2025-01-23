import {httpService, HttpService} from '~/service/http/http.service';
import {serviceComposableFactory} from '~/service/service-composable-factory';


type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};


interface ListingNodeContent {
  name: string;
  imageURLs: string[];
  description?: string;
  videoURLs?: string[];
}


type TransmissionType = 'Manual' | 'Automatic';


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


export type PartialListingNode = RecursivePartial<ListingNode>;


export class ListingsService {
  private collectionName = 'listings';

  constructor(private httpService: HttpService) {}

  public async getListingListForMarket(marketSlugList: string[]): Promise<PartialListingNode[]> {
    return this.httpService.get<PartialListingNode[]>('/api/query', {
      collection: this.collectionName,
      q: {
        'metadata.marketSlugPath': {'$all': marketSlugList}
      },
      h: {
        $fields: {
          '_id': 1,
          'content': 1,
          'sale': 1,
          'spec': 1,
        },
      },
    }).then(i => i.data);
  }
}


export const useListingsService = serviceComposableFactory<ListingsService>('listingsService', () => {
  return new ListingsService(httpService);
});
