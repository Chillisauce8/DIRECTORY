import { OAuthGoogleHelper, type OAuthGoogleTokenParams } from './oAuthGoogleHelper';
import { UserManagement } from './userManagement';
import { processWithLock } from '../utils/lockHelper';
import { UserRegistrationProvider } from './user-data.interfaces';
import { AuthHelper } from './auth-helper';
import type { CacheHelper } from '../cache/cacheHelper';


const url = require('url');


export interface OAuthGoogleManagementConfig {
    defaultRedirectUrl: string;
    defaultScopeList?: string[];
}


export class OAuthGoogleManagement {
    private possibilityUseRefreshTokenCachePrefix = 'USER_OAUTH_TOKEN_VALID@';

    constructor(private config: OAuthGoogleManagementConfig,
                private oAuthGoogleHelper: OAuthGoogleHelper,
                private userManagement: UserManagement,
                private cacheHelper: CacheHelper,
                private authHelper: AuthHelper) {}

    public getOAuthClientWithToken(token: any, redirectUrl?: string) {
        return this.oAuthGoogleHelper.getOAuthClient(token, redirectUrl);
    }

    public async getOAuthGoogleTokenByUserId(req: Request, userId: string) {
        return this.getOAuthGoogleToken(req, userId);
    }

    public async getOAuthClientByUserId(req: Request, userId: string, possibleUseGmailAuthData: boolean = false) {
        let token: any = await this.getOAuthGoogleToken(req, userId);

        if (!token && possibleUseGmailAuthData) {
            token = await this.userManagement.getGmailAuthToken(req, userId);
        }

        return this.getOAuthClientWithToken(token);
    }

    public async getOAuthClientForCurrentUser(req: Request,
                                              possibleUseGmailAuthData: boolean = false) {
        const userData = req['userDetails'];

        if (!userData) {
            return null;
        }

        return this.getOAuthClientByUserId(req, userData.id, possibleUseGmailAuthData);
    }

    public async getOAuthClientByUserNode(req: Request,
                                          userNode, possibleUseGmailAuthData: boolean = false) {
        const userId = userNode._id;

        return this.getOAuthClientByUserId(req, userId, possibleUseGmailAuthData);
    }

    public async checkOAuthGoogleTokenValid(token: any, scopes: string[]): Promise<boolean> {
        return this.oAuthGoogleHelper.checkTokenValid(token, scopes);
    }

    public checkOAuthGoogleTokenDataValid(token: any, scopes: string[]): boolean {
        return this.oAuthGoogleHelper.isOAuthGoogleTokenDataValid(token, scopes);
    }

    public async needProcessOAuthGoogleLogin(email: string): Promise<boolean> {
        return email.toLowerCase().indexOf('@chillisauce.') !== -1;
    }

    public async isUserOAuthGoogleTokenValidById(req: Request, userId: string): Promise<boolean> {
        const oAuthGoogleToken = await this.getOAuthGoogleToken(req, userId);

        if (!oAuthGoogleToken) {
            return false;
        }

        const isTokenDataInvalid = !this.oAuthGoogleHelper
            .isOAuthGoogleTokenDataValid(oAuthGoogleToken, this.config.defaultScopeList);

        if (isTokenDataInvalid) {
            this.clearPossibilityUseRefreshTokenWithCache(req, userId);

            return false;
        }

        const possibleUseRefreshToken = await this.checkPossibleUseRefreshTokenWithCache(req,
            oAuthGoogleToken, userId);

        if (!possibleUseRefreshToken) {
            return false;
        }

        return true;
    }

    public clearPossibilityUseRefreshTokenWithCache(req: Request, userId: string): Promise<void> {
        const cacheKey = this.possibilityUseRefreshTokenCachePrefix + userId;

        return this.cacheHelper.readFromCache(req, cacheKey);
    }

