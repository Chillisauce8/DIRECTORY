import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse, wrapDefaultDataResponseWithLock } from '../../utils';
import { PermissionAction } from '../../auth/permissions-helper';


const permissionsHelper = coreServiceLocator.get('permissionsHelper');
const rawDataHelper = coreServiceLocator.get('rawDataHelper');


const handleGetTypesList = (req: Request, res, next) => {
  wrapDefaultDataResponse(res, rawDataHelper.getCollectionList(req));
};

const handleGetNode = (req: Request, res) => {
  const nodeId = req['params'].nodeId;
  const nodeType = req['params'].nodeType;

  wrapDefaultDataResponse(res, rawDataHelper.readNode(req, nodeType, nodeId));
};

const handleDeleteNode = (req: Request, res) => {
  const nodeId = req['params'].nodeId;
  const nodeType = req['params'].nodeType;

  wrapDefaultDataResponse(res, rawDataHelper.deleteNode(req, nodeType, nodeId));
};

const handleGetNodeList = (req: Request, res) => {
  const nodeType = req['params'].nodeType;

  wrapDefaultDataResponse(res, rawDataHelper.queryList(req, nodeType));
};

const handleCreateNode = (req: Request, res) => {
  const nodeType = req.body['nodeType'];
  const nodeData = req.body['nodeData'];

  wrapDefaultDataResponse(res, () => rawDataHelper.createNode(req, nodeType, nodeData));
};

const handleUpdateNode = (req: Request, res) => {
  const nodeType = req.body['nodeType'];
  const nodeData = req.body['nodeData'];

  const nodeId = nodeData._id;

  wrapDefaultDataResponseWithLock(res, () => rawDataHelper.updateNode(req, nodeType, nodeData), nodeId);
};


module.exports = function(app, callback) {

  const readNodeAuth = permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.read);
  const deleteNodeAuth = permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.delete);
  const createNodeAuth = permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.create);
  const updateNodeAuth = permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.update);


  const getTypesHandlerList = [handleGetTypesList];
  app.get('/api/rawData/types', ...getTypesHandlerList);

  const getNodeHandlerList = [readNodeAuth, handleGetNode];
  app.get('/api/rawData/:nodeType/:nodeId', ...getNodeHandlerList);

  const getNodeListHandlerList = [readNodeAuth, handleGetNodeList];
  app.get('/api/rawData/:nodeType', ...getNodeListHandlerList);

  const deleteNodeHandlerList = [deleteNodeAuth, handleDeleteNode];
  app.delete('/api/rawData/:nodeType/:nodeId', ...deleteNodeHandlerList);

  app.post('/api/rawData', createNodeAuth, handleCreateNode);

  const updateNodeHandlerList = [updateNodeAuth, handleUpdateNode];
  app.put('/api/rawData', ...updateNodeHandlerList);

  callback();
};
