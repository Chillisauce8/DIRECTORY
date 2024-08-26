import type {HttpService} from '~/service/http/http.service';
import {serviceComposableFactory} from '~/service/service-composable-factory';
import {httpService} from '~/service/http/http.service';


interface MarketPathItem {
  id: string;
  slug: string;
  name: string;
}


interface MarketMeta {
  slugToken: string; // path.slug items - joined via '@' EG - mercedes-benz@170@type-170
  parentSlugPath: string[]; // path.slag array without item
  parentSlugPathReverse: string[]; // path.slag array without item (reversed) - from parent to root
  parentMarketId: string;
}


export interface Market {
  _id?: string;
  _doc?: string;
  name: string;
  path: MarketPathItem[];
  years: string[];
  classicUrl: string;
  classicDescription: string;
  metadata: MarketMeta;
}



export type TopLevelMarket = Pick<Market, '_doc' | 'name' | 'metadata' | 'path'>;


export class MarketsService {
  private collectionName = 'markets';

  constructor(private httpService: HttpService) {}

  public async getTopLevelMarketList(): Promise<TopLevelMarket[]> {
    return (await this.httpService.get<TopLevelMarket[]>('/api/query', {
      collection: this.collectionName,
      q: {
        'metadata.parentMarketId': {$exists: false},
      },
      h: {
        $fields: {_doc: 1, metadata: 1, name: 1, classicDescription: 1, path: 1},
      },
    })).data as TopLevelMarket[];
  }

  public async getMarketBySlugToken(slugParts: string[]): Promise<Market> {
    const slugTokenDelimiter = '@';
    const slugToken = slugParts.join(slugTokenDelimiter);

    return (await this.httpService.get<Market[]>('/api/query', {
      collection: this.collectionName,
      q: {
        'metadata.slugToken': slugToken,
      },
    })).data?.[0];
  }

  public async getSubMarketList(marketId: string): Promise<Market[]> {
    return (await this.httpService.get<Market[]>('/api/query', {
      collection: this.collectionName,
      q: {
        'metadata.parentMarketId': marketId,
      },
    })).data
  }
}


export const useMarketsService = serviceComposableFactory<MarketsService>('marketsService', () => {
  return new MarketsService(httpService);
});
