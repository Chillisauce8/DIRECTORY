import {AuthErrorMessage} from './swp-passport-common';
import {coreServiceLocator} from '../../serviceLocator';
import {
  PassportVerifyUserStrategy,
  type PassportVerifyUserStrategyBaseConfig,
  UserHelper,
  type UserLocalAuthData,
  UserManagement,
  type VerifyUserError,
  type UserNode
} from '../index';
import {AuthHelper} from '../auth-helper';
import {ERROR_REASON} from '../../const';
import {PasswordHelper} from '../passwordHelper';



type AuthData = Required<UserLocalAuthData>;


export class PassportLocalVerifyUserStrategy extends PassportVerifyUserStrategy<UserNode, AuthData> {
  private privateSettings = coreServiceLocator.get('privateSettings');

  constructor(config: PassportVerifyUserStrategyBaseConfig,
              protected authHelper: AuthHelper,
              protected passwordHelper: PasswordHelper,
              protected userManagement: UserManagement,
              protected userHelper: UserHelper) {
    super(config);
  }

  protected async findUser(req: Request, authData: AuthData): Promise<any> {
    const {username} = authData;

    try {
      return this.userManagement.getUserDataByEmail(req, username);
    } catch (e) {
      return null;
    }
  }

  protected async verifyUserSignInIsAllowed(req: Request, userData: UserNode): Promise<boolean> {
    // todo: do not allow to log in from incorrect area
    const isLoginAllowed = this.authHelper.isLoginAllowed(req, userData);

    if (!isLoginAllowed) {
      return false;
    }

    const userSecurityQueryConfig = this.getUserSecurityQueryConfig(userData);

    const isUserTemporaryLocked = await this.authHelper.isUserTemporaryLocked(req, userSecurityQueryConfig);

    if (isUserTemporaryLocked) {
      return false;
    }

    return true;
  }

  protected async verifyUserPassword<T>(req: Request, password: string, userData: UserNode): Promise<boolean> {
    if (this.privateSettings.FAKE_LOGIN) {
      return true;
    }

    const userSecurity = await this.authHelper.getUserSecurityNode(req, {
      userId: (userData?._id ?? '').toString(),
    });

    if (!userSecurity) {
      return false;
    }

    const enforcedPassword = this.passwordHelper.enforcePassword(password);

    return await this.passwordHelper.checkPassword(enforcedPassword, userSecurity.password as string);
  }

  protected getUserNotFoundError(): VerifyUserError {
    return {
      reason: ERROR_REASON.genericAuthError,
      message: AuthErrorMessage.notFound,
    };
  }

  protected getUserPasswordVerificationError(userId: string): VerifyUserError {
    return {
      userId,
      reason: ERROR_REASON.genericAuthError,
      message: AuthErrorMessage.general,
    };
  }

  protected getUserSignInDisallowedError(userId: string): VerifyUserError {
    return {
      userId,
      reason: ERROR_REASON.genericAuthError,
      message: AuthErrorMessage.maxAttempts,
    }
  }

  private getUserSecurityQueryConfig(user: UserNode) {
    const userId = user?._id as string;
    return {userId};
  }
}
