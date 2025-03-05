import { ObjectId } from 'mongodb';


export class RequestParamsHelper {
    parseFieldsParams(req: Request) {
        if (req['query']?._fields) {
            return JSON.parse(req['query']._fields);
        }

        if (req['query']?.h) {
            const h = JSON.parse(req['query'].h);
            if (h.$fields) {
                return h.$fields;
            }
        }
    }

    parseAggregation(req: Request) {
        if (req['query']?.h) {
            const h = JSON.parse(req['query'].h);

            if (h?.$aggregate) {
                return h.$aggregate;
            }
        }
    }

    parsePaginationParams(req: Request) {
        let pagination: any = {};

        if (req['query']?.h) {
            const h = JSON.parse(req['query'].h);

            if (h.$max) {
                pagination.limit = h.$max;
            }

            if (h.$skip) {
                pagination.skip = h.$skip;
            }

            if (h.$orderby) {
                pagination.sort = h.$orderby;
            }
        } else {
            if (req['query']?.limit) {
                pagination.limit = req['query'].limit;
            }

            if (req['query']?.max) {
                pagination.limit = req['query'].max;
            }

            if (req['query']?.skip) {
                pagination.skip = req['query'].skip;
            }

            if (req['query']?.sort && req['query'].sort !== 'null') {
                pagination.sort = JSON.parse(req['query'].sort);
            }
        }

        return pagination;
    }

    parseFiltrationParams(req: Request) {
        let result = {};

        if (req['query'] && req['query'].q && req['query'].q !== 'null') {
            result = JSON.parse(req['query'].q);
        } else if (req['query'] && req['query'].filter && req['query'].filter !== 'null') {
            result = JSON.parse(req['query'].filter);
        }

        if ('_id' in result) {
            // @ts-ignore
            result['_id'] = new ObjectId(result['_id']);
        }

        return result;
    }
}
