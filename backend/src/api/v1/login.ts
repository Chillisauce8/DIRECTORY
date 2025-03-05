import passport from 'passport';
import { AuthErrorMessage } from '../../auth/passport-helpers/swp-passport-common';
import {
    passportGoogleOAuth2StrategyFactory
} from '../../auth/passport-helpers/swp-passport-google-oauth-strategy-factory';
import {coreServiceLocator} from '../../serviceLocator';
import {wrapDefaultDataResponse} from '../../utils';
import { UserNode, VerifyUserError } from '../../auth';


const authHelper = coreServiceLocator.get('authHelper');
const loginManagement = coreServiceLocator.get('loginManagement');
const userManagement = coreServiceLocator.get('userManagement');
const userHelper = coreServiceLocator.get('userHelper');


const logoutHandler = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, authHelper.removeCurrentUserToken(req, res));
};


const passportErrorHandler = async (req: Request, error: VerifyUserError) => {
    const {userId, message} = error;

    if (message === AuthErrorMessage.general && userId) {
        await authHelper.increaseFailedLoginAttemptCount(req, {userId});
    }

    throw error;
};


const signInUser = async (req: Request, res, user: UserNode): Promise<void> => {
    const config = {
        userId: (user?._id ?? '').toString(),
        userGeneralType: userHelper.getUserGeneralType(user),
    };

    await authHelper.clearUserTemporaryLock(req, config);

    if (userHelper.isSwpUser(user)) {
        await loginManagement.swpSetUserLoggedIn(req, res, user);
    } else {
        const customUserData = await userManagement.getCustomUserIfNeed(req, user);

        if (customUserData) {
            await loginManagement.appSetUserLoggedIn(req, res, user, customUserData);
        } else {
            await loginManagement.appSetUserLoggedIn(req, res, user);
        }
    }
};


const passportAuthHandler = async (req: Request, res, err: VerifyUserError, user: UserNode) => {
    if (err) {
        return await passportErrorHandler(req, err);
    }

    await signInUser(req, res, user);

    return {...userHelper.getCurrentUserSync(req)};
};


const handlePassportLocalLogin = (req: Request, res, next) => {
    passport.authenticate('local', (err: VerifyUserError, user: UserNode, info) => {
        wrapDefaultDataResponse(res, passportAuthHandler(req, res, err ?? info, user));
    })(req, res, next);
};


function prepareStateForGoogleOAuthReq(req: Request): string {
    const {email, redirectUrl, emailUsedForInvite} = req['query'];

    const params: any = {email, redirectUrl};

    if (emailUsedForInvite) {
        params.emailUsedForInvite = emailUsedForInvite;
    }

    return JSON.stringify(params);
}


function isStaffUserEmailDomain(email: string = '') {
    const masterUserEmailDomainList = ['chillisauce.com', 'chillisauce.co.uk', 'skunkworksproject.com'];

    return masterUserEmailDomainList.every(domain => email.endsWith(`@${domain}`));
}


const handlePassportGoogleOAuthLoginReq = (req: Request, res, next) => {
    const strategy = passportGoogleOAuth2StrategyFactory();

    const email = req['query'].email;

    const scope =  [
        'profile',
        'email',
    ];

    if (isStaffUserEmailDomain(email)) {
        scope.push(...[
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.readonly'
        ]);
    }

    const config: any = {
        accessType: 'offline',
        prompt: 'select_account',
        state: prepareStateForGoogleOAuthReq(req),
        scope
    };

    if (email) {
        config.loginHint = email;
    }

    passport.authenticate(strategy, config)(req, res, next);
};


module.exports = function(app, callback) {
    app.post('/api/login', handlePassportLocalLogin);

    app.get('/api/login/google', handlePassportGoogleOAuthLoginReq);

    app.get('/api/logout', logoutHandler);

    callback();
};
