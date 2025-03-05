import {STANDARD_COLLECTIONS_DESCRIPTION} from '../collectionNames';
import { DateHelper } from 'x-utils';
import { IDataCrud } from './data-crud.interface';
import { LoggingHelper } from '../utils';



export const ERROR_CATEGORIES = {
    payment: 'payment',
    // moneyCalculation: 'moneyCalculation',
    // saveEvent: 'saveEvent',
    notSorted: 'notSorted',
    ssrError: 'ssrError',
    // imanError: 'imanError',
    statisticCalculation: 'statisticCalculation',
    assocTask: 'assocTask',
    registration: 'registration',
    sendInBlue: 'sendInBlue',
    previewCompilation: 'previewCompilation',
    customScripts: 'previewCompilation'
}


export class DbLoggingHelper {
    public ERROR_CATEGORIES = ERROR_CATEGORIES;

    constructor(
        private dateHelper: DateHelper,
        private dataCrudService: IDataCrud,
        private loggingHelper: LoggingHelper) {
    }

    public async saveError(req: Request, data, category: string, additionalInfo?: string) {
        return this._saveError(req, data, category, additionalInfo);
    }
    public async getLatestErrorForCategory(req: Request,
                                           category: string, forApp: boolean = false) {
        const query = {
        };

        const pagination = {
            sort: {datetime: -1},
            limit: 1,
        };

        if (forApp) {
            query['title'] = category;
        } else {
            query['category'] = category;
        }

        return this.dataCrudService.queryNodes(req,
            STANDARD_COLLECTIONS_DESCRIPTION.logErrors.name,
            {query, pagination}, {updateCache: false});
    }

    public getErrorMessage(data) {
        return this.loggingHelper.getErrorMessage(data);
    }
    private _saveError(req: Request, data, category: string,
                       additionalInfo?: string) {
        const dt = this.dateHelper.saveDateTimeFormat(new Date);

        let message = this.getErrorMessage(data);

        if (additionalInfo) {
            message = message + ' (' + additionalInfo + ')';
        }

        return this.dataCrudService.createNode(req, STANDARD_COLLECTIONS_DESCRIPTION.logErrors.name, {
            title: category,
            message: message,
            category: category,
            datetime: dt
        }, {ignoreEventSending: true, ignoreDiff: true, ignoreRelators: true, updateCache: false});
    }
}
