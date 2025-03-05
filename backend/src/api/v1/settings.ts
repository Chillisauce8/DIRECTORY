import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse } from '../../utils';
import {
    createCreationRoute,
    createDeleteRoute,
    createQueryNodesRoute,
    createUpdateRoute,
    readNodeRoute
} from '../../db/crud-routes-fabric';
import { getCrudRequirePermissionsFor } from '../../auth/express-helpers';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
const dataCrudService = coreServiceLocator.get('dataCrudService');
const collectionName = STANDARD_COLLECTIONS_DESCRIPTION.settings.name;


const handleGetSettingsByName = async function(req: Request, res, next) {
    const query = {
        query: {'setting.name': req['params'].name}
    };

    wrapDefaultDataResponse(res, dataCrudService.querySingleNode(req, collectionName, query));
};


module.exports = function(app, callback) {
    const {readAuth, createAuth, updateAuth, deleteAuth} = getCrudRequirePermissionsFor(collectionName);

    app.get('/api/settings', createQueryNodesRoute(collectionName));
    app.get('/api/settings/name/:name', handleGetSettingsByName);
    app.get('/api/settings/:id', readAuth, readNodeRoute(collectionName));
    app.post('/api/settings', createAuth, createCreationRoute(collectionName));
    app.put('/api/settings', updateAuth, createUpdateRoute(collectionName));
    app.delete('/api/settings/:id', deleteAuth, createDeleteRoute(collectionName));

    callback();
};
