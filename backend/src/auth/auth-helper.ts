import moment from 'moment';
import type { ICrudOptions, ICrudWriteOptions, IDataCrud, IQueryParams } from '../db';
import {
  type CreateUserSecurityParams,
  UserHelper, type UserNode,
  UserRegistrationProvider,
  type UserSecurityData
} from './index';
import {coreServiceLocator} from '../serviceLocator';
import {STANDARD_COLLECTIONS_DESCRIPTION} from '../collectionNames';
import { parseDomain, type ParseResultListed, ParseResultType } from 'parse-domain';
import { PasswordHelper } from './passwordHelper';
import { IpHelper } from '../utils/ip-helper';
import { SECURE_COOKIES } from '../const';
import type { TemplateManagement } from '../data-helpers/templateManagement';
import type { CacheHelper } from '../cache/cacheHelper';


interface UserSecurityQueryConfigBase {
    userId: string;
}


type UserSecurityQueryConfig = UserSecurityQueryConfigBase;


export class AuthHelper {

    private privateSettings = coreServiceLocator.get('privateSettings');

    private USERTOKEN_CACHE_TIMEOUT_SECONDS = this.privateSettings.AUTHENTICATION.loginCacheTime || 7200;
    private MAX_AGE_MAX_VALUE = 31536000;

    private DEFAULT_MAX_LOGIN_ATTEMPTS = 5;
    private DEFAULT_LOCK_PERIOD_MINUTES = 5;

    private userMaxLoginAttemptBeforeLockCount = this.privateSettings.AUTHENTICATION.maxLoginAttempt
        || this.DEFAULT_MAX_LOGIN_ATTEMPTS;
    private userLockPeriodMin = this.privateSettings.AUTHENTICATION.lockPeriodMin
        || this.DEFAULT_LOCK_PERIOD_MINUTES;


    constructor(private userHelper: UserHelper,
                private passwordHelper: PasswordHelper,
                private dataCrudService: IDataCrud,
                private cacheHelper: CacheHelper,
                private ipHelper: IpHelper,
                private templateManagement: TemplateManagement) {
        //
    }

    // isCurrentUserHasSupplierIdSync(req, supplierId) {
    //     const user = req['userDetails'];
    //
    //     if (!this._isAuthenticated(user)) {
    //         return false;
    //     }
    //
    //     return user.supplier && user.supplier.id === supplierId;
    // }

    isAuthenticated(req: Request) {
        const id = req['userDetails']?.id;
        return !!id;
    }

    isLoginAllowed(req: Request, user: UserNode): boolean {
        if (!user) {
            return false;
        }

        const isActive = user?.isActive;

        return isActive !== false;
    }

    // async createAccountAllowed(req, userType: string) {
    //      if (userType === USER_TYPES.master) {
    //          const user = req['userDetails'];
    //
    //          const appDescription = req.appDescription;
    //
    //          if (!appDescription.masterApp) {
    //              return false;
    //          }
    //
    //          return user.general.type === USER_TYPES.master;
    //      }
    //
    //     if (userType === USER_TYPES.customer) {
    //         return true;
    //     }
    //
    //     if (userType === USER_TYPES.supplierContact) {
    //             // return this._userHasPermissions(req, {
    //             //     permissionPaths: USER_PERMISSIONS.feature.supplierArea.staff,
    //             //     permissionType: USER_PERMISSIONS.type.write,
    //             //     supplierId: _.get(userData, 'supplier.id')
    //             // });
    //         return this.userHasPermissions(req, {
    //             area: PermissionArea.appArea,
    //             type: PermissionFeatureType.collections,
    //             name: STANDARD_COLLECTIONS_DESCRIPTION.supplierContact.name, action: PermissionAction.create
    //         });
    //     }
    //
    //     if (userType === USER_TYPES.staff) {
    //         return this.userHasPermissions(req, {
    //             area: PermissionArea.appArea,
    //             type: PermissionFeatureType.collections,
    //             name: STANDARD_COLLECTIONS_DESCRIPTION.staff.name, action: PermissionAction.create
    //         });
    //     }
    //
    //     return false;
    // }

