import {deepDiffMapper, IDataCrud} from '../db';
import * as _ from 'lodash';
import {DateHelper} from 'x-utils';
import {ChatGptHelper} from '../utils/chat-gpt-helper';
import {ListingNode} from '../fixing-scripts/migrate-listings-from-apify-kvs';
import { ObjectId } from 'mongodb';


type ParseMethod = 'JSON->JSON' | 'HTML->JSON';


interface OrganisationForSaleInfo {
  website: string;
  forSalePage: string;
  listingPattern: string;
}


interface RawListingData {
  website: string;
  url: string;
  pageJSON: string | Record<string, any>;
  parseMethod: ParseMethod;
  listingId?: string;
}


interface AggregatorUrl {
  domain: string;
  url: string;
}


interface ListingDataContentPageDetails {
  data: Record<string, any>;
  date: string;
}


interface ListingDataContentPage {
  first: ListingDataContentPageDetails;
  last: ListingDataContentPageDetails;
}


interface ListingDataContent {
  page: ListingDataContentPage;
  diffs: ListingDataContentPageDetails[];
}


interface ListingData {
  [prop: string]: any;
  listingId?: string;
  url: string;
  domain: string;
  parseMethod: ParseMethod;
  aggregatorUrls: AggregatorUrl[];
  organisationId: string;
  data: ListingDataContent;
}


export class ListingsHelper {
  constructor(protected dataCrudService: IDataCrud,
              protected dateHelper: DateHelper,
              protected chatGptHelper: ChatGptHelper) {}

  public getListingData(req: Request, id: string): Promise<ListingData> {
    const collectionName = 'listingsData';

    return this.dataCrudService.querySingleNode(req, collectionName, {
      query: {_id: new ObjectId(id)}
    });
  }

  public updateListingDataNode(req: Request, listingData: ListingData): Promise<ListingData> {
    const collectionName = 'listingsData';

    return this.dataCrudService.updateNode(req, collectionName, listingData);
  }

  public async getListingDataByUrl(req: Request, url: string): Promise<ListingData> {
    const collectionName = 'listingsData';

    return this.dataCrudService.querySingleNode(req, collectionName, {
      query: {
        url,
      }
    });
  }

  public async getListingByUrl(req: Request, url: string): Promise<any> {
    const collectionName = 'listings';

    return this.dataCrudService.querySingleNode(req, collectionName, {
      query: {'dataSource.url': url}
    });
  }

  public async getOrganisationForSaleInfo(req: Request): Promise<OrganisationForSaleInfo> {
    if (!this.checkRequestIsCorrect(req)) {
      throw 'Request is incorrect';
    }

    const collectionName = 'organisations';

    const query = {
      'salePages.forSalePage': {$exists: true},
      'salePages.listingPattern': {$exists: true},
      _fields: {
        website: 1,
        salePages: 1,
      },
    };

    const organisationList = await this.dataCrudService.queryAllAvailableNodes(req, collectionName, {
      query
    });

    return organisationList
      .map(({website, salePages: {forSalePage, listingPattern}}) => ({website, forSalePage, listingPattern}));
  }

  public async createOrUpdateListingData(req: Request, rawListingData: RawListingData): Promise<ListingData> {
    if (!this.checkRequestIsCorrect(req)) {
      throw 'Request is incorrect';
    }

    const existingListingData = await this.getListingDataByUrl(req, rawListingData.url);

     if (existingListingData) {
      return this.updateListingData(req, rawListingData, existingListingData);
    } else {
      return this.createListingData(req, rawListingData);
    }
  }

  public async checkListingDataExists(req: Request, listingUrl: string): Promise<boolean> {
    if (!this.checkRequestIsCorrect(req)) {
      throw 'Request is incorrect';
    }

    const collectionName = 'listingsData';

    const existingListingData = await this.dataCrudService.querySingleNode(req, collectionName, {
      query: {
        url: listingUrl,
      }
    });

    return !!existingListingData;
  }

  public async checkListingDataShouldBeProcessedByChatGPTByUrlList(req: Request,
                                                                   listingUrlList: string[]): Promise<{url: string; isNew: boolean; forSale?: boolean;}[]> {
    const listingDataList = await this.getListingDataByUrlList(req, listingUrlList);

    const existingListingDataUrl = listingDataList.map(i => i.url);

    const newListingUrlList = listingUrlList.filter(i => !existingListingDataUrl.includes(i));

    const forSaleListingList = await this.getForSaleListingByUrlList(req, existingListingDataUrl);

    const forSaleUrlList = forSaleListingList.map(i => i?.dataSource?.url);

    return newListingUrlList.map(url => ({url, isNew: true}))
      .concat(forSaleUrlList.map(url => ({url, isNew: false, forSale: true})));
  }

  public async checkListingsDataShouldBeProcessedByChatGPT(req: Request,
                                                           params: {url: string; pageJSON: any}): Promise<{isNew: boolean; forSale?: boolean; isModified?: boolean}> {
    const {url, pageJSON} = params;

    if (!url) {
      throw 'Url us not specified';
    }

    if (!pageJSON) {
      throw 'No page JSON';
    }

    const listingData = await this.getListingDataByUrl(req, url);

    if (!listingData) {
      return {isNew: true};
    }

    const lastPageJSON = listingData?.data?.page?.last?.data;

    const isPageUpdated = !_.isEqual(pageJSON, lastPageJSON);

    return {isNew: false, isModified: isPageUpdated}
  }

