import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse } from '../../utils';
import { createDeleteRoute, readNodeRoute } from '../../db/crud-routes-fabric';
import { getCrudRequirePermissionsFor } from '../../auth/express-helpers';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
const privateSettings = coreServiceLocator.get('privateSettings');
const requestHelper = coreServiceLocator.get('requestHelper');
const dataCrudService = coreServiceLocator.get('dataCrudService');


const handleGetRoles = (req: Request, res) => {
    const query = requestHelper.parseRequestFiltrationParams(req);
    const pagination = requestHelper.parseRequestFiltrationParams(req);
    const fields = requestHelper.parseRequestFieldsParams(req);
    const ignoreCache = requestHelper.getQueryParamExt(req, 'ignoreCache');

    if (fields) {
        query._fields = fields;
    }

    const options: any = {};

    if (ignoreCache === 'true') {
        options.readFromCache = false;
    }

    wrapDefaultDataResponse(res,
        dataCrudService.queryNodes(req, STANDARD_COLLECTIONS_DESCRIPTION.roles.name, {query, pagination}));
};

const handleUpdateRole = (req: Request, res) => {
    wrapDefaultDataResponse(res, dataCrudService.updateNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.roles.name, req.body));
};


const handleGetRoleByName = async (req: Request, res) => {
    const query = {
        query: {'general.name': req['params'].name}
    };

    wrapDefaultDataResponse(res, dataCrudService.querySingleNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.roles.name, query));
};

const handleCreateRole = async (req: Request, res) => {
    wrapDefaultDataResponse(res, dataCrudService.createNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.roles.name, req.body));
};


const handleGetRolesByType = async (req: Request, res) => {
    const {type} = req['params'];

    const queryParams = {
        query: {
            'general.type': type,
        },
    };

    wrapDefaultDataResponse(res, dataCrudService.queryNodes(req,
        STANDARD_COLLECTIONS_DESCRIPTION.roles.name, queryParams));
};


const handleGetRoleByTypeAndName = async (req: Request, res) => {
    const {type, name} = req['params'];

    const queryParams = {
        query: {
            'general.name': name,
            'general.roleType': type,
        },
    };

    wrapDefaultDataResponse(res, dataCrudService.querySingleNode(req,
        STANDARD_COLLECTIONS_DESCRIPTION.roles.name, queryParams));
};


module.exports = function(app, callback) {
    const {readAuth, createAuth, updateAuth, deleteAuth} = getCrudRequirePermissionsFor(STANDARD_COLLECTIONS_DESCRIPTION.roles.name);

    app.get('/masterApi/roles', readAuth, handleGetRoles);
    app.get('/masterApi/roles/name/:name', handleGetRoleByName);
    app.get('/masterApi/roles/type/:type', handleGetRolesByType);
    app.get('/masterApi/roles/type/:type/name/:name', handleGetRoleByTypeAndName);

    app.get('/api/roles', readAuth, handleGetRoles);
    app.get('/api/roles/name/:name', handleGetRoleByName);
    app.get('/api/roles/type/:type', handleGetRolesByType);
    app.get('/api/roles/type/:type/name/:name', handleGetRoleByTypeAndName);

    app.get('/api/roles/:id', /*requireProperAreaAccess, readAuth,*/ readNodeRoute(STANDARD_COLLECTIONS_DESCRIPTION.roles.name));
    app.post('/api/roles', createAuth, handleCreateRole); //createCreationRoute(STANDARD_COLLECTIONS_DESCRIPTION.roles.name));
    app.put('/api/roles', updateAuth, handleUpdateRole);
    app.delete('/api/roles/:id', deleteAuth, createDeleteRoute(STANDARD_COLLECTIONS_DESCRIPTION.roles.name));


    // TODO:
    // app.get('/api/role', requireProperAreaAccess, createQueryNodesRoute(STANDARD_COLLECTIONS_DESCRIPTION.roles.name));
    // app.get('/api/role/name/:name', handleGetRoleByName);
    // app.get('/api/role/:id', readAuth, readNodeRoute(STANDARD_COLLECTIONS_DESCRIPTION.roles.name));

    callback();
};