    public async checkPossibleUseRefreshTokenWithCache(req: Request, token: any, userId: string): Promise<boolean> {
        const lockToken = 'CHECK_USER_OAUTH_TOKEN@' + userId;

        return processWithLock(lockToken, 10 * 1000, async () => {
            const cacheKey = this.possibilityUseRefreshTokenCachePrefix + userId;

            const valueFromCache = await this.cacheHelper.readFromCache(req, cacheKey);

            if (valueFromCache) {
                return valueFromCache;
            }

            const client = this.getOAuthClientWithToken(token);

            let isRefreshTokenValid;

            try {
                await client.refreshAccessToken();
                isRefreshTokenValid = true;
            } catch (e) {
                isRefreshTokenValid = false;
            }

            if (!isRefreshTokenValid) {
                return false;
            }

            const tokenValidCacheTime = 10 * 60; // 10 minutes

            await this.cacheHelper.writeToCache(req, cacheKey, isRefreshTokenValid, tokenValidCacheTime);

            return isRefreshTokenValid;
        });
    }

    public async getOAuthGoogleLoginRedirectUrl(req: Request, params: OAuthGoogleTokenParams): Promise<string> {
        const {username: email, redirectUri} = params;

        const possibleToStartOAuthGoogleLogin = await this.needProcessOAuthGoogleLogin(email);

        if (!possibleToStartOAuthGoogleLogin) {
            throw 'Impossible to do login this way';
        }

        const {userData: userNode} = await this.userManagement.getUserDataByEmail(req, email);

        if (!userNode) {
            throw 'User not found';
        }

        const userId = userNode._id;

        const refererURL = new url.URL(req['headers']['referer']);

        const preparedRedirectUrl = refererURL.origin +
            (redirectUri ?? this.config.defaultRedirectUrl);

        const urlParams: OAuthGoogleTokenParams = {
            ...params, userId,
            redirectUri: preparedRedirectUrl,
        };

        const redirectUrl = this.oAuthGoogleHelper.getGoogleAuthUrl(urlParams, this.config.defaultScopeList);

        return redirectUrl;
    }

    public getStateFromOAuthGoogleResponse(req: Request): OAuthGoogleTokenParams|null {
        const state = req['query'].state ?
            JSON.parse(req['query'].state) : null;

        if (!state) {
            return null;
        }

        return state;
    }

    public async getOAuthGoogleTokenFromAuthResponse(req: Request): Promise<any> {
        const exchangeCode = req['query'].code;
        const state = this.getStateFromOAuthGoogleResponse(req);

        if (!state) {
            throw 'Incorrect response from Google oAuth service';
        }

        const tokensResponse: any = await this.oAuthGoogleHelper.getOAuthTokenByExchangeCode(exchangeCode, state.redirectUri);
        const oAuthGoogleToken = tokensResponse.tokens;

        if (!oAuthGoogleToken) {
            throw 'Impossible to get oAuth token';
        }

        const {username, userId} = state;

        const client = this.getOAuthClientWithToken(oAuthGoogleToken, state.redirectUri);

        await client.refreshAccessToken();

        const {email} = await this.oAuthGoogleHelper.getUserInfo(client);

        if (email !== username) {
            client.revokeCredentials();

            throw 'Incorrect oAuthData. Email';
        }

        const {userData, customUserData} = await this.userManagement.getUserDataById(req, userId);

        if (userData?.email !== username) {
            client.revokeCredentials();

            throw 'Incorrect oAuthData. User';
        }

        return oAuthGoogleToken;
    }

    async storeOAuthGoogleToken(req: Request, userId, oAuthToken): Promise<any> {
        const config = {userId};

        let userData = await this.authHelper.getUserSecurityNode(req, config);

        if (!userData) {
            throw 'userSecurity node is not found';
        }

        if (userData?.provider !== UserRegistrationProvider.google) {
            throw 'incorrect auth provider';
        }

        userData.accessToken = oAuthToken;

        return await this.authHelper.updateUserSecurityItemWithCache(req, userData, config);
    };

    async getOAuthGoogleToken(req: Request, userId): Promise<any> {
        const userData = await this.authHelper
          .getUserSecurityNode(req, {userId});

        if (!userData) {
            return null;
        }

        if (userData.provider !== UserRegistrationProvider.google) {
            return null;
        }

        return userData?.accessToken ?? null;
    }
}