  public async createOrUpdateListingContentFromPageJSON(req: Request,
                                                        params: {url: string; website: string; pageJSON: any}): Promise<ListingNode> {
    const collectionName = 'listings';

    const listingContent = await this.generateListingFromListingPageJSON(req, params.url, params.pageJSON);

    if (!listingContent) {
      return null;
    }

    const existingListing = await this.getListingByUrl(req, params.url);

    let listing: ListingNode;

    if (!!existingListing) {
      const updatedListing = {...(_.merge(existingListing, listingContent) ?? {})};

      listing = await this.dataCrudService.updateNode(req, collectionName, updatedListing);
    } else {
      listing = await this.dataCrudService.createNode(req, collectionName, listingContent);
    }

    return listing;
  }

  private async generateListingFromListingPageJSON(req: Request,
                                                   url: string,
                                                   pageJSON: Record<string, any>): Promise<any> {
    const collectionDescription = await this.loadListingsCollectionDescription(req);

    const schema = {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "properties": collectionDescription.properties,
    };

    const messageParts = [
      `This is a JSON extraction from ${url} page:`,
      JSON.stringify(pageJSON),
      '',
      'Please use this information and return a populated JSON Object that complies with the JSON Schema you can find below.',
      'I also have several requirements:',
      '- please response with JSON object only without formatting;',
      '- to prepare final JSON object use ONLY data extracted from the page;',
      '- please transform any relative URL to absolute URL;',
      '- do NOT fill resulting object fields if you can\'t find relevant data.',
      '',
      'Here\'s JSON schema:',
      JSON.stringify(schema)
    ];

    const message = messageParts.join('\n');

    const response = await this.chatGptHelper.createCompletion(message, 'gpt-4o-mini');

    return response;
  }

  private async createListingData(req: Request, rawListingData: RawListingData): Promise<ListingData> {
    const {url, website, pageJSON, parseMethod} = rawListingData;
    const collectionName = 'listingsData';

    const websiteURL = new URL(website);

    const domain = websiteURL.hostname;

    const organisation = await this.getOrganisationByWebsite(req, website);

    if (!organisation) {
      return null;
    }

    let pageData;

    if (typeof pageJSON === 'string') {
      try {
        pageData = JSON.parse(pageJSON);
      } catch (e) {
        return null;
      }
    } else {
      pageData = pageJSON;
    }

    const listingData = {
      url,
      listingId: rawListingData?.listingId,
      domain,
      parseMethod,
      organisationId: organisation._id,
      aggregatorUrls: [],
      data: {
        page: {
          first: {
            data: pageData,
            date: this.dateHelper.saveDateTimeFormat(new Date()),
          },
          last: {
            data: pageData,
            date: this.dateHelper.saveDateTimeFormat(new Date()),
          },
        },
        diffs: []
      },
    };

    return this.dataCrudService.createNode(req, collectionName, listingData)
  }

  private async updateListingData(req: Request,
                                  rawListingData: RawListingData,
                                  existingNode: ListingData): Promise<ListingData> {
    const collectionName = 'listingsData';

    const {pageJSON} = rawListingData;

    if (!pageJSON) {
      return existingNode;
    }

    let pageData;

    if (typeof pageJSON === 'string') {
      try {
        pageData = JSON.parse(pageJSON);
      } catch (e) {
        return null;
      }
    } else {
      pageData = pageJSON;
    }

    const previousPageContent = existingNode?.data?.page?.last?.data;

    if (previousPageContent) {
      const diff = this.getDiffResult(previousPageContent, pageData);

      if (Object.keys(diff).length === 0) {
        return existingNode;
      }

      existingNode.data.diffs.push({
        data: diff,
        date: this.dateHelper.saveDateTimeFormat(new Date()),
      });
    }

    existingNode.data.page.last = {
      data: pageData,
      date: this.dateHelper.saveDateTimeFormat(new Date()),
    };

    return this.updateListingDataNode(req, existingNode);
  }

  private getListingDataByUrlList(req: Request, urlList: string[]): Promise<ListingData[]> {
    const collectionName = 'listingsData';

    return this.dataCrudService.queryAllAvailableNodes(req, collectionName, {
      query: {
        url: {'$in': urlList},
      }
    });
  }

  private async getForSaleListingByUrlList(req: Request, urlList: string[]): Promise<any[]> {
    const collectionName = 'listings';

    return this.dataCrudService.queryAllAvailableNodes(req, collectionName, {
      query: {
        'dataSource.url': {'$in': urlList},
        'sale.saleStatus': 'For Sale',
      },
    });
  }

  private async getOrganisationByWebsite(req: Request, website: string): Promise<any> {
    const collectionName = 'organisations';

    const websiteURL = new URL(website);

    const domain = websiteURL.hostname;

    return this.dataCrudService.querySingleNode(req, collectionName, {
      query: {
        website: {$regex: domain},
      },
    });
  }

  private checkRequestIsCorrect(req: Request) {
    return true;
  }

  private getDiffResult(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
    let rawDiff = deepDiffMapper().map(obj1, obj2);

    return _.pickBy(rawDiff, (value) => {
      return value && value.type !== 'unchanged';
    });
  }

  private loadListingsCollectionDescription(req: Request): Promise<Record<string, any>> {
    const collection = 'collections';

    return this.dataCrudService.querySingleNode(req, collection, {
      query: {name: 'listings'},
    });
  }
}
