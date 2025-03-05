import {coreServiceLocator} from "../serviceLocator";

var {google} = require('googleapis');
const OAuth2: any = google.auth.OAuth2;

import * as _Promise from 'bluebird';


const privateSettings = coreServiceLocator.get('privateSettings');


interface IStateData {
  url: string;
  userId: string;
}


export class GoogleApiOAuthHelper {
  private _credentials: any = privateSettings.GMAIL.clientSecret;
  private _redirectCode: number = 301;

  constructor() {
  }

  // public async handleOAuthResponse(req: any, res: any) {
  //   let token, error;
  //
  //   const code = req['query'].code;
  //   const state = req['query'].state ? JSON.parse(req['query'].state) : {};
  //   let {url, userId} = state;
  //
  //   try {
  //     const tokensResponse: any = await this.__getOAuthTokenByCode(code);
  //     token = tokensResponse.tokens;
  //   } catch(e) {
  //     error = e;
  //   }
  //
  //   if (!token || !userId) {
  //     this.__redirectAfterTokenGetting(res, url, false);
  //   }
  //
  //   const storeTokenResult = await this.userManagement.storeGMailAuthToken(req, userId, token);
  //
  //   if (!storeTokenResult) {
  //     url = '';
  //   }
  //
  //   this.__redirectAfterTokenGetting(res, url, !error);
  // }

  public async getOAuthClientByUserId(req: Request, token) {
    if (!token) {
      return null;
    }

    return this.__getOAuthClient(token);
  }

  public getOAuthClientByUser(req: Request, user) {
      const token: any = user.gmailAuthData;

      if (!token) {
          return null;
      }

      return this.__getOAuthClient(token);
  }

  public async getOAuthClientForCurrentUser(req: Request) {
    const userData = req['userDetails'];

    if (!userData) {
      return null;
    }

    return this.getOAuthClientByUserId(req, userData._doc);
  }

  public isOAuthTokenInvalid(token: any, scopes: Array<string>): boolean {
    if (!token || !token.refresh_token) {
      return true;
    }

    if (!this._isTokenHaveScope(token, scopes)) {
      return true;
    }

    return false;
  }

  public async checkTokenAsync(token: any, scopes: Array<string>): Promise<boolean> {
    const isInvalid = this.isOAuthTokenInvalid(token, scopes);

    if (isInvalid) {
      return false;
    }

    const client = this.getOAuthClientWithToken(token);

    try {
      await client.refreshAccessToken();
    } catch (e) {
      return false;
    }

    return true;
  }

  private _isTokenHaveScope(token: any, scopes: Array<string>): boolean {
    if (!token || !token.scope) {
      return false;
    }

    return scopes.every(scope => token.scope.indexOf(scope) !== -1);
  }

  public getOAuthClientWithToken(token: any) {
    return this.__getOAuthClient(token);
  }

  public async getAuthUrlIfNeeded(req: Request, token, stateDataParams, scopeList: Array<string>) {
    const isTokenValid = await this.checkTokenAsync(token, scopeList);

    if (isTokenValid) {
      return;
    }

    return {redirectUrl: await this.getAuthUrl(stateDataParams, scopeList)};
  }

  public async getAuthUrl(stateDataParams: IStateData, scopeList: Array<string>): Promise<string> {
    return this.__getOAuthClient().generateAuthUrl({
      'access_type': 'offline',
      'scope': scopeList,
      'state': JSON.stringify(stateDataParams),
      'prompt': 'consent'
    });
  }

  private async __getOAuthTokenByCode(code: string): Promise<string> {
    if (!code) {
      return _Promise.reject('No code from Google OAuth API');
    }

    const oAuthClient = this.__getOAuthClient();

    return oAuthClient.getToken(code);
  }

  private __redirectAfterTokenGetting(res, urlFromStateData: string, success: boolean = true) {
    if (urlFromStateData.indexOf('/') !== 0) {
      return res.redirect(this._redirectCode, privateSettings.SITE_URL);
    }

    const url = success ? urlFromStateData : urlFromStateData.split('?')[0];

    return res.redirect(this._redirectCode, privateSettings.SITE_URL + url);
  }

  private __getOAuthClient(token?: any): any {
    const {client_secret, client_id, redirect_uris} = this._credentials.web;

    const client: any = new OAuth2(client_id, client_secret, redirect_uris[0]);

    if (token) {
      client.credentials = token;
    }

    return client;
  }
}
