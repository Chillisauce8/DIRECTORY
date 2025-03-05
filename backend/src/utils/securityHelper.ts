import * as _ from 'lodash';
import {returnForbidden} from "./routesHelper";
import { SECURE_COOKIES, SECURE_HEADERS } from '../const';


const ignoreMethods = {'GET':true, 'HEAD':true, 'OPTIONS':true};

const ignoreRoutes = [
    '/api/user/recovery',
    '/api/user/password',
    '/api/user/password/strength',
    '/api/user/validatePhone',
];

const ipCheckIgnoreRoutes = [
    '/',
    '/styles*',
    '/polyfills*',
    '/vendor*',
    '/main*',
    '/runtime*'
];


let _isRoutesArrayIncludes = function (req, routesArray, withRegEx: boolean = false) : boolean{
    let url = req.url;
    let urlParamsIndex = url.indexOf('?');

    if (urlParamsIndex !== -1) {
        url = url.substring(0, urlParamsIndex);
    }

    return !!_.find(routesArray, (x: any) => {
        if (_.isString(x)) {
            return x.toUpperCase() === url.toUpperCase() ||
                (withRegEx ? x !== '/' && url.toUpperCase().match(x.toUpperCase()) : false);
        } else {
            if ((x as any).isRegexp) {
                return url.match((x as any).url);
            } else if (x.url) {
                return (x as any).url.toUpperCase() === url.toUpperCase() ||
                    (withRegEx ? (x as any) !== '/' && url.toUpperCase().match((x as any).url.toUpperCase()) : false);
            }

            return false;
        }
    });
};

let _isSSRRecacheRquest = function (req): boolean {
  let safeRecacheQueryParamName = 'safeRecache';

  return safeRecacheQueryParamName in req['query'];
}

let _isIgnoreRoute = function(req): boolean {
    return _isRoutesArrayIncludes(req, ignoreRoutes);
}

export function getCsrfProtectionFunction(req, res, next) {
    if (!ignoreMethods[req.method] && !_isIgnoreRoute(req) && !_isSSRRecacheRquest(req)) {
        let cookie = req.cookies[SECURE_COOKIES.CSRF];
        let header = req['headers'][SECURE_HEADERS.CSRF];
        if (cookie === undefined || header === undefined || cookie !== header) {
            let message;
            if (!cookie) {
                message = 'No cookie';
            } else if (!header) {
                message = 'No header';
            } else {
                message = 'Not equal'
            }

            console.error('CSRF failed. ' + message);

            returnForbidden(res);
            return;
        }
    }
    return next();
}

