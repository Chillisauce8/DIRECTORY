import {coreServiceLocator} from '../serviceLocator';


export interface IURLHelper {
    getUserCreatedChangePasswordUrl(user: any, token: string): string;
    isRequestToStatic(url: string): boolean;
}

export class URLHelper implements IURLHelper {
    private privateSettings = coreServiceLocator.get('privateSettings');

    private _staticRegExp = /\.(svg|woff|woff2|eot|ttf|css|js|ico|png|jpg|map|txt)$/;

    public getUserCreatedChangePasswordUrl(user: any, token: string) : string{
        let siteUrl = this.privateSettings.SITE_URL;
        return `${siteUrl}/set-password?token=${token}`;
    }

    isRequestToStatic(url: string): boolean {
        return this._staticRegExp.test(url);
    }
}