    addTokens(res, domain: string|null = null): void {
        const csrfToken = this.passwordHelper.generateRandomToken();
        res.cookie('_csrf', csrfToken, {maxAge: this.USERTOKEN_CACHE_TIMEOUT_SECONDS * 1000, domain});

        res.cookie('registered', 'Yes', {maxAge: this.MAX_AGE_MAX_VALUE * 1000, domain});
    }

    async saveUserTokenAuth(req: Request, res, config: UserSecurityQueryConfig): Promise<void> {
        const token = await this.getOrCreateUserAuthToken(req, config);
        res.cookie('authdata', token, {maxAge: this.USERTOKEN_CACHE_TIMEOUT_SECONDS * 1000, httpOnly: true});

        const sessionName = this.passwordHelper.generateRandomToken();
        res.cookie('session-name', sessionName, {maxAge: this.USERTOKEN_CACHE_TIMEOUT_SECONDS * 1000});

        this.addTokens(res);
    }

    public async swpSaveUserTokenAuth(req: Request, res, userId: string) {
        const domain = this.swpPrepareDomainForCookies(req);

        const token = await this.getOrCreateUserAuthToken(req, {userId});
        res.cookie(SECURE_COOKIES.SESSION, token, {maxAge: this.USERTOKEN_CACHE_TIMEOUT_SECONDS * 1000, httpOnly: true, domain});

        const sessionName = this.passwordHelper.generateRandomToken();
        res.cookie(SECURE_COOKIES.SESSION_NAME, sessionName, {
            maxAge: this.USERTOKEN_CACHE_TIMEOUT_SECONDS * 1000,
            domain
        });

        this.addTokens(res, domain);
    }

    public async createUserSecurityItem(req: Request,
            params: CreateUserSecurityParams): Promise<UserSecurityData> {
        const userSecurity = await this.prepareUserSecurityDataFromParams(params);

        const collectionName = STANDARD_COLLECTIONS_DESCRIPTION.userSecurity.name;

        const queryOptions: ICrudWriteOptions = {
            ignoreRelators: true
        };

        return await this.dataCrudService.createNode(req, collectionName,
            userSecurity, queryOptions);
    }

