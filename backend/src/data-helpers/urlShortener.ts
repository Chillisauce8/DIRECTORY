import * as shortid from 'shortid';
import * as Hashids from 'hashids';
import * as _ from 'lodash';
import {STANDARD_COLLECTIONS_DESCRIPTION} from '../collectionNames';
import { IDataCrud } from '../db';


export interface IShortenerNode {
  originalUrl: string;
  urlCode: string;
  shortUrl: string;
  commsTrackingToken: string;
  _doc?: string;
}


export class UrlShortener {

  constructor(private dataCrudService: IDataCrud) {

  }

  private urlBaseIdentifier: string = '/s';
  private shortUrlLength: number = 5;
  private alphabet: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_';

  async create(req: Request, originalUrl: string,
               commsTrackingToken?: string): Promise<IShortenerNode> {
    const urlCode = this.getUrlCode();

    const existingNodeWithCode = await this.getByCode(req, urlCode);

    if (existingNodeWithCode) {
      return this.create(req, originalUrl, commsTrackingToken);
    }

    const shortUrl = `${this.urlBaseIdentifier}/${urlCode}`;

    const nodeBody = _.assign({originalUrl, shortUrl, urlCode}, commsTrackingToken ? {commsTrackingToken} : {});

    return this.dataCrudService.createNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.shortener.name, nodeBody,
        {ignoreDiff: true}) as Promise<IShortenerNode>;
  }

  async createFromData(req: Request, nodeBody:
      IShortenerNode): Promise<IShortenerNode> {
    return this.dataCrudService.createNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.shortener.name,
        nodeBody, {ignoreDiff: true}) as Promise<IShortenerNode>;
  }

  async getByUrl(req: Request, originalUrl: string): Promise<IShortenerNode> {
    const query = {originalUrl};
    return this.dataCrudService.querySingleNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.shortener.name, {query});
  }

  async getManyByOriginalUrl(req: Request,
                             originalUrl: string): Promise<IShortenerNode[]> {
    const query = {originalUrl};
    return this.dataCrudService.queryAllAvailableNodes(req,
        STANDARD_COLLECTIONS_DESCRIPTION.shortener.name, {query});
  }

  async getByCode(req: Request, urlCode: string): Promise<IShortenerNode> {
    const query = {urlCode};
    return this.dataCrudService.querySingleNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.shortener.name, {query});
  }

  async delete(req: Request, node: IShortenerNode) {
    return this.dataCrudService.deleteNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.shortener.name,
        {nodeId: node._doc}, {ignoreDiff: true});
  }

  private getUrlCode(): string {
    const hashIds = new Hashids(shortid.generate(), this.shortUrlLength, this.alphabet);
    return hashIds.encode(1);
  }
}

