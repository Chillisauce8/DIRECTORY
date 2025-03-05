import {Strategy as GoogleOAuth2Strategy} from 'passport-google-oauth2';
import {
    type PassportBaseStrategyConfig,
    PassportVerifyUserBaseStrategy,
    type PassportVerifyUserStrategyBaseConfig
} from './swp-passport-verify-user-base-strategy';
import { type UserGeneralData, type UserNode } from '../user-data.interfaces';


export interface PassportOAuth2StrategyConfig<User, AuthData extends OAuthUserAuthData<OAuthUserProfile>>
        extends PassportBaseStrategyConfig<User, AuthData> {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    verifyUserStrategy: PassportOAuthVerifyUserStrategy<User, AuthData>;
}


export interface PassportVerifyUserStrategyGoogleOAuth2Config extends PassportVerifyUserStrategyBaseConfig {

}


export interface OAuthUserProfile extends UserGeneralData {
    emails?: {value?: string}[];
}


export interface OAuthUserAuthData<Profile> {
    accessToken: string;
    refreshToken: string;
    profile: OAuthUserProfile;
}


export abstract class PassportOAuthVerifyUserStrategy<User extends unknown, AuthData extends OAuthUserAuthData<OAuthUserProfile>>
  extends PassportVerifyUserBaseStrategy<User, AuthData> {
    protected abstract createUser(req: Request, userData: any): Promise<User>;
    protected abstract isCreateUserAllowed(req: Request, profile: any): Promise<boolean>;

    constructor(config: PassportVerifyUserStrategyGoogleOAuth2Config) {
        super(config);
    }

    protected async findOrCreateUser(req: Request, authData: AuthData, allowCreateUser: boolean = true): Promise<User|null> {
        const userData = await this.findUser(req, authData);

        if (userData) {
            return userData as any;
        }

        if (!allowCreateUser) {
            return null;
        }

        return this.createUser(req, authData);
    }

    public async verify(req: Request, authData: AuthData): Promise<any> {
        const {accessToken, refreshToken, profile} = authData;

        const {state: rawState = '{}'} = req['query'];

        const state = JSON.parse(rawState);

        const emailFromState = state.email;
        const emailFromProfile = profile.email ?? profile?.emails?.[0]?.value;

        if (emailFromState && emailFromState !== emailFromProfile) {
            throw this.getUserSignInDisallowedError(emailFromState);
        }

        const isCreateUserAllowed = await this.isCreateUserAllowed(req, profile);

        const userData = await this.findOrCreateUser(req, authData, isCreateUserAllowed);

        if (!isCreateUserAllowed && !userData) {
            throw this.getUserNotFoundError();
        }

        const isSignInAllowed = await this.verifyUserSignInIsAllowed(req, userData as User);

        if (!isSignInAllowed) {
            throw this.getUserSignInDisallowedError((userData as any)._doc);
        }

        return {userData, accessToken, refreshToken, profile};
    }
}


export function passportOAuth2StrategyFactory(config: PassportOAuth2StrategyConfig<UserNode, OAuthUserAuthData<OAuthUserProfile>>): any {
    const cfg = {
        ...config,
        passReqToCallback: true,
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    };

    async function handleUserAuthForPasswordGoogleOAuth2Strategy(req: Request, accessToken, refreshToken, profile, done) {
        let userData, error;

        const authData = {accessToken, refreshToken, profile};

        try {
            userData = await config.verifyUserStrategy.verify(req, authData);
        } catch (e) {
            userData = null;
            error = e;
        }

        if (userData) {
            return done(null, userData, null)
        } else {
            return done(error, null, null);
        }
    }

    return new GoogleOAuth2Strategy(cfg, handleUserAuthForPasswordGoogleOAuth2Strategy);
}
