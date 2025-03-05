import * as _ from 'lodash';
import { coreServiceLocator } from '../../serviceLocator';
import { RequestHelper } from '../../utils';
import { IDataCrud, IQueryParams } from '../../db';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');


const CONTENT_GRID_FIELDS: any = {
  _doc: 1,
  setting: 1,
  stats: 1,
  'categories.category.title': 1,
  'categories.section': 1,
  'header.titleTag': 1,
  'links.category.title': 1,
  'links.location.title': 1,
  created: 1,
  lastEdited: 1,
  lastUpdated: 1,
};


export class AgGridContentManagement {

  constructor(private dataCrudService: IDataCrud, private requestHelper: RequestHelper) {
  }

  async getContentListForGrid(req: Request): Promise<any[]> {
    const pagination = this.requestHelper.parseRequestPaginationParams(req);
    const options = {readFromCache: false, updateCache: false};

    const query: any = this.requestHelper.parseRequestFiltrationParams(req);

    query._fields = CONTENT_GRID_FIELDS;

    const queryParams: IQueryParams = {query, pagination};

    const contentList = await this.dataCrudService.queryNodes(req,
        STANDARD_COLLECTIONS_DESCRIPTION.content, queryParams, options);

    return this._prepareContentList(contentList);
  }

  async getContentItemForGrid(req: Request, id: string): Promise<any> {
    const query = {
      _doc: id,
      _fields: CONTENT_GRID_FIELDS
    };

    const queryParams: IQueryParams = {query};

    const content = await this.dataCrudService.querySingleNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.content, queryParams);

    this._prepareContentItem(content);

    return content;
  }

  private _prepareContentList(contentList: any[]): any[] {
    if (!contentList || !contentList.length) {
      return [];
    }

    contentList.forEach(contentItem => {
      this._prepareContentItem(contentItem);
    });

    return contentList;
  }

  private _prepareContentItem(contentItem) {
    this._prepareLinks(contentItem);
    this._prepareCategories(contentItem);
    this._prepareTitleTag(contentItem);
    this._prepareLastEdited(contentItem);
  }

  private _prepareLinks(contentItem) {
    const links = _.get(contentItem, 'links');

    if (links) {
      if (links.category && links.category.length > 0) {
        links.category = links.category.map(item => item.title);
      }

      if (links.location && links.location.length > 0) {
        links.location = links.location.map(item => item.title);
      }
    }
  }

  private _prepareCategories(contentItem) {
    const categories = _.get(contentItem, 'categories');

    if (categories && categories.length > 0) {
      contentItem.categories = _.chain(categories)
        .map((item: any) => {
          if (item.category && item.category.length > 0) {
            return item.category.map(category => category.title);
          }

          return null;
        })
        .filter(item => item && item.length > 0)
        .flatten()
        .uniq()
        .value();
    }
  }

  private _prepareTitleTag(contentItem) {
    const titleTag = _.get(contentItem, 'header.titleTag');

    if (titleTag && titleTag.length > 0) {
      contentItem.header.titleTag = _.chain(titleTag)
        .map(item => item.value)
        .flatten()
        .filter(item => !!item)
        .uniq()
        .value();
    }
  }

  private _prepareLastEdited(contentItem) {
    if (!contentItem.lastEdited && contentItem.lastUpdated && contentItem.lastUpdated.name) {
      contentItem.lastEdited = {
        name: contentItem.lastUpdated.name,
        date: contentItem.lastUpdated.date,
      };
    }

    if (contentItem.lastUpdated) {
      delete contentItem.lastUpdated;
    }
  }
}


