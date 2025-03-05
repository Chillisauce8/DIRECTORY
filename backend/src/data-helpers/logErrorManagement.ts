import { IDataCrud, IQueryParams } from '../db/data-crud.interface';
import { RequestHelper } from '../utils/request-helper';
import {STANDARD_COLLECTIONS_DESCRIPTION} from '../collectionNames';


export class LogErrorManagement {

    constructor(private dataCrudService: IDataCrud, private requestHelper: RequestHelper) {
    }

    async getLogErrorList(req: Request) {
        let pagination = this.requestHelper.parseRequestPaginationParams(req);
        let query = this.requestHelper.parseRequestFiltrationParams(req);

        query['_fields'] = {
            '_doc': 1,
            'message': 1,
            'category': 1,
            'datetime': 1
        };

        const logsQuery: IQueryParams = {
            query,
            pagination
        };

        return this.dataCrudService.queryNodes(req,
            STANDARD_COLLECTIONS_DESCRIPTION.logErrors.name,
            logsQuery, {updateCache: true});
    }
}

