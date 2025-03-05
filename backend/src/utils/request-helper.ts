import { RequestParamsHelper } from './request-params-helper';

import * as _ from 'lodash';


export class RequestHelper {

    constructor(private requestParamsHelper: RequestParamsHelper) {
    }

    getOriginFromRequest(req: Request) {
        if (!req) {
            return null;
        }

        return req['headers']?.['origin'];
    }

    getDomainNameFromRequest(req: Request) {
        if (!req) {
            return null;
        }

        let domainName = '';

        if (req['headers']?.['origin']) {
            domainName = req['headers']['origin'].split('//').pop();
        // } else if (req['headers']?.referer) {
        //     domainName = req['headers'].referer.split('/')[2];
        } else if (req['headers']?.['host']) {
            domainName = req['headers']['host'].split('/').pop();
        }

        domainName = domainName.replace(':', '_');

        // if (domainName === 'nodejsserver' || /\d{1,3}_\d{1,3}_\d{1,3}_\d{1,3}/.test(domainName)) {
        //     console.log(req.url, JSON.stringify(req['headers']));
        // }

        // console.log(domainName);

        return domainName;
    }

    getQueryParamExt(req: Request, paramName: string) {
        if (!req) {
            return null;
        }

        let param = req['query'][paramName];

        if (param) {
            return param;
        }

        let prevUrl;

        if (req['headers']?.['origin']) {
            prevUrl = req['headers']['origin'];
        // } else if (req['headers']?.referer) {
        //     prevUrl = req['headers'].referer;
        } else if (req['headers']?.['host']) {
            prevUrl = req['headers']['host'];
        }

        if (!prevUrl) {
            return null;
        }

        const queryPart = prevUrl.split('?')[1];

        if (!queryPart) {
            return null;
        }

        const rawParams = queryPart.split('&');

        const properParamRaw = _.find(rawParams, item => {
            return item.startsWith(paramName + '=');
        });

        if (!properParamRaw) {
            return null;
        }

        return properParamRaw.replace(paramName + '=', '');
    }

    isRequestToStatic(url: string) {
        const staticRegExp = /\.(svg|woff|woff2|eot|ttf|css|js|ico|png|jpg|map|txt|json)$/;
        const serviceWorkerManifestName = 'ngsw.json';

        return staticRegExp.test(url) || url.indexOf(serviceWorkerManifestName) !== -1;
    }

    parseRequestFieldsParams(req: Request) {
        return this.requestParamsHelper.parseFieldsParams(req);
    }

    parseRequestPaginationParams(req: Request) {
        return this.requestParamsHelper.parsePaginationParams(req);
    }

    parseAggregation(req: Request) {
        return this.requestParamsHelper.parseAggregation(req);
    }

    parseRequestFiltrationParams(req: Request) {
        return this.requestParamsHelper.parseFiltrationParams(req);
    }
}

