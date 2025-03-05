import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse } from '../../utils';
import { getCrudRequirePermissionsFor } from '../../auth/express-helpers';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
const requestHelper = coreServiceLocator.get('requestHelper');
const definitionCrud = coreServiceLocator.get('definitionCrud');


const handleGetDefinitions = (req: Request, res, next) => {
    const pagination = (<any>requestHelper).parseRequestPaginationParams(req);
    const query = (<any>requestHelper).parseRequestFiltrationParams(req);
    const fields = (<any>requestHelper).parseRequestFieldsParams(req);

    if (fields) {
        query['_fields'] = fields;
    }

    wrapDefaultDataResponse(res, definitionCrud.getDefinitions(req, query, pagination));
};

const handleGetDefinitionByUrl = (req: Request, res) => {
    const url = req['params'].url;
    const siteArea = req['params'].siteArea;

    wrapDefaultDataResponse(res, definitionCrud.getDefinitionByUrl(req, url, siteArea));
};

const handleGetDefinitionByType = (req: Request, res) => {
    const type = req['params'].type;

    wrapDefaultDataResponse(res, definitionCrud.getDefinitionByType(req, type));
};

const handleGetDefinitionById = (req: Request, res) => {
    const id = req['params'].id;

    wrapDefaultDataResponse(res, definitionCrud.getDefinitionById(req, id));
};

const handleCreateDefinition = (req: Request, res) => {
    const data: any = req.body;

    wrapDefaultDataResponse(res, definitionCrud.addDefinition(req, data.type, data.data));
};

const handleUpdateDefinition = (req: Request, res) => {
    const data = req.body;

    wrapDefaultDataResponse(res, definitionCrud.updateDefinition(req, data));
};

const handleDeleteDefinitionById = (req: Request, res) => {
    const id = req['params'].id;

    wrapDefaultDataResponse(res, definitionCrud.deleteDefinitionById(req, id));
};

// const handleConvertAllDefinitions = (req: Request, res) => {
//     let converter = new DefinitionConverter();
//
//     wrapDefaultDataResponse(res, converter.convertAll(req));
// };
//
// const handleConvertSingleDefinition = (req: Request, res) => {
//     const type = req['params'].type;
//
//     let converter = new DefinitionConverter();
//
//     wrapDefaultDataResponse(res, converter.convertByType(req, type));
// };

module.exports = function (app, callback) {
    const {readAuth, createAuth, updateAuth, deleteAuth} =
        getCrudRequirePermissionsFor(STANDARD_COLLECTIONS_DESCRIPTION.collections.name);

    app.get('/api/definition', handleGetDefinitions);
    app.get('/api/definition/url/:url/:siteArea', handleGetDefinitionByUrl);
    app.get('/api/definition/type/:type', handleGetDefinitionByType);
    app.get('/api/definition/:id', handleGetDefinitionById);
    app.post('/api/definition', createAuth, handleCreateDefinition);
    app.put('/api/definition', updateAuth, handleUpdateDefinition);
    app.delete('/api/definition/:id', deleteAuth, handleDeleteDefinitionById);

    // app.get('/api/definitions/convert', handleConvertAllDefinitions);
    // app.get('/api/definitions/convert/:type', handleConvertSingleDefinition);

    callback();
};
