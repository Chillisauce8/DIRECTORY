import * as BBPromise from 'bluebird';
import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse } from '../../utils';
import { PermissionAction } from '../../auth/permissions-helper';
import { RelatorChoicesParams } from '../../db';


const permissionsHelper = coreServiceLocator.get('permissionsHelper');
const relatorsManagement = coreServiceLocator.get('relatorsManagement');


const handleGetRelators = function(req: Request, res, next) {
    const type = req['params'].type;
    const field = req['params'].field;

    wrapDefaultDataResponse(res, relatorsManagement.getRelatorsForType(req, type, field));
};


const _getPromiseForRelatorChoices = async function(req, params: RelatorChoicesParams) {
    return relatorsManagement.getRelatorChoices(req, params);
};


const handleGetRelatorChoices = function(req: Request, res, next) {
    const path = req.body['path'];
    const schema = req.body['schema'];
    const limitWithIdList = req.body['limitWithIdList'];
    const additionalData = req.body['additionalData'];
    const targetNodeId = req.body['originalNodeId'];

    const dataPromise = _getPromiseForRelatorChoices(req, {path, schema, targetNodeId,
        additionalData, limitWithIdList});

    wrapDefaultDataResponse(res, dataPromise);
};


const handleGetRelatorsChoicesInBulk = function(req: Request, res, next) {
    const relatorsData: any = req.body;

    const allPromises = [];
    for (let i = 0; i < relatorsData.length; ++i) {
        allPromises.push(_getPromiseForRelatorChoices(req, relatorsData[i]));
    }

    const dataPromise = BBPromise.all(allPromises);
    wrapDefaultDataResponse(res, dataPromise);
};


module.exports = function (app, callback) {

    const readNodeAuth = permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.read);
    const readRelatorsBulk = permissionsHelper.requireRelatorsBulkPermissionsFor(PermissionAction.read);

    app.get('/api/relator/_sys/:type', readNodeAuth, handleGetRelators);
    app.get('/api/relator/_sys/:type/:field', readNodeAuth, handleGetRelators);
    app.post('/api/relator', readNodeAuth, handleGetRelatorChoices);
    app.post('/api/relators/bulk', /*requireProperAreaAccess, readRelatorsBulk,*/ handleGetRelatorsChoicesInBulk);

    callback();
};
