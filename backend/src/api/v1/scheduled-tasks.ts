import { coreServiceLocator } from '../../serviceLocator';
import { basicAuthForScheduledTasks } from '../../auth/basic-auth';
import { wrapDefaultDataResponse } from '../../utils';



// const googleOAuthTokenValidator = coreServiceLocator.get('googleOAuthTokenValidator');
const nodeChangeTasksExecutor = coreServiceLocator.get('nodeChangeTasksExecutor');
// const eventTasks = coreServiceLocator.get('eventTasks');
// const clearDiffCollectionsHelper = coreServiceLocator.get('clearDiffCollectionsHelper');
//



const handleExecuteNodeChangeTasks = (req: Request, res) => {
    wrapDefaultDataResponse(res, nodeChangeTasksExecutor.execute(req));
};


// const handleSendReportInvalidOAuthData = (req: Request, res) => {
//     wrapDefaultDataResponse(res, googleOAuthTokenValidator.checkOAuthTokenForStaffUsers(req));
// };
//
// function dropOutdatedDiffs(req: Request, res) {
//     wrapDefaultDataResponseWithLock(res, async () => {
//         return clearDiffCollectionsHelper.process(req);
//     }, 'dropOutdatedDiffs', 60 * 60 * 1000);
// }


module.exports = function(app, callback) {

    app.post('/api/scheduler/executeNodeChangeTasks', basicAuthForScheduledTasks,
        handleExecuteNodeChangeTasks);
//
//     app.get('/api/scheduler/sendReportInvalidOAuthData', basicAuthForScheduledTasks,
//       handleSendReportInvalidOAuthData);
//
//     app.delete('/api/scheduler/dropOutdatedDiffs', basicAuthForScheduledTasks, dropOutdatedDiffs);

    callback();
};