    public async getUserSecurityNodeByResetPasswordToken(req: Request,
            resetPasswordToken: string): Promise<UserSecurityData|null> {
        const preparedSwpRec = this.prepareReqForUserType(req);

        const queryParams = {
            query: {resetPasswordToken},
        }

        const queryOptions: ICrudOptions = {
            updateCache: false,
            readFromCache: false
        };

        const collectionName = STANDARD_COLLECTIONS_DESCRIPTION.userSecurity.name;

        try {
            return await this.dataCrudService.querySingleNode(preparedSwpRec, collectionName,
                queryParams, queryOptions);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    public async getUserSecurityNode(req: Request,
            config: UserSecurityQueryConfig): Promise<UserSecurityData|null> {
        const {userId} = config;
        return this.getUserSecurityItem(req, userId);
    }

    public async removeCurrentUserToken(req: Request, res): Promise<boolean> {
        res.clearCookie('authdata');
        res.clearCookie('session-name');
        res.clearCookie('_csrf');

        let userData = this.userHelper.getCurrentUserSync(req);

        if (userData) {
            await this.clearUserDataToken(req, {
                userId: userData.id,
            });

            return true;
        }

        return true;
    }

    public async isUserSessionEverCreated(req: Request, userId: string): Promise<boolean> {
        const userSecurity = await this.getUserSecurityNode(req, {userId});
        return userSecurity?.token !== undefined;
    }

    public async updateUserSecurityItemWithCache(req: Request,
            userSecurity: UserSecurityData,
            config: UserSecurityQueryConfig,
            queryOptionsOverride = {}): Promise<UserSecurityData> {
        await this.updateUserSecurityItemInDB(req, userSecurity, config, queryOptionsOverride);
        await this.updateUserSecurityItemCache(req, userSecurity);

        return userSecurity;
    }

    public async updateUserPassword(req: Request,
            config: UserSecurityQueryConfig,
            password: string): Promise<void> {
        const userSecurity = await this.getUserSecurityNode(req, config);

        if (!userSecurity) {
            return;
        }

        userSecurity.password = this.passwordHelper.getPasswordHash(password);

        await this.updateUserSecurityItemWithCache(req, userSecurity, config);
    }

    public async increasePasswordResetCount(req: Request, config: UserSecurityQueryConfig): Promise<void> {
        const userSecurity = await this.getUserSecurityNode(req, config);

        if (!userSecurity) {
            return;
        }

        if (!userSecurity.passwordResetCount) {
            userSecurity.passwordResetCount = 1;
        } else {
            userSecurity.passwordResetCount += 1;
        }

        if (!userSecurity.resetPasswordToken) {
            userSecurity.resetPasswordToken = this.passwordHelper.generateRandomToken();
        }

        await this.updateUserSecurityItemWithCache(req, userSecurity, config);
    }

    public async increaseFailedLoginAttemptCount(req: Request, config: UserSecurityQueryConfig): Promise<void> {
        const userSecurity = await this.getUserSecurityNode(req, config);

        if (!userSecurity) {
            return;
        }

        if (!userSecurity.failedLoginCount) {
          userSecurity.failedLoginCount = 0;
        }

        userSecurity.failedLoginCount += 1;
        userSecurity.lastFailedLoginTime = new Date();

        await this.updateUserSecurityItemWithCache(req, userSecurity, config);
    }

    public async isUserTemporaryLocked(req: Request, config: UserSecurityQueryConfig): Promise<boolean> {
        let userSecurity = await this.getUserSecurityNode(req, config);

        if (!userSecurity) {
            return false;
        }

        const lockTimedOut = moment(userSecurity.lastFailedLoginTime)
            .add(this.userLockPeriodMin, 'm')
            .diff(moment()) < 0;

        if (lockTimedOut) {
            userSecurity.failedLoginCount = 0;
            await this.updateUserSecurityItemWithCache(req, userSecurity, config);
            return false;
        }

        if (!userSecurity.failedLoginCount) {
          return false;
        }

        return userSecurity.failedLoginCount >= this.userMaxLoginAttemptBeforeLockCount;
    }

    public async clearUserTemporaryLock(req: Request, config: UserSecurityQueryConfig): Promise<UserSecurityData|null> {
        const userData = await this.getUserSecurityNode(req, config);

        if (!userData) {
            return null;
        }

        userData.failedLoginCount = 0;

        return await this.updateUserSecurityItemWithCache(req, userData, config);
    }

    public async getUserIdByToken(req: Request, token: string): Promise<string> {
        const userSecurity = await this.getUserSecurityItemWithCacheByToken(req, token);
        return userSecurity?.userId ?? null;
    }

    public needToCheckIpAddress(req: Request): boolean {
        if (this.privateSettings.SKIP_IP_CHECK) {
            return false;
        }

        const isUserAuthenticated = this.isAuthenticated(req);

        if (!isUserAuthenticated) {
            return false;
        }

        return false;
    }

    public async checkIpAddress(req: Request, silent: boolean = false): Promise<boolean> {
        const ipAddr = req['ip'];

        if (!this.ipHelper.isIpAddressValid(ipAddr)) {
            if (!silent) {
                const user = this.userHelper.getCurrentUserSync(req);
                console.log(`checkIpAddress error for ${user ? user.name : 'unknown'}: IP address ${ipAddr} is invalid`);
            }

            return false;
        }

        const ipListFromSettingsTemplate = await this.getIpListFromSettingsTemplate(req);
        const ipListFromUserNode = this.getIpListFromUserNode(req);

        if (ipListFromSettingsTemplate && ipListFromSettingsTemplate.length > 0) {
            const isIpAddrValid = ipListFromSettingsTemplate.indexOf(ipAddr) !== -1;

            if (isIpAddrValid) {
                return Promise.resolve(true);
            }
        }

        if (ipListFromUserNode && ipListFromUserNode.length > 0) {
            let isIpAddrValid = ipListFromUserNode.indexOf(ipAddr) !== -1;

            if (isIpAddrValid) {
                return true;
            }
        }

        if (!silent) {
            const user = this.userHelper.getCurrentUserSync(req);
            console.log(`checkIpAddress error for ${user ? user.name : 'unknown'}: IP address ${ipAddr} is not found in IP white lists`);
        }

        return false;
    }

    private async getUserSecurityItem(req: Request, userId: string): Promise<UserSecurityData|null> {
        const queryParams: IQueryParams = {
            query: {userId: userId}
        };

        const queryOptions: ICrudOptions = {
            updateCache: false,
            readFromCache: false,
        };

        const collectionName = STANDARD_COLLECTIONS_DESCRIPTION.userSecurity.name;

        try {
            return await this.dataCrudService.querySingleNode(req, collectionName, queryParams, queryOptions);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    private async prepareUserSecurityDataFromParams(params: CreateUserSecurityParams): Promise<UserSecurityData> {
            const {userId, provider = UserRegistrationProvider.local, providerId, password, refreshToken, accessToken} = params;

        const securityData: UserSecurityData = {
            userId,
            provider,
        };

        if (providerId) {
            securityData.providerId = providerId;
        }

        if (provider === UserRegistrationProvider.local) {
            const hashedPassword = this.passwordHelper.getPasswordHash(password);
            const resetPasswordToken = this.passwordHelper.generateRandomToken();
            const passwordResetCount = 0;

            securityData.password = hashedPassword;
            securityData.resetPasswordToken = resetPasswordToken;
            securityData.passwordResetCount = passwordResetCount;
        } else if (provider === UserRegistrationProvider.google) {
            securityData.accessToken = accessToken;
            securityData.refreshToken = refreshToken;
        }

        return securityData;
    }

    private async getOrCreateUserAuthToken(req: Request, config: UserSecurityQueryConfig): Promise<string|null> {
        const userSecurityData = await this.getUserSecurityNode(req, config);

        if (!userSecurityData) {
          return null;
        }

        if (userSecurityData?.token) {
            return userSecurityData.token;
        }

        userSecurityData.token = this.passwordHelper.generateRandomToken();
        await this.updateUserSecurityItemWithCache(req, userSecurityData, config, {ignoreEventSending: true});

        return userSecurityData.token ?? null;
    }

    private async clearUserDataToken(req: Request, config: UserSecurityQueryConfig): Promise<boolean> {
        const userSecurity = await this.getUserSecurityNode(req, config);

        if (!userSecurity) {
          return false;
        }

        const token = userSecurity.token ? userSecurity.token : null;

        if (!token) {
            return false;
        }

        userSecurity.token = '';

        await this.clearUserSecurityItemCacheIfPossible(req, token);
        await this.updateUserSecurityItemInDB(req, userSecurity, config);

        return true;
    }

    private getUserSecurityItemCacheKey(req: Request, userAuthToken: string): string {
        const userSecurityCachePrefix = 'USER_SECURITY';

        return this.cacheHelper.createCustomCacheKey(userSecurityCachePrefix, userAuthToken);
    }

    private async getUserSecurityItemFromCacheByToken(req: Request, token: string): Promise<UserSecurityData> {
            const cacheKey = this.getUserSecurityItemCacheKey(req, token);
        return this.cacheHelper.readFromCache(req, cacheKey);
    }

    private async getUserSecurityItemFromDbByToken(req: Request, token: string):
        Promise<UserSecurityData> {
        const query: IQueryParams = {
            query: {token: token}
        };

        const queryOptions = {
            readFromCache: false,
            updateCache: false,
        };

        return this.dataCrudService.querySingleNode(req,
          STANDARD_COLLECTIONS_DESCRIPTION.userSecurity.name, query, queryOptions);
    }

    private async getUserSecurityItemWithCacheByToken(req: Request, token: string): Promise<UserSecurityData> {
        let valueFromCache;

        try {
            valueFromCache = await this.getUserSecurityItemFromCacheByToken(req, token);
        } catch (e) {
            valueFromCache = null;
        }

        if (valueFromCache) {
            return valueFromCache;
        }

        const userSecurityData = await this.getUserSecurityItemFromDbByToken(req, token);

        if (userSecurityData) {
            await this.updateUserSecurityItemCache(req, userSecurityData);
        }

        return userSecurityData;
    }

    private async updateUserSecurityItemCache(req: Request,
            userSecurityItem: UserSecurityData): Promise<UserSecurityData|null> {
        if (!userSecurityItem) {
            return null;
        }

        const {token} = userSecurityItem;

        if (!token) {
            return null;
        }

        const cacheKey = this.getUserSecurityItemCacheKey(req, token);

        try {
            return this.cacheHelper.writeToCache(req, cacheKey, userSecurityItem,
                this.USERTOKEN_CACHE_TIMEOUT_SECONDS);
        } catch (e) {
            console.log(`Update userSecurity cache problem - ${userSecurityItem._id}`);
            return null;
        }
    }

    private async updateUserSecurityItemInDB(req: Request,
            userSecurity: UserSecurityData,
            config: UserSecurityQueryConfig,
            queryOptionsOverride: ICrudWriteOptions = {}): Promise<UserSecurityData> {
        const collectionName = STANDARD_COLLECTIONS_DESCRIPTION.userSecurity.name;

        const preparedSwpRec = this.prepareReqForUserType(req);

        const queryOptions = {
            ignoreRelators: true,
            updateCache: false,
            ...queryOptionsOverride
        };

        if (!userSecurity.password) {
            throw 'Password field is empty';
        }

        return this.dataCrudService.updateNode(preparedSwpRec, collectionName, userSecurity, queryOptions);
    }

    private clearUserSecurityItemCacheIfPossible(req: Request, token: string): void {
        const cacheKey = this.getUserSecurityItemCacheKey(req, token);

        try {
            return this.cacheHelper.removeFromCache(req, cacheKey);
        } catch (e) {
            console.log(`Remove userSecurity cache problem: token - ${token}`);
        }
    }

    private async getIpListFromSettingsTemplate(req: Request): Promise<string[]|null> {
        const settingsTemplate = await this.getSettingsTemplate(req);

        if (!settingsTemplate || !settingsTemplate.settingsSystem || !settingsTemplate.settingsSystem.ipList) {
            return null;
        }

        return settingsTemplate.settingsSystem.ipList;
    }

    private async getSettingsTemplate(req: Request): Promise<any> {
        return this.templateManagement.getByName(req, 'settings');
    }

    private getIpListFromUserNode(req: Request): string[]|null {
        const user = this.userHelper.getCurrentUserSync(req);

        if (!user || !user.ipList) {
            return null;
        }

        return user.ipList;
    }

    private async isUserIpBlocked(req: Request): Promise<boolean> {
        const needToCheckIpAddress = this.needToCheckIpAddress(req);

        if (needToCheckIpAddress) {
            const checkIpResult = await this.checkIpAddress(req);
            return !checkIpResult;
        }

        return false;
    }

    private swpPrepareDomainForCookies(req: Request): string|null {
        const rawDomainName = req['domain'].split('_')[0]; // we might have "localhost_${port}" here

        const parseDomainResult = parseDomain(rawDomainName);
        const {domain, topLevelDomains} = ((parseDomainResult as any)?.icann ?? parseDomainResult) as ParseResultListed;

        if (parseDomainResult.type === ParseResultType.Invalid) {
            return null;
        }

        // something like localhost or ip addresses
        if ([ParseResultType.Reserved, ParseResultType.Ip].indexOf(parseDomainResult.type) !== -1) {
            return rawDomainName;
        }

        // set don't set domain for non-SWP domains
        if (rawDomainName.indexOf(this.privateSettings.SITE_DOMAIN) === -1) {
            return null;
        }

        return [domain, ...topLevelDomains].join('.');
    }

    prepareReqForUserType(req: Request) {
        return req;
    }
}

