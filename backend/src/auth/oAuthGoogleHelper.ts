import {GoogleApis} from 'googleapis';


export interface OAuthGoogleTokenParams {
    username: string;
    userId?: string;
    redirectUri?: string;
    redirectAfterSuccess?: string;
}


interface OAuthGoogleHelperConfig {
    clientSecret: {
        web: {
            client_id: string;
            client_secret: string;
            redirect_uris: string[];
        }
    }
}


export class OAuthGoogleHelper {
    constructor(private config: OAuthGoogleHelperConfig,
                private googleApi: GoogleApis) {
    }

    public async getOAuthTokenByExchangeCode(code: string, redirectUrl?: string): Promise<string> {
        if (!code) {
            throw 'No code from Google OAuth API';
        }

        const oAuthClient = this.getOAuthClient(null, redirectUrl);

        return oAuthClient.getToken(code);
    }

    public async checkTokenValid(token: any, scopes: Array<string>): Promise<boolean> {
        const isInvalid = !this.isOAuthGoogleTokenDataValid(token, scopes);

        if (isInvalid) {
            return false;
        }

        return true;
    }

    public isOAuthGoogleTokenDataValid(token: any, scopes?: Array<string>): boolean {
        if (!token || !token.refresh_token) {
            return false;
        }

        if (!this.checkTokenHasCorrectScope(token, scopes)) {
            return false;
        }

        return true;
    }

    public getGoogleAuthUrl(params: OAuthGoogleTokenParams, scopeList?: string[]): string {
        const {redirectUri} = params;

        const oAuthClient = this.getOAuthClient(null, redirectUri);

        const state = this.prepareStateForGoogleAuthUrl(params);

        return oAuthClient.generateAuthUrl({
            'access_type': 'offline',
            'scope': scopeList,
            'state': state,
            'prompt': 'consent',
            'login_hint': params.username,
        });
    }

    public getOAuthClient(oAuthGoogleToken?: any, redirectUri?: string): any {
        const {client_id, client_secret, redirect_uris} = this.config.clientSecret.web;

        if (!redirectUri) {
            redirectUri = redirect_uris[0];
        }

        const client = new this.googleApi.auth.OAuth2(client_id, client_secret, redirectUri);

        if (oAuthGoogleToken) {
            client.setCredentials(oAuthGoogleToken);
        }

        return client;
    }

    public async getUserInfo(oAuthClient: any): Promise<{email: string}> {
        return new Promise((resolve, reject) => {
            this.googleApi.oauth2("v2").userinfo.v2.me.get({auth: oAuthClient}, (e, response) => {
                if (e) {
                    return reject(e);
                }

                if (response.status !== 200) {
                    return reject(response);
                }

                resolve(response.data);
            });
        });
    }

    private prepareStateForGoogleAuthUrl(params: OAuthGoogleTokenParams): string {
        const preparedParams = {...params};

        return JSON.stringify(preparedParams);
    }

    private checkTokenHasCorrectScope(token: any, scopes?: Array<string>): boolean {
        if (!token || !token.scope) {
            return false;
        }

        if (!scopes) {
          return false;
        }

        return scopes.every(scope => token.scope.indexOf(scope) !== -1);
    }
}
