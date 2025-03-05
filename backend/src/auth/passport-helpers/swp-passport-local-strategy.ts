import {Strategy as LocalStrategy} from 'passport-local';
import {
    type PassportBaseStrategyConfig,
    PassportVerifyUserBaseStrategy,
    type PassportVerifyUserStrategyBaseConfig, type VerifyUserError
} from './swp-passport-verify-user-base-strategy';
import { type UserNode } from '../user-data.interfaces';


export interface  UserLocalAuthData {
    username?: string;
    password?: string;
}


export interface PassportLocalStrategyConfig extends PassportBaseStrategyConfig<UserNode, UserLocalAuthData> {
    usernameField: string;
    passwordField: string;
}


export abstract class PassportVerifyUserStrategy<User, AuthData extends UserLocalAuthData> extends PassportVerifyUserBaseStrategy<User, AuthData> {
    protected constructor(config: PassportVerifyUserStrategyBaseConfig) {
        super(config);
    }

    protected abstract verifyUserPassword(req: Request, password: string, userData: User): Promise<boolean>;
    protected abstract getUserPasswordVerificationError(userId: string): VerifyUserError;

    public async verify(req: Request, authData: AuthData): Promise<any> {
        const password = authData?.password;

        if (!password) {
          return null;
        }

        const userData = await this.findUser(req, authData);

        if (!userData) {
            throw this.getUserNotFoundError();
        }

        const isSignInAllowed = await this.verifyUserSignInIsAllowed(req, userData);

        if (!isSignInAllowed) {
            throw this.getUserSignInDisallowedError((userData as any)._doc);
        }

        const isPasswordValid = await this.verifyUserPassword(req, password, userData);

        if (!isPasswordValid) {
            throw this.getUserPasswordVerificationError((userData as any)._doc);
        }

        return userData;
    }
}


export function passportLocalStrategyFactory(config?: PassportLocalStrategyConfig) {
    const cfg = {
        usernameField: config?.usernameField ?? 'email',
        passwordField: config?.passwordField ?? 'password',
        passReqToCallback: true,
    }

    async function verifyUserForPassportLocalStrategy(req: Request, username, password, done): Promise<void> {
        let userData, error;

        const authData = {username, password};

        try {
            userData = await config?.verifyUserStrategy.verify(req, authData);
        } catch (e) {
            userData = null;
            error = e;
        }

        if (userData) {
            return done(null, userData)
        } else {
            return done(error, null);
        }
    }

    return new LocalStrategy(cfg, verifyUserForPassportLocalStrategy);
}
