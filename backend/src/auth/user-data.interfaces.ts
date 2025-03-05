
export enum UserRegistrationProvider {
    local = 'local',
    google = 'google',
}


export interface UserRole {

}


export interface CreateUserSecurityParams {
    userId: string;
    provider: UserRegistrationProvider;
    providerId?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string
}


export interface UserSecurityData extends CreateUserSecurityParams {
    [key: string]: any;
    token?: string;

    resetPasswordToken?: string;

    passwordResetCount?: number;
    failedLoginCount?: number;
    lastFailedLoginTime?: any;
}


export interface UserBaseGeneralData {
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    phone?: string;
    emailVerified?: boolean;
}


export interface UserBaseRegistrationProviderData {
    provider: UserRegistrationProvider;
    providerId?: string;
}


export interface UserBasePermissionsData {
    type?: string;
    roles?: UserRole[];
}


export interface UserInternalGeneralData {
    isActive?: boolean;
    hasEverLoggedIn?: boolean;
    createdAt?: string;
    phoneValidated?: 'Yes' | 'No';
}


export interface UserSecurityData {
    provider: UserRegistrationProvider,
    provideId?: string;
    resetPasswordToken?: string;
    password?: string; // hashed password
    passwordResetCount?: number;
}



export interface UserGeneralData extends UserBaseGeneralData,
  UserBasePermissionsData, UserInternalGeneralData {
}


export interface UserContentData {
    description?: string;
    images?: any[];
    videos?: any[];
}


export interface UserNode extends UserGeneralData, UserContentData {
    type: string;
    title?: string;
    _id?: string;
    createdBy?: Object;
    gmailAuthData?: Object;
    logins?: number;
}


interface BaseUserRegistrationData {
    phoneVerified?: boolean;
    accessToken?: any;
    refreshToken?: any;
    freeEmail?: boolean;
    emailValidated?: 'Yes' | 'No';
    emailValidation?: {
        isEmailValid: boolean;
        isValidationOverridden: boolean;
        wasErrorDuringValidation: boolean;
    };
    isActive?: boolean;
    password?: string;
    // passwordVerify?: string;
}



export interface UserRegistrationData extends BaseUserRegistrationData,
    UserBaseGeneralData,
    UserBaseRegistrationProviderData,
    UserBasePermissionsData {
}


export interface RegistrationError {
    reason: number;
    message: string;
}


export interface UserRegistrationSettings {
    generatePassword?: boolean;
    enforcePassword?: boolean;
    loginUser?: boolean;
    selfRegistration?: boolean;
}
