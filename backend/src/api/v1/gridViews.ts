import { wrapDefaultDataResponse } from '../../utils';
import { XRoute, XRoutesGroup } from '../../x-route-core';
import { getCrudRequirePermissionsFor } from '../../auth/express-helpers';
import { coreServiceLocator } from '../../serviceLocator';
import { STANDARD_COLLECTIONS_DESCRIPTION } from '../../collectionNames';


const gridViewsCrud = coreServiceLocator.get('gridViewsCrud');


const handleCreate = (req: Request, res) => {
  const data = req.body;
  wrapDefaultDataResponse(res, gridViewsCrud.create(req, data));
};


const handleGetGridViewListByGridsItem = (req: Request, res) => {
  const gridId = req['params'].id;
  wrapDefaultDataResponse(res, gridViewsCrud.getGridViewListByGridsItem(req, gridId));
};


const handleGetGridViewListByDefinition = (req: Request, res) => {
  const definitionId = req['params'].id;
  const gridUrl = req['params'].url;
  wrapDefaultDataResponse(res, gridViewsCrud.getGridViewListByDefinition(req, definitionId, gridUrl));
};


const handleUpdate = (req: Request, res) => {
  const data = req.body;
  wrapDefaultDataResponse(res, gridViewsCrud.update(req, data));
};


const handleDelete = (req: Request, res) => {
  const gridViewId = req['params'].id;
  wrapDefaultDataResponse(res, gridViewsCrud.delete(req, gridViewId));
};


module.exports = function(app, callback) {
  const { readAuth, createAuth, updateAuth, deleteAuth } =
    getCrudRequirePermissionsFor(STANDARD_COLLECTIONS_DESCRIPTION.gridViews.name);

  app.post('/api/gridViews', createAuth, handleCreate);
  app.get('/api/gridViews/gridsItem/:id', readAuth, handleGetGridViewListByGridsItem);
  app.get('/api/gridViews/definition/:id/:url', readAuth, handleGetGridViewListByDefinition);
  app.put('/api/gridViews', updateAuth, handleUpdate);
  app.delete('/api/gridViews/:id', deleteAuth, handleDelete);
}
