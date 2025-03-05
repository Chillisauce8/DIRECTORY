import {ERROR_REASON} from '../const';
import {setNoStoreForResponse} from './responseHelper';
import { DEFAULT_LOCK_TIME, processWithLock } from './lockHelper';

import * as _ from 'lodash';
const lockHelper = require('./lockHelper');



const needLogError = function(error: any) {
    if (error.name === 'LockError') {
        return false;
    }

    return true;
}

export async function wrapDefaultDataResponse(res, dataPromise) {
    try {
        const dataResult = await dataPromise;

        let result : any = {ok: true};

        if (typeof dataResult !== 'undefined') {
            if (dataResult && dataResult.isServiceMessage){
                result.data = dataResult.data;
            }
            else {
                result.data = dataResult;
            }
        }

        if (result.data && _.isArray(result.data)) {
            result.count = result.data.length;
        }

        res.status(200).json(result);
    } catch(err) {
        const result : any = {ok: false};
        let status = 500;

        if (err) {
            if (needLogError(err)) {
                console.log(err.stack || JSON.stringify(err));
            }

            if (Array.isArray(err)){
                result.errors = err;
            } else if (_.isString(err)) {
                result.message = err;
            } else {
                if (err.status) {
                    status = err.status;
                }

                if (err.reason){
                    if (err.reason === ERROR_REASON.objectNotFound) {
                        status = 404;
                    }
                    else if (err.reason === ERROR_REASON.genericAuthError) {
                        status = 403;
                    }
                    else if (err.reason === ERROR_REASON.invalidData) {
                        status = 400;
                    }
                }

                if (err.message) {
                    result.message = err.message;
                }

                if (err.errors) {
                    result.errors = err.errors;
                }
            }
        }

        if (res.finished) {
            return;
        }

        setNoStoreForResponse(res);
        res.status(status).json(result);
    }
}

export function wrapDefaultDataResponseWithLock(res, functionToCall, resourceName, lockTime=null) {
    let dataPromise = lockHelper.processWithLock(resourceName || 'defaultLock',
        lockTime || lockHelper.DEFAULT_LOCK_TIME, functionToCall);
    return wrapDefaultDataResponse(res, dataPromise);
}

export function wrapRawDataResponse(res, dataPromise) {
    dataPromise
        .then(function (dataResult) {
            res.status(200).json(dataResult);
        })
        .catch(function (err) {
            var result : any = {};
            var status = 500;

            if (err) {
                console.log(JSON.stringify(err));
            }

            res.status(status).json(result);
        });
}


export function wrapDefaultDataResponseWithAppLock(req: Request, res, functionToCall, resourceName, lockTime=null) {
    let dataPromise = processWithLock((resourceName || 'defaultLock'),
        lockTime || DEFAULT_LOCK_TIME, functionToCall);
    return wrapDefaultDataResponse(res, dataPromise);
}

export function returnNotAuthenticated (res) {
    if (res.testAccess) {
        res.accessDenied = true;
        return;
    }

    res.status(401).json({"ok": false, "message": "Not authenticated"});
}

export function returnForbidden(res, message?: string) {
    if (res.testAccess) {
        res.accessDenied = true;
        return;
    }

    res.status(403).json({"ok": false, "message": message || "Forbidden"});
}

export function returnNotFound(res, message) {
    message = message || 'Not found';
    res.status(404).json({ok: false, message: message});
}
