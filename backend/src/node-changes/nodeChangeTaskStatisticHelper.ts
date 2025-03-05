import * as _ from 'lodash';
import {DateHelper} from 'x-utils';
import {coreServiceLocator} from '../serviceLocator';
import type { IDataCrud } from '../db';
import {globalEmitter} from '../utils';
import { CRITICAL_TASK_COUNT_BY_TASK_TYPE_MAP } from '../const';


export interface NodeChangeTasksStatistic {
  count: number;
  details: {[type: string]: NodeChangeTaskTypeStatistic;};
}


export interface NodeChangeTaskTypeStatistic {
  count: number;
  dateTimeRange: {
    from: string;
    to: string;
  };
}


export interface NodeChangeTask {
  type: string;
  dateTime: string;
}


const DEFAULT_CRITICAL_TASK_COUNT = 1000;



export class NodeChangeTaskStatisticHelper {
  private statisticCacheKeyPrefix: string = ''
  private statisticCacheTTLInSec: number = 20 * 60; // twenty minutes

  private privateSettings = coreServiceLocator.get('privateSettings');
  private STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');

  constructor(private dataCrudService: IDataCrud,
              private dateHelper: DateHelper,
              private cacheHelper: any) {}

  public async sendHighTasksCountSlackReportIfNeeded(req: Request) {
    const statistic = await this.getCurrentTasksStatisticAndUpdateCache(req);

    if (!statistic.details || !Object.keys(statistic.details).length) {
      return;
    }

    const statisticWithFilteredDetailsByHighTasksCount = this.filterStatisticDetailsWithHighTasksCount(statistic);

    if (!Object.keys(statistic.details).length) {
      return;
    }

    await this.sendSlackReport(req, statisticWithFilteredDetailsByHighTasksCount);
  }

  public async getCurrentTasksStatisticFromCache(req: Request): Promise<NodeChangeTasksStatistic> {
    const valueFromCache = await this.getStatisticFromCache(req);

    if (valueFromCache) {
      return valueFromCache;
    }

    return await this.getCurrentTasksStatisticAndUpdateCache(req);
  }

  private async getCurrentTasksStatisticAndUpdateCache(req: Request): Promise<NodeChangeTasksStatistic> {
    const taskList = await this.loadActualTasksDetails(req);

    const statistic = await this.prepareTasksStatistic(taskList);

    try {
      await this.storeStatisticInCache(req, statistic);
    } catch (e) {
      console.log(`Error during saving of nodeChangeTasks statistic in cache`);
    }

    return statistic;
  }

  private prepareTasksStatistic(taskList: NodeChangeTask[]): NodeChangeTasksStatistic {
    const statistic: NodeChangeTasksStatistic = {count: taskList.length, details: {}};

    const groupedByType = _.groupBy(taskList, task => task.type);

    const typeList = _.keys(groupedByType);

    for (const type of typeList) {
      const statisticForTaskType = this.prepareTaskTypeStatistic(groupedByType[type]);

      statistic.details[type] = statisticForTaskType;
    }

    return statistic;
  }

  private prepareTaskTypeStatistic(taskList: NodeChangeTask[]): NodeChangeTaskTypeStatistic {
    const taskListSortedByDateTime: NodeChangeTask[] = _.orderBy(taskList, ['dateTime'], ['asc']);

    const oldestTask = taskListSortedByDateTime[0];
    const newestTask = taskListSortedByDateTime[taskListSortedByDateTime.length - 1];

    return {
      count: taskList.length,
      dateTimeRange: {
        from: oldestTask.dateTime,
        to: newestTask.dateTime,
      }
    };
  }

  private async loadActualTasksDetails(req: Request): Promise<NodeChangeTask[]> {
    const currentDateTime = this.dateHelper.saveDateTimeFormat(new Date());

    const query = {
      $or: [
        {executeDate: {$exists: false}},
        {executeDate: {$lte: currentDateTime}}
      ],
      _fields: {
        type: 1,
        dateTime: 1,
      },
    };

    return this.dataCrudService.queryAllAvailableNodes(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name,
        {query}, {readFromCache: false});
  }

  private async getStatisticFromCache(req: Request): Promise<NodeChangeTasksStatistic> {
    return this.cacheHelper.readFromCache(req, this.getStatisticCacheKey());

  }

  private async storeStatisticInCache(req: Request, statistic: NodeChangeTasksStatistic): Promise<void> {
    return this.cacheHelper.writeToCache(req, this.getStatisticCacheKey(), statistic, this.statisticCacheTTLInSec);
  }

  private getStatisticCacheKey(): string {
    return this.cacheHelper.createCustomCacheKey(this.statisticCacheKeyPrefix);
  }

  private filterStatisticDetailsWithHighTasksCount(stats: NodeChangeTasksStatistic): NodeChangeTasksStatistic {
    const statistic: NodeChangeTasksStatistic = _.cloneDeep(stats);

    for (const type of Object.keys(statistic.details)) {
      const criticalCount = CRITICAL_TASK_COUNT_BY_TASK_TYPE_MAP[type] || DEFAULT_CRITICAL_TASK_COUNT;

      if (statistic.details[type].count >= criticalCount) {
        continue;
      }

      delete statistic.details[type];
    }

    return statistic;
  }

  private async sendSlackReport(req: Request, statistic: NodeChangeTasksStatistic): Promise<void> {
    const subject = `High nodeChangeTasks count - ${this.privateSettings.ENVIRONMENT}`;
    const body = this.prepareSlackReportBody(statistic);

    return globalEmitter.emit('sendReport', req, subject, body);
  }

  private prepareSlackReportBody(statistic: NodeChangeTasksStatistic): string {
    return JSON.stringify(statistic, null, 2);
  }
}

