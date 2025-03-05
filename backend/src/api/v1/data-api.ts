import { wrapDefaultDataResponse } from '../../utils';
import { coreServiceLocator } from '../../serviceLocator';


const dataApiHelper = coreServiceLocator.get('dataApiHelper');


const handleDataQuery = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, dataApiHelper.dataQuery(req));
};

const handleDataCreateForCollection = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, dataApiHelper.dataCreateForCollection(req, req['params'].collection, req.body));
}

const handleDataUpdateForCollection = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, dataApiHelper.dataUpdateForCollection(req, req['params'].collection, req.body));
}

const handleDataDelete = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, dataApiHelper.dataDelete(req, req['params'].collection, req['params'].id));
}

const handleDataGet = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, dataApiHelper.dataGet(req, req['params'].collection, req['params'].id));
}


module.exports = function (app, callback) {
  app.get('/api/query', handleDataQuery);
  app.post('/api/query', handleDataQuery);
  app.post('/api/create/:collection', handleDataCreateForCollection);

  app.post('/api/update/:collection', handleDataUpdateForCollection);
  app.post('/api/delete/:collection/:id', handleDataDelete);
  app.post('/api/get:collection/:id', handleDataGet);


  callback();
};

