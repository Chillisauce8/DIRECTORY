import { UserHelper, UserManagement, type UserNode } from './index';
import { AuthHelper } from './auth-helper';


export class LoginManagement {

    constructor(
        private userHelper: UserHelper,
        private userManagement: UserManagement,
        private authHelper: AuthHelper,) {
        // private passwordHelper: PasswordHelper,
        // private oAuthGoogleManagement: OAuthGoogleManagement) {
    }

    async setUserLoggedIn(req: Request, res, userData: UserNode) {
        req['userDetails'] = userData;

        await this.authHelper.saveUserTokenAuth(req, res, {userId: userData._id as string});

        if (!userData.hasEverLoggedIn) {
            await this.userManagement.saveUserFirstLoggedIn(req, userData);
        } else {
            await this.userManagement.increaseLoginCount(req, userData);
        }

        this.userHelper.setEverLoggedInUserCookie(req, res, userData);
    }

    // async loginUser(req: Request, res) {
    //     const email = req.body.username;
    //     const password = this.passwordHelper.enforcePassword(req.body.password);
    //
    //     const userData = await this.userManagement.getUserDataByEmail(req, email);
    //
    //     if (!userData) {
    //         throw {
    //             reason: ERROR_REASON.genericAuthError,
    //             message: 'User not found'
    //         };
    //     }
    //
    //     const isLoginAllowed = await this.authHelper.isLoginAllowed(req, userData);
    //
    //     if (!isLoginAllowed) {
    //         throw {
    //             reason: ERROR_REASON.genericAuthError,
    //             message: 'User not found'
    //         };
    //     }
    //
    //     const isUserTemporaryLocked = await this.authHelper.isUserTemporaryLocked(req, userData._id);
    //
    //     if (isUserTemporaryLocked) {
    //         throw {
    //             reason: ERROR_REASON.genericAuthError,
    //             message: 'The maximum number of login attempts'
    //         };
    //     }
    //
    //     const isPasswordMatched = await this.passwordHelper.checkPassword(password, userData.security.password);
    //
    //     if (isPasswordMatched || privateSettings.FAKE_LOGIN) {
    //         await this.authHelper.clearUserTemporaryLock(req, userData._id);
    //         await this.appSetUserLoggedIn(req, res, userData);
    //
    //         return userData;
    //     } else {
    //         await this.authHelper.increaseFailedLoginAttemptCount(req, userData._id);
    //
    //         throw {
    //             reason: ERROR_REASON.genericAuthError,
    //             message: 'There was a problem logging in'
    //         }
    //     }
    // }

    // async loginByOAuthGoogleToken(req: Request, res) {
    //     const refererURL = new url.URL(req['headers'].referer);
    //     const siteUrl = refererURL.origin;
    //
    //     const stateFromOAuthGoogleResponse = this.oAuthGoogleManagement.getStateFromOAuthGoogleResponse(req);
    //
    //     if (!stateFromOAuthGoogleResponse?.userId) {
    //         return res.redirect(301, siteUrl);
    //     }
    //
    //     const userId = stateFromOAuthGoogleResponse?.userId;
    //
    //     let userData = await this.userManagement.getUserDataById(req, userId);
    //
    //     let oAuthGoogleToken;
    //
    //     try {
    //         oAuthGoogleToken = await this.oAuthGoogleManagement.getOAuthGoogleTokenFromAuthResponse(req);
    //     } catch (e) {
    //         oAuthGoogleToken = null;
    //     }
    //
    //     if (!oAuthGoogleToken) {
    //         return res.redirect(301, siteUrl);
    //     }
    //
    //     await this.userManagement.storeOAuthGoogleToken(req, userId, oAuthGoogleToken);
    //     await this.appSetUserLoggedIn(req, res, userData);
    //
    //     const redirectAfterSuccess = stateFromOAuthGoogleResponse?.redirectAfterSuccess ?? null;
    //
    //     if (this.checkRedirectUrlIsSuitable(redirectAfterSuccess)) {
    //         const urlWithoutDomain = redirectAfterSuccess.startsWith('/');
    //
    //         const redirectUrl = urlWithoutDomain ? siteUrl + redirectAfterSuccess : redirectAfterSuccess;
    //
    //         return res.redirect(301, redirectUrl);
    //     }
    //
    //     res.redirect(301, siteUrl);
    // }

    // private checkRedirectUrlIsSuitable(redirectUrl: string): boolean {
    //     if (!redirectUrl) {
    //         return false;
    //     }
    //
    //     if (redirectUrl[0] === '/') {
    //         return true;
    //     }
    //
    //     const validDomainList = [privateSettings?.APPS_BASE_SETTINGS.SITE_DOMAIN];
    //
    //     return validDomainList.some(d => redirectUrl.indexOf(d) !== -1);
    // };
}
