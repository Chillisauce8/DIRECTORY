import type {
  AuthActionError,
  AuthActionResult, SignInFormValue, SignUpFormValue
} from '~/service/auth/auth-form.types';
import {AuthActionErrorType, AuthProvider} from '~/service/auth/auth-form.types';
import {LoginMethod, UserService} from '~/service/user-common/user.service';
import {useUserService} from '~/service/user-common/user-service.factory';
import {extractNamePartsFromFullName} from '~/service/user-common/user-form-helpers';


interface SignInGoogleProviderParams {
  email?: string;
}


export class AuthFormHandlerService {
  constructor(private userService: UserService) {}

  public async processSignInFormSubmit(value: SignInFormValue): Promise<AuthActionResult> {
    const {provider} = value;

    if (provider === AuthProvider.local) {
      return this.processSignInLocalProvider(value);
    } else {
      await this.processSignInGoogleProvider(value);
    }
  }

  public async processSignUpFormSubmit(value: SignUpFormValue): Promise<AuthActionResult> {
    const {provider} = value;

    if (provider === AuthProvider.local) {
      if (value.generatePassword) {
        return this.processSignUpLocalProviderWithPasswordGeneration(value);
      } else {
        return this.processSignUpLocalProvider(value);
      }
    } else {
      await this.processSignInGoogleProvider(value);
    }
  }

  private async processSignInLocalProvider(params: SignInFormValue): Promise<AuthActionResult> {
    const {email, password} = params;

    let result;

    try {
      result = await this.userService.login(email, password as string);
    } catch (e) {
      throw this.processError(e);
    }

    return result;
  }

  private async processSignUpLocalProvider(params: SignUpFormValue): Promise<AuthActionResult> {
    const {email, name, phone, password} = params;

    const extractResult = extractNamePartsFromFullName(name);

    if (!extractResult) {
      throw Error('Not correct name passed');
    }

    const {firstName, lastName} = extractResult;

    const registrationData = {
      email,
      lastName,
      firstName,
      phone,
      password,
      emailValidation: {
        isEmailValid: false,
        isValidationOverridden: true,
      },
      verifiedPhone: false,
    }

    let result;

    try {
      result = await this.userService.registerCustomer(registrationData);
    } catch (e) {
      throw this.processError(e);
    }

    await this.userService.handleLoginResponse(result, LoginMethod.auto);

    return result;
  }

  private async processSignUpLocalProviderWithPasswordGeneration(params: SignUpFormValue): Promise<AuthActionResult> {
    const {email, name, phone} = params;

    const extractResult = extractNamePartsFromFullName(name);

    if (!extractResult) {
      throw Error('Not correct name passed');
    }

    const {firstName, lastName} = extractResult;

    const registrationData = {
      email,
      lastName,
      firstName,
      phone,
      emailValidation: {
        isEmailValid: false,
        isValidationOverridden: true,
      },
      verifiedPhone: false,
    }

    let result;

    try {
      result = await this.userService.registerCustomerWithPasswordGeneration(registrationData, {
        loginUser: false
      });
    } catch (e) {
      throw this.processError(e);
    }

    return result;
  }

  private async processSignInGoogleProvider(params: SignInGoogleProviderParams): Promise<AuthActionResult> {
    throw 'Not implemented yet';
    // let url;
    //
    // try {
    //   this.userService.getGoogleLoginRedirectUrlGetterUrl()
    // } catch (e) {
    //   return this.processError(e);
    // }
  }

  private processError(error: any): AuthActionError {
    const errMessage = error?.message || error || '';

    if (errMessage === 'User not found') {
      return {
        type: AuthActionErrorType.unknownUser,
        message: errMessage,
      }
    }

    return {
      type: AuthActionErrorType.general,
      message: errMessage,
    };
  }
}


let authFormHandlerInstance: any;


export function useAuthFormHandlerService(): AuthFormHandlerService {
  if (authFormHandlerInstance) {
    return authFormHandlerInstance;
  }

  const userService = useUserService();

  authFormHandlerInstance = new AuthFormHandlerService(userService);

  return authFormHandlerInstance;
}
