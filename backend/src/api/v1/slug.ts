import {
    createCreationRoute,
    createDeleteRoute,
    createQueryNodesRoute,
    createUpdateRoute,
    readNodeRoute
} from '../../db/crud-routes-fabric';
import { wrapDefaultDataResponse } from '../../utils';
import { XRoute, XRoutesGroup } from '../../x-route-core';
import { coreServiceLocator } from '../../serviceLocator';
import { getCrudRequirePermissionsFor } from '../../auth/express-helpers';
import { PermissionView } from '../../auth/permissions-helper';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
const dataCrudService = coreServiceLocator.get('dataCrudService');

const collectionName = STANDARD_COLLECTIONS_DESCRIPTION.slugs.name;

async function getSlugByName(req: any, name: string): Promise<any> {
    return dataCrudService.querySingleNode(req, collectionName, {query: {slug: name}});
}


const handleGetSlugByName = function(req: Request, res) {
    const slugName = req['params'].name;
    wrapDefaultDataResponse(res, getSlugByName(req, slugName));
};

module.exports = function(app, callback) {
  const { readAuth, createAuth, updateAuth, deleteAuth } = getCrudRequirePermissionsFor(
    collectionName, PermissionView.any);

  app.get('/api/slugs', readAuth, createQueryNodesRoute(collectionName));
  app.get('/api/slugs/byName/:name', handleGetSlugByName);
  app.get('/api/slugs/:id', readAuth, readNodeRoute(collectionName));
  app.post('/api/slugs/:id', createAuth, createCreationRoute(collectionName));
  app.post('/api/slugs/:id', updateAuth, createUpdateRoute(collectionName));
  app.post('/api/slugs/:id', deleteAuth, createDeleteRoute(collectionName));
}
