import { wrapDefaultDataResponse } from '../../utils';
import { coreServiceLocator } from '../../serviceLocator';
import { basicAuthForScheduledTasks } from '../../auth/basic-auth';


const associationTasksExecutor = coreServiceLocator.get('associationTasksExecutor');


const executeAppAssociationTasks = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, associationTasksExecutor.execute(req));
};


const executeAllAssociationTasks = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, associationTasksExecutor.invokeExecuteForAllActualApps());
};


module.exports = function (app, callback) {
    app.post('/api/scheduler/executeAppAssociationTasks', basicAuthForScheduledTasks,
        executeAppAssociationTasks);

    app.post('/api/scheduler/executeAllAssociationTasks', basicAuthForScheduledTasks,
        executeAllAssociationTasks);

    callback();
};
