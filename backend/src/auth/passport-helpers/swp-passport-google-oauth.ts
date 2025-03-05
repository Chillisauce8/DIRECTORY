import { AuthErrorMessage } from './swp-passport-common';
import {
  type OAuthUserAuthData, type OAuthUserProfile,
  RegistrationManagement,
  PassportOAuthVerifyUserStrategy,
  type PassportVerifyUserStrategyGoogleOAuth2Config, type UserNode,
  type UserRegistrationData,
  UserHelper,
  UserManagement,
  type VerifyUserError
} from '../index';
import { ERROR_REASON } from '../../const';
import { AuthHelper } from '../auth-helper';


export class PassportGoogleOAuthVerifyUserStrategy extends PassportOAuthVerifyUserStrategy<UserNode,
    OAuthUserAuthData<OAuthUserProfile>> {

  constructor(config: PassportVerifyUserStrategyGoogleOAuth2Config,
              protected authHelper: AuthHelper,
              protected userManagement: UserManagement,
              protected registrationManagement: RegistrationManagement,
              protected userHelper: UserHelper) {
    super(config);
  }

  protected async findUser(req: Request, profile: any): Promise<any> {
    const email = profile.email ?? profile?.emails?.[0]?.value;

    try {
      return this.userManagement.getUserDataByEmail(req, email);
    } catch (e) {
      return null;
    }
  }

  protected async createUser(req: Request, authData: any) {
    const {profile, accessToken, refreshToken} = authData;

    const userRegistrationData = this.prepareUserRegistrationData(profile, accessToken, refreshToken);

    const user = await this.registrationManagement.registerUser(req, null, userRegistrationData, undefined, {});

    return user;
  }

  protected async isCreateUserAllowed(req: Request, profile: any): Promise<boolean> {
    return true;
  }

  protected getUserNotFoundError(): any {
    return {
      reason: ERROR_REASON.genericAuthError,
      message: AuthErrorMessage.notFound
    };
  }

  protected getUserSignInDisallowedError(userId: string): VerifyUserError {
    return {
      userId,
      reason: ERROR_REASON.genericAuthError,
      message: AuthErrorMessage.maxAttempts
    }
  }

  protected async verifyUserSignInIsAllowed(req, userData: any): Promise<boolean> {
    const isLoginAllowed = this.authHelper.isLoginAllowed(req, userData);

    if (!isLoginAllowed) {
      return false;
    }

    const isUserTemporaryLocked = await this.authHelper.isUserTemporaryLocked(req, {
      userId: userData._id,
    });

    if (isUserTemporaryLocked) {
      return false;
    }

    if (userData.type === 'staff') {
      return true;
    }

    return true;
  }

  private prepareUserRegistrationData(profile: any, accessToken: any, refreshToken: any): UserRegistrationData {
    const {provider, id, name, } = profile;
    const {givenName: firstName, familyName: lastName} = name;
    const email = profile.email ?? profile?.emails?.[0]?.value;

    return {
      type: 'customer',
      provider,
      providerId: id,
      name,
      firstName,
      lastName,
      email,
      accessToken,
      refreshToken,
      roles: []
    };
  }
}
