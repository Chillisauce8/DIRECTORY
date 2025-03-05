// import {dataCrudService} from '../crud/crudUsingMongo';
// import {coreServiceLocator} from '../serviceLocator';
// import {AuthHelper} from '../auth';
// import {ERROR_REASON} from '../const';
// import {
//     PassportLocalStrategyConfig,
//     PassportVerifyUserStrategy
// } from './passport-helpers/swp-passport-local-strategy';
// import {
//     PassportOAuth2StrategyConfig,
//     SwpPassportOAuthVerifyUserStrategy
// } from './passport-helpers/swp-passport-oauth2-strategy';
//
//
// const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.getService('STANDARD_COLLECTIONS_DESCRIPTION');
//
//
// function clearUserSecureFields(user: any): any {
//     delete user.general.passwordResetCount;
//     delete user.general.resetPasswordToken;
//     delete user.general.password;
//
//     return user;
// }
//
//
// async function findUserByEmail(req, config: PassportLocalStrategyConfig, email: string): Promise<any> {
//
//     let userNode;
//
//     try {
//         const query = {
//             'general.email': email,
//         };
//
//         userNode = await dataCrudService.querySingleNode(req, STANDARD_COLLECTIONS_DESCRIPTION.user, {query});
//     } catch (e) {
//         return null;
//     }
//
//     return userNode;
// }
//
//
// async function getUserIdBySession(req, config: PassportLocalStrategyConfig, session: string): Promise<string> {
//
//     let userSecurityNode;
//
//     try {
//         const query = {
//             token: session
//         };
//
//         userSecurityNode = await dataCrudService.querySingleNode(req, STANDARD_COLLECTIONS_DESCRIPTION.userSecurity, {query});
//
//     } catch (e) {
//         return null;
//     }
//
//     return userSecurityNode.userId;
// }
//
//
// async function findUserBySession(req, config: PassportLocalStrategyConfig, session: string): Promise<any> {
//     let userId;
//
//     try {
//         userId = getUserIdBySession
//     } catch (e) {
//         return null;
//     }
//
//     let userNode;
//
//     try {
//         const query = {
//             '_doc': userId,
//         };
//
//         userNode = await dataCrudService.querySingleNode(req, STANDARD_COLLECTIONS_DESCRIPTION.user, {query});
//     } catch (e) {
//         return null;
//     }
//
//     return userNode;
// }
//
//
// export class PassportLocalVerifyUserStrategy extends PassportVerifyUserStrategy {
//     constructor(config: PassportLocalStrategyConfig,
//                 protected authHelper: AuthHelper) {
//         super(config);
//     }
//
//     protected async findUser<T>(req, authData: any): Promise<T> {
//         const {username} = authData;
//
//         let userNode;
//
//         try {
//             const query = {
//                 'general.email': username,
//             };
//
//             userNode = await dataCrudService.querySingleNode(req, STANDARD_COLLECTIONS_DESCRIPTION.user, {query});
//         } catch (e) {
//             return null;
//         }
//
//         return userNode;
//     }
//
//     protected async verifyUserSignInIsAllowed(req, userData: any): Promise<boolean> {
//         const isLoginAllowed = await this.authHelper.isLoginAllowed(req, userData);
//
//         if (!isLoginAllowed) {
//             return false;
//         }
//
//         const isUserTemporaryLocked = await this.authHelper.isUserTemporaryLocked(req, userData._doc);
//
//         if (isUserTemporaryLocked) {
//             return false;
//         }
//
//         return true
//     }
//
//     protected async verifyUserPassword<T>(req, password: string, userData: any): Promise<boolean> {
//         const enforcedPassword = this.passwordHelper.enforcePassword(password);
//
//         return await this.authHelper.checkPassword(enforcedPassword, userData.general.password);
//     }
//
//     protected getUserNotFoundError(): any {
//         return {
//             reason: ERROR_REASON.genericAuthError,
//             message: 'User not found'
//         };
//     }
//
//     protected getUserPasswordVerificationError(): any {
//         return {
//             reason: ERROR_REASON.genericAuthError,
//             message: 'There was a problem logging in'
//         };
//     }
//
//     protected getUserSignInDisallowedError(): any {
//         return {
//             reason: ERROR_REASON.genericAuthError,
//             message: 'The maximum number of login attempts'
//         }
//     }
// }
//
//
// export class SwpPassportGoogleOAuthVerifyUserStrategy extends SwpPassportOAuthVerifyUserStrategy {
//     constructor(config: PassportOAuth2StrategyConfig,
//                 protected authHelper: AuthHelper) {
//         super(config);
//     }
//
//     protected async findUser<T>(req, authData: any): Promise<T> {
//         const {profile} = authData;
//
//         return Promise.resolve(undefined);
//     }
//
//     protected async findOrCreateUser<T>(req, authData: any): Promise<T> {
//         return Promise.resolve(undefined);
//     }
//
//     protected getUserNotFoundError(): any {
//     }
//
//     protected getUserSignInDisallowedError(): any {
//     }
//
//     protected async verifyUserSignInIsAllowed<T>(req, userData: T): Promise<boolean> {
//         return Promise.resolve(false);
//     }
// }
