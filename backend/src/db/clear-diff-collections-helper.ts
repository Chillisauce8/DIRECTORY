import * as _ from 'lodash';
import {DateHelper} from 'x-utils';
import {STANDARD_COLLECTIONS_DESCRIPTION} from '../collectionNames';
import { IDataCrud } from './data-crud.interface';


export class ClearDiffCollectionsHelper {
  constructor(private dataCrudService: IDataCrud,
              private dateHelper: DateHelper) {}


  async process(req: Request): Promise<void> {

    const diffsTemplate = await this.dataCrudService.querySingleNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.settings.name,
        {query: {'setting.name': 'diffs'}})

    if (!diffsTemplate) {
      return;
    }

    const diffCollectionsList = await this.diffCollectionsList(req);

    for (const diffCollection of diffCollectionsList) {
      const lifespanDays = await this.getLifespanDaysForDiffCollection(diffsTemplate, diffCollection);

      if (!isFinite(lifespanDays)) {
        continue;
      }

      await this.processDiffCollection(req, diffCollection, lifespanDays);

      console.log('#Drop Outdated Diffs#', 'processed', diffCollection);
    }
  }

  private async getLifespanDaysForDiffCollection(diffsTemplate, diffCollection: string): Promise<number> {
    const defaultLifespan = _.get(diffsTemplate, 'diffs.defaultLifespan.days', null);
    const collectionLifespanList = _.get(diffsTemplate, 'diffs.collectionLifespan', []);

    if (!defaultLifespan || !collectionLifespanList.length) {
      return;
    }

    const lifespanForCollection = _.find(collectionLifespanList, v => {
      const collectionLifeSpanName = _.get(v, 'collection', '');

      if (diffCollection === collectionLifeSpanName + ':diff') {
        return true;
      }
    });

    if (lifespanForCollection && isFinite(lifespanForCollection.days)) {
      return lifespanForCollection.days;
    }

    return defaultLifespan;
  }

  private async processDiffCollection(req: Request, diffCollection: string, lifespanDays: number) {
    if (!isFinite(lifespanDays)) {
      return;
    }

    const dayAgo = this.dateHelper.saveDateFormat(this.dateHelper.getDateInNDays(new Date(), -lifespanDays));

    await this.dataCrudService.deleteNodes(req,
        STANDARD_COLLECTIONS_DESCRIPTION[diffCollection], {
      query: {
        '$or': [
          {dateTime: {$lte: dayAgo}},
          {dateTime: {$exists: false}}
        ],
      }
    });
  }

  async diffCollectionsList(req: Request): Promise<string[]> {
    const collectionList = (await this.dataCrudService.getCollectionList(req)) as {name: string}[];

    return collectionList
      .map(collection => collection.name)
      .filter(name => name.indexOf(':diff') !== -1)
      .sort()
  }
}

