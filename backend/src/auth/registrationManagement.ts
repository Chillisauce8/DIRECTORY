import { freeEmailCheckHelper } from './freeEmailCheckHelper';
import { ERROR_REASON } from '../const';
import { UserHelper } from './userHelper';
import { LoginManagement } from './loginManagement';
import { UserManagement } from './userManagement';
import type { VerifyEmailResult } from './userManagement';
import {
  type UserRegistrationData,
  type RegistrationError,
  type UserContentData,
  type UserRegistrationSettings, UserRegistrationProvider
} from './user-data.interfaces';
import { PasswordHelper } from './passwordHelper';
import { EmailHelper } from '../utils';
import { AuthHelper } from './auth-helper';
import { DefinitionCrud } from '../db';
import { STANDARD_COLLECTIONS_DESCRIPTION } from '../collectionNames';


export class RegistrationManagement {

    constructor(
        private userHelper: UserHelper,
        private userManagement: UserManagement,
        private loginManagement: LoginManagement,
        private passwordHelper: PasswordHelper,
        private emailHelper: EmailHelper,
        private authHelper: AuthHelper,
        private definitionCrud: DefinitionCrud,
    ) {
        //
    }

    validateUserRegistrationData(data: UserRegistrationData, registrationSettings: UserRegistrationSettings): {field: string, error: string}[] {
        const errors: any = [];

        if (!data.email) {
            errors.push({
                "field": "email",
                "error": "Field 'email' is missing"
            });
        }

        if (data.email) {
            let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(data.email)) {
                errors.push({
                    "field": "email",
                    "error": "The provided email is not valid"
                });
            }
        }

        if (!data.lastName && !data.firstName) {
            errors.push({
                "field": "name",
                "error": "name is missing"
            });
        }

        // don't validate password because it isn't necessary
        if (data.provider && data.provider !== UserRegistrationProvider.local) {
            return errors;
        }

        if (!registrationSettings.generatePassword && !data.password) {
            errors.push({
                "field": "password",
                "error": "Field 'password' is missing"
            });
        }

        // if (data.password && !data.passwordVerify) {
        //     errors.push({
        //         "field": "passwordVerify",
        //         "error": "Field 'passwordVerify' is missing"
        //     });
        // }

        return errors;
    }

    async isSignUpPossible(req: Request, userData: UserRegistrationData,
                           registrationSettings: UserRegistrationSettings): Promise<{allowed: boolean, error?: RegistrationError}> {
        const isEmailUnique = await this.emailHelper.checkEmailIsUnique(req, userData.email);

        if (!isEmailUnique) {
            return {
                allowed: false,
                error: {
                    reason: ERROR_REASON.registrationError,
                    message: 'Email is not unique'
                },
            };
        }

        if (registrationSettings.selfRegistration) {
            let definitionSettings;


            const userDefinition = await this.definitionCrud.getDefinitionByType(req,
                STANDARD_COLLECTIONS_DESCRIPTION.users.name);

            if (!userDefinition) {
                return {
                    allowed: false,
                    error: {
                        reason: ERROR_REASON.registrationError,
                        message: `Not possible to create app user. Users collection not found`
                    }
                };
            }

            definitionSettings = userDefinition.customSettings;


            if (definitionSettings.selfRegistrationAllowed === false) {
                return {
                    allowed: false,
                    error: {
                        reason: ERROR_REASON.registrationError,
                        message: `Self registration is not allowed for user`
                    }
                };
            }
        }

        return {allowed: true};
    }

    async verifyUserEmail(req: Request, userData: UserRegistrationData): Promise<VerifyEmailResult> {
        return this.userManagement.verifyUserEmail(req, userData);
    }

    async checkIsFreeEmailAddress(req: Request, userData: UserRegistrationData): Promise<boolean> {
        return freeEmailCheckHelper.checkEmailAddress(userData.email);
    }

    async checkUserAlreadyExists(req: Request, userData: UserRegistrationData): Promise<boolean> {
        return this.userManagement.isUserExist(req, userData.email);
    }

    prepareUserPassword(userData: UserRegistrationData, registrationSettings: UserRegistrationSettings,
                        generatedPasswordLength: number = 10): string|undefined {
        if (registrationSettings.generatePassword) {
            return this.passwordHelper.generatePassword(generatedPasswordLength);
        }

        if (registrationSettings.enforcePassword) {
            return this.passwordHelper.enforcePassword(userData.password);
        }

        return userData.password;
    }

    private async createUserSecurityNode(req: Request,
                                         userId: string,
                                         preparedRegistrationUserData: UserRegistrationData,
                                         registrationSettings: UserRegistrationSettings): Promise<void> {
        const userSecurityParams = {
            userId,
            provider: preparedRegistrationUserData.provider as any,
            providerId: preparedRegistrationUserData.providerId,
            password: this.prepareUserPassword(preparedRegistrationUserData, registrationSettings),
            accessToken: preparedRegistrationUserData.accessToken,
            refreshToken: preparedRegistrationUserData.refreshToken
        };

        await this.authHelper.createUserSecurityItem(req, userSecurityParams);
    }

    async registerUser(req: Request, res, userData: UserRegistrationData,
                          content: UserContentData = {},
                          registrationSettings: UserRegistrationSettings) {
        // if (userData) {
        //     console.log(`Registering - ${[userData.firstName, userData.lastName].join(' ')} ${userData.email}`);
        // }

        // start: validate userData
        const validationErrors = this.validateUserRegistrationData(userData, registrationSettings);

        if (validationErrors.length > 0) {
            throw {
                reason: ERROR_REASON.genericAuthError,
                errors: validationErrors
            };
        }
        // end: validate userData

        // start: isRegistrationAllowed
        const {allowed: isSignUpAllowed, error: isSignUpAllowedError} =
            await this.isSignUpPossible(req, userData, registrationSettings);

        if (!isSignUpAllowed && isSignUpAllowedError) {
            throw isSignUpAllowedError;
        }
        // end: isRegistrationAllowed

        const preregistrationPromises: any[] = [];
        preregistrationPromises.push(this.userManagement.verifyEmailIfNeed(req, userData));
        preregistrationPromises.push(this.userManagement.isUserExist(req, userData.email));

        const results = await Promise.all(preregistrationPromises);

        const verifyResult: any = results[0];
        const isExists = results[1];

        if (isExists) {
            throw {
                reason: ERROR_REASON.invalidData,
                message: 'A user already exists for this email.'
            };
        }

        // start: verify user email
        if (verifyResult && verifyResult.safety === false && verifyResult.overridden !== true) {
            throw {
                reason: ERROR_REASON.invalidData,
                message: this.userManagement.emailValidateMessage
            };
        }

        userData.emailValidated = verifyResult && verifyResult.safety ? 'Yes' : 'No';

        userData.freeEmail = freeEmailCheckHelper.checkEmailAddress(userData.email);
        // end:  verify user email

        delete userData.emailValidation;
        delete userData.emailVerified;

        // moved into prepare data method in userManagement.ts
        // this.userHelper.correctUserNameFields(userData);

        const userNode = await this.userManagement.createUser(req, userData, content);

        await this.createUserSecurityNode(req, userNode._id as string, userData, registrationSettings);

        if (registrationSettings.loginUser && res) {
            await this.loginManagement.setUserLoggedIn(req, res, userNode);
        }

        return userNode;
    }
}
