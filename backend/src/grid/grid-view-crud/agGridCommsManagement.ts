import * as _ from 'lodash';
import {roundNumberAtLeastDecimalPoints} from 'x-utils';
import { coreServiceLocator } from '../../serviceLocator';

import { IDataCrud, IQueryParams } from '../../db';
import { RequestHelper } from '../../utils';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');


const COMMS_GRID_FIELDS = {
  _doc: 1,
  setting: 1,
  stats: 1,
  lastEdited: 1,
  lastUpdated: 1,
  created: 1,
};


export class AgGridCommsManagement {

  constructor(private requestHelper: RequestHelper, private dataCrudService: IDataCrud) {
  }

  async getCommsListForGrid(req: Request) {
    const pagination = this.requestHelper.parseRequestPaginationParams(req);
    const options = {readFromCache: false, updateCache: false};

    const query: any = this.requestHelper.parseRequestFiltrationParams(req);

    query._fields = COMMS_GRID_FIELDS;

    const queryParams: IQueryParams = {query, pagination};

    const commsList = await this.dataCrudService.queryNodes(req,
        STANDARD_COLLECTIONS_DESCRIPTION.comms.name, queryParams, options);

    return this._prepareCommsList(req, commsList);
  }

  private _prepareCommsList(req: Request, commsList: any[]): any[] {
    if (!commsList || !commsList.length) {
      return [];
    }

    const statsFrom = _.get(req, 'query.statsFrom');
    const statsTo = _.get(req, 'query.statsTo');

    commsList.forEach(commsTemplate => {
      this._prepareLastEdited(commsTemplate);
      this._prepareStats(commsTemplate, statsFrom, statsTo);
    });

    return commsList;
  }

  private _prepareLastEdited(commsTemplate) {
    if (!commsTemplate.lastEdited && commsTemplate.lastUpdated && commsTemplate.lastUpdated.name) {
      commsTemplate.lastEdited = {
        name: commsTemplate.lastUpdated.name,
        date: commsTemplate.lastUpdated.date,
      };
    }

    if (commsTemplate.lastUpdated) {
      delete commsTemplate.lastUpdated;
    }
  }

  private _prepareStats(commsTemplate, statsFrom: string, statsTo: string) {
    if (!commsTemplate.stats) {
      return;
    }

    this._prepareEmailStats(commsTemplate, statsFrom, statsTo);
    this._prepareSmsStats(commsTemplate, statsFrom, statsTo);

    delete commsTemplate.stats;
  }

  private _prepareEmailStats(commsTemplate, statsFrom: string, statsTo: string) {
    const emailStatsArray = _.get(commsTemplate, 'stats.email');
    commsTemplate.emailStats = this._calcStats(emailStatsArray, statsFrom, statsTo);
  }

  private _prepareSmsStats(commsTemplate, statsFrom: string, statsTo: string) {
    const smsStatsArray = _.get(commsTemplate, 'stats.sms');
    commsTemplate.smsStats = this._calcStats(smsStatsArray, statsFrom, statsTo);
  }

  private _calcStats(stats: any[], statsFrom: string, statsTo: string) {
    let sent: number = 0;
    let uniqueViews: number = 0;
    let uniqueClicks: number = 0;

    if (stats && stats.length > 0) {
      stats.forEach(statsItem => {
        if ((statsFrom && statsItem.date < statsFrom) || (statsTo && statsItem.date > statsTo)) {
          return;
        }

        if (_.isFinite(statsItem.sends)) {
          sent += statsItem.sends;
        }

        if (_.isFinite(statsItem.uniqueViews)) {
          uniqueViews += statsItem.uniqueViews;
        }

        if (_.isFinite(statsItem.uniqueClicks)) {
          uniqueClicks += statsItem.uniqueClicks;
        }
      });
    }

    const openRate = sent > 0 ? roundNumberAtLeastDecimalPoints(uniqueViews * 100 / sent, 1) : 0;
    const clickRate = sent > 0 ? roundNumberAtLeastDecimalPoints(uniqueClicks * 100 / sent, 1) : 0;

    return {sent, openRate, clickRate};
  }
}
