import { wrapDefaultDataResponse } from '../../utils';
import { coreServiceLocator } from '../../serviceLocator';
import { PermissionAction } from '../../auth/permissions-helper';
import { historyStateHelperFactory } from '../../db/history-state';


const historyStateHelper = historyStateHelperFactory();
const permissionsHelper = coreServiceLocator.get('permissionsHelper');


function handleRestoreNodeHistoryState(req: Request, res) {
  const {nodeType, nodeId} = req['params'];
  const {dateTime} = req['query'];
  const nodeData = req.body['nodeData'] || {};

  wrapDefaultDataResponse(res,
    historyStateHelper.restoreNodeHistoryState({nodeType, nodeId, dateTime, nodeData}));
}


function handleGetHistoryStateList(req: Request, res) {
  const {nodeType, nodeId} = req['params'];

  wrapDefaultDataResponse(res, historyStateHelper.getStateList(nodeType, nodeId));
}


function handleGetDiffToHistoryState(req: Request, res) {
  const {nodeType, nodeId} = req['params'];
  const {dateTime} = req['query'];
  const nodeData = req.body['nodeData'] || {};

  wrapDefaultDataResponse(res,
      historyStateHelper.getDiffToHistoryState({nodeType, nodeId, dateTime, nodeData}));
}


const readNodeAuth = permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.read);
const updateNodeAuth = permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.update);


function registerHistoryStateRoutes(app: any, callback: () => void) {
  app.get('/api/historyState/:nodeType/:nodeId/stateList',
      readNodeAuth, handleGetHistoryStateList);
  app.post('/api/historyState/:nodeType/:nodeId/restore',
      updateNodeAuth, handleRestoreNodeHistoryState);
  app.post('/api/historyState/:nodeType/:nodeId/restoreDiff',
      updateNodeAuth, handleGetDiffToHistoryState);

  callback();
}


module.exports = registerHistoryStateRoutes;
