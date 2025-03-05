import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse } from '../../utils';
import { XRoute, XRoutesGroup } from '../../x-route-core';
import { getCrudRequirePermissionsFor } from '../../auth/express-helpers';
import { createQueryNodesRoute } from '../../db/crud-routes-fabric';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
const gridByDefinitionCrud = coreServiceLocator.get('gridByDefinitionCrud');
const gridByGridsItemCrud = coreServiceLocator.get('gridByGridsItemCrud');
const gridsCrud = coreServiceLocator.get('gridsCrud');


const handleGetGridsItemByAreaAndUrl = (req: Request, res) => {
  const area = req['params'].area;
  const url = req['params'].url;

  wrapDefaultDataResponse(res, gridsCrud.getGridsItemByAreaAndUrl(req, area, url));
};


const handleGetGridsItemByAreaAndCollection = (req: Request, res) => {
  const area = req['params'].area;
  const collectionName = req['params'].collectionName;

  wrapDefaultDataResponse(res, gridsCrud.getGridsItemByAreaAndCollection(req, area, collectionName));
};


const handleGetGridsItemById = (req: Request, res) => {
  const id = req['params'].id;

  wrapDefaultDataResponse(res, gridsCrud.getGridsItemById(req, id));
};


const handleCreateGridsItem = (req: Request, res) => {
  const data = req.body;

  wrapDefaultDataResponse(res, gridsCrud.createGridsItem(req, data));
};


const handleUpdateGridsItem = (req: Request, res) => {
  const data = req.body;

  wrapDefaultDataResponse(res, gridsCrud.updateGridsItem(req, data));
};


const handleDeleteGridsItem = (req: Request, res) => {
  const id = req['params'].id;

  wrapDefaultDataResponse(res, gridsCrud.deleteGridsItem(req, id));
};


const handleGetGridDataListByDefinition = (req: Request, res) => {
  const gridConfig = {
    definitionId: req['params'].definitionId,
    gridUrl: req['params'].gridUrl,
  };

  wrapDefaultDataResponse(res, gridByDefinitionCrud.getDataList(req, gridConfig));
};


const handleGetGridDataListByGridsItem = (req: Request, res) => {
  const gridConfig = {
    gridsItemId: req['params'].gridsItemId,
    collectionName: req['params'].collectionName,
  };

  wrapDefaultDataResponse(res, gridByGridsItemCrud.getDataList(req, gridConfig));
};


module.exports = function(app, callback) {
  const { readAuth, createAuth, updateAuth, deleteAuth } =
    getCrudRequirePermissionsFor(STANDARD_COLLECTIONS_DESCRIPTION.grids.name);

  app.get('/api/grids/byAreaAndUrl/:area/:url', readAuth, handleGetGridsItemByAreaAndUrl);
  app.get('/api/grids/byAreaAndCollection/:area/:collectionName',
    readAuth, handleGetGridsItemByAreaAndCollection);

  app.get('/api/grids', readAuth, createQueryNodesRoute(STANDARD_COLLECTIONS_DESCRIPTION.grids.name));
  app.get('/api/grids/:id', readAuth, handleGetGridsItemById);

  app.post('/api/grids', createAuth, handleCreateGridsItem);
  app.put('/api/grids', updateAuth, handleUpdateGridsItem);
  app.delete('/api/grids/:id', deleteAuth, handleDeleteGridsItem);

  app.get('/grids/data/byDefinition/:definitionId/:gridUrl',
    readAuth, handleGetGridDataListByDefinition);
  app.get('/grids/data/byGridsItem/:gridsItemId/:collectionName',
    readAuth, handleGetGridDataListByGridsItem);
}
