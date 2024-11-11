import {SwpUserType} from '~/service/user-common/user.service';

export enum AuthActionType {
  signIn = 'signIn',
  signUp = 'signUp',
}


export enum AuthProvider {
  local = 'local',
  google = 'google',
}


export enum AuthFormType {
  organiser = 'organiser',
  guest = 'guest',
  enquiry = 'enquiry',
  product = 'product'
}


export interface IAuthFormDescriptionConfig {
  authFormType: AuthFormType;
}

export interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
  verifyPassword: string;
}


export interface SignInData {
  email: string;
  password?: string;
}


export interface AuthActionParams<Data extends unknown> {
  type: AuthActionType;
  provider: AuthProvider;
  data?: Data;
  userType?: SwpUserType;
}


export interface AuthActionSuccess<User extends unknown = any> {
  user: User;
}


export enum AuthActionErrorType {
  unknownUser = 'unknownUser',
  existingUser = 'existingUser',
  general = 'general',
}


export interface AuthActionError {
  type: AuthActionErrorType;
  message?: string;
}


export type AuthActionResult<User extends unknown = any>  = AuthActionSuccess<User> | AuthActionError;


export interface SignInFormValue {
  provider: AuthProvider;
  email: string;
  password?: string;
  // attending?: 'Yes'|'No'
}


export interface SignUpFormValue {
  email: string;
  provider: AuthProvider;
  name?: string;
  phone?: string;
  generatePassword?: boolean;
  password?: string;
  // attending?: 'Yes'|'No';
}
