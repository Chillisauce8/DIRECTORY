import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse } from '../../utils';
import { getCrudRequirePermissionsFor } from '../../auth/express-helpers';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
const logErrorManagement = coreServiceLocator.get('logErrorManagement');


let handleGetLogErrors = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, logErrorManagement.getLogErrorList(req));
};


module.exports = function(app, callback) {
    const {readAuth} =
        getCrudRequirePermissionsFor(STANDARD_COLLECTIONS_DESCRIPTION.logErrors.name);

    app.get('/api/logError', readAuth, handleGetLogErrors);

    callback();
};
