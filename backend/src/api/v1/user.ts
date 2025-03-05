import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse, wrapDefaultDataResponseWithLock } from '../../utils';
import * as BBPromise from 'bluebird';
import { getCrudRequirePermissionsFor, requireAuthenticated } from '../../auth/express-helpers';
import { STANDARD_COLLECTIONS_DESCRIPTION } from '../../collectionNames';
import { PermissionView } from '../../auth/permissions-helper';


const userManagement = coreServiceLocator.get('userManagement');
const userHelper = coreServiceLocator.get('userHelper');
const authHelper = coreServiceLocator.get('authHelper');
const neutrinoApiHelper = coreServiceLocator.get('neutrinoApiHelper');
const privateSettings = coreServiceLocator.get('privateSettings');
const loggingHelper = coreServiceLocator.get('loggingHelper');


const handleGetOwnUser = async function(req: Request, res, next) {
    // todo: do nod allow to restore user in incorrect site area
    const user = userHelper.getCurrentUserSync(req);

    if (user) {
        await authHelper.addTokens(res);
        res.status(200).json({ok: true, data: user});
    } else {
        // res.cookie("authdata", '');
        res.status(200).json({ok: false});
    }
};


const handleUpdateOwnAccount = function(req: Request, res, next) {
    const newData: any = req.body;
    const user = userHelper.getCurrentUserSync(req);

    wrapDefaultDataResponseWithLock(res, async () => {
        const updatedUser = await userManagement.updateOwnUser(req, newData);

        if (newData.password) {
            const config = {
                userId: user._id ?? user.id,
            };

            await authHelper.updateUserPassword(req, config, newData.password);
        }

        return updatedUser;
    }, user.id);
};


const handleRecoveryOwnUser = async function(req: Request, res, next) {
    const email = req.body?.['email'];
    const {userData} = await userManagement.getUserDataByEmail(req, email);

    if (!userData) {
        res.status(404).json({ok: false, message: "User not found"});
        return;
    }

    wrapDefaultDataResponseWithLock(res, () =>
            authHelper.increasePasswordResetCount(req, {userId: userData._id}),
        userData._id);
};


const handleGetPasswordStrengthByToken = async function(req: Request, res, next) {
    const token = req.body['token'];

    try {
      const result = await userManagement.handleGetPasswordStrengthByToken(req, token);
      wrapDefaultDataResponse(res, async () => result);
    } catch(err) {
        loggingHelper.toLogError(err);
        res.status(404).json({ok: false, message: err.message || err});
    }
};


const handleSetNewPasswordForOwnUser = async function(req: Request, res, next) {
    const token = req.body['token'];

    const newPassword = req.body['password'];

    try {
        const data = await authHelper.getUserSecurityNodeByResetPasswordToken(req, token);

        if (!data) {
            loggingHelper.toLogError('Token not found');
            return BBPromise.reject({message: 'Bad request'});
        }

        await authHelper.updateUserPassword(req, {userId: data.userId}, newPassword);

        res.status(200).json({ok: true});
    }
    catch(err) {
        loggingHelper.toLogError(err);
        res.status(404).json({ok: false, message: err.message || err});
    }
};


const handleGetIpInfo = function(req: Request, res) {
    wrapDefaultDataResponse(res, neutrinoApiHelper.getIpInfo(req));
};


const handleValidatePhone = function(req: Request, res) {
    const phone = req.body['phone'];
    wrapDefaultDataResponse(res, neutrinoApiHelper.validatePhone(req, phone));
};


const handleGetUserById = (req: Request, res, next) => {
    const {id} = req['params'];
    const {userData, customUserData} = userManagement.getUserDataById(req, id);
    wrapDefaultDataResponse(res, customUserData || userData);
};


const handleUpdateUser = (req: Request, res) => {
    wrapDefaultDataResponse(res, userManagement.updateUserData(req, req.body['_id'], req.body));
};


const handleGetMinifiedUserById = (req: Request, res) => {
    const {id} = req['params'];
    const {userData, customUserData} = userManagement.getUserDataById(req, id);

    wrapDefaultDataResponse(res, userHelper.prepareInternalUserData(req, userData, customUserData,
      {skipCustomSettings: true}));
}


module.exports = function(app, callback) {
    const {readAuth, createAuth, updateAuth, deleteAuth} =
        getCrudRequirePermissionsFor(STANDARD_COLLECTIONS_DESCRIPTION.users.name, PermissionView.any);

    app.get('/api/user', handleGetOwnUser); // get user from current session
    app.put('/api/user', requireAuthenticated, handleUpdateOwnAccount);
    app.post('/api/user/recovery', handleRecoveryOwnUser);
    app.post('/api/user/password', handleSetNewPasswordForOwnUser);
    app.post('/api/user/password/strength', handleGetPasswordStrengthByToken);

    app.get('/api/user/minified/:id', handleGetMinifiedUserById);

    app.get('/api/user/getIpInfo', handleGetIpInfo);
    app.post('/api/user/validatePhone', handleValidatePhone);

    app.get('/api/users/:id', readAuth, handleGetUserById);
    // TODO: depends on area
    app.put('/api/users', updateAuth, handleUpdateUser);

    callback();
};
