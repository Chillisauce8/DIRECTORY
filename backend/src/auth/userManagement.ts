import { convertPhoneIfNeed, DateHelper } from 'x-utils';
import * as _Promise from 'bluebird';
import { EmailHelper } from '../utils';
import { freeEmailCheckHelper } from './freeEmailCheckHelper';
import type { IDataCrud } from '../db/data-crud.interface';
import { ERROR_REASON } from '../const';
import { UserHelper } from './userHelper';
import { STANDARD_COLLECTIONS_DESCRIPTION } from '../collectionNames';
import type {
  UserContentData,
  UserRegistrationData,
  UserNode, UserGeneralData, UserRole
} from './user-data.interfaces';

import * as _ from 'lodash';
import {ObjectId} from 'mongodb';


export type UserFieldsToUpdate = {
    type?: string;
    password?: string;
    phoneVerified?: boolean;
    phone?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    gdprDelete?: boolean;
    companyId?: string;
    subscribe: 'Yes' | 'No';
}


interface GetUserRequest {
    collectionName: string;
    query: any;
    fields?: any;
}


export interface VerifyEmailResult {
    safety: boolean;
    overridden?: boolean;
    error?: any;
}


export interface GetUserOptions {
    fields?: any;

    needSecureData?: boolean;
}


export class UserManagement {

    emailValidateMessage = 'Email is invalidated by Full Contact API';

    constructor(private dateHelper: DateHelper,
                private userHelper: UserHelper,
                private dataCrudService: IDataCrud,
                private emailHelper: EmailHelper
                ) {
    }

    protected ignoreValidationEmailList = [
        '@test.com',
        '@deleted.com',
    ];

    async verifyUserEmail(req: Request, userData: UserRegistrationData): Promise<VerifyEmailResult> {
        if (userData.emailVerified) {
            return {safety: true};
        }

        if (userData && userData.emailValidation && userData.emailValidation.isEmailValid === true) {
            return {safety: true};
        }

        if (userData && userData.emailValidation && userData.emailValidation.isValidationOverridden === true) {
            return {safety: false, overridden: true};
        }

        if (this.needToIgnoreEmail(userData.email, this.ignoreValidationEmailList)) {
            return {safety: true};
        }

        let result;

        // try {
        //     result = await zeroBounceEmailVerifier.validate(req, userData);
        // } catch (e) {
        //     return {safety: false, error: e};
        // }

        return {safety: true};
    }

    async verifyEmailIfNeed(req: Request, userData: UserRegistrationData, previousEmail?: string) {
        if (previousEmail && previousEmail === userData.email) {
            return {safety: true};
        }

        if (userData.emailVerified || (userData as any).verifiedEmail) {
            return {safety: true};
        }

        return this.verifyUserEmail(req, userData);
    }

    async getUserDataByEmail(req: Request, email, options?: GetUserOptions) {
        const query: any = {'email': email};
        return this._queryUserData(req, query, options);
    }

    async getUserDataById(req: Request, id, options?: GetUserOptions) {
        const query = {'_id': new ObjectId(id)};
        return this._queryUserData(req, query, options);
    }

    async createUser(req: Request, userRegistrationData: UserRegistrationData,
                     content: UserContentData = {}) {
        const generalUserData = this.prepareGeneralUserDataFromRegistrationData(userRegistrationData);

        const preparedUserData: {
          lastName: string;
          images?: any[];
          roles?: UserRole[];
          description?: string;
          videos?: any[];
          type?: string;
          isActive?: boolean;
          hasEverLoggedIn?: boolean;
          firstName: string;
          emailVerified?: boolean;
          createdAt?: string;
          phoneValidated?: "Yes" | "No";
          phone?: string;
          name: string;
          email: string
        } = {
            ...generalUserData,
            ...content
        };

        this.extendUserWithCreatedByData(req, preparedUserData as UserNode);

        const userNode = await this.createUserNode(req, preparedUserData as UserNode);

        if (!userNode) {
            throw Error(`User creation error for ${generalUserData.email}`);
        }

        return userNode;
    }

    async updateUserData(req: Request, userNode: UserNode) {
        userNode.title =  userNode.name;
        return this.dataCrudService.updateNode(req, userNode.type, userNode);
    }

    async updateUserFields(req: Request, userId: string, userFields: UserFieldsToUpdate,
                           options?: GetUserOptions) {
        const {userData, customUserData} = await this.getUserDataById(req, userId, options);

        const {firstName, lastName, email, phone, phoneVerified, subscribe} = userFields;

        let userNodeToUpdate = customUserData || userData;

        const newUserGeneralData: any = {...userNodeToUpdate.general, firstName, lastName, email, phone,
            phoneVerified, subscribe};
        this.userHelper.correctUserNameFields(newUserGeneralData);

        if (userData.password) {
            delete userData.password;
        }

        if (newUserGeneralData.hasOwnProperty('phoneVerified')) {
            newUserGeneralData.phoneValidated = newUserGeneralData.phoneVerified ? 'Yes' : 'No';
            delete newUserGeneralData.phoneVerified;
        }

        const result = await this.emailHelper.checkEmailIsUnique(req, newUserGeneralData.email, userId);

        if (!result) {
            return _Promise.reject('Email is not unique');
        }

        const emailValidation = await this.validateUserEmail(req, userNodeToUpdate, newUserGeneralData);

        if (emailValidation && emailValidation.safety === false && emailValidation.overridden !== true) {
            return _Promise.reject(this.emailValidateMessage);
        }

        if (this.userHelper.isUserCustomer(newUserGeneralData)) {
            newUserGeneralData.emailValidated = emailValidation && emailValidation.safety ? 'Yes' : 'No';
        }

        newUserGeneralData.freeEmail = freeEmailCheckHelper.checkEmailAddress(newUserGeneralData.email);
        newUserGeneralData.phone = convertPhoneIfNeed(newUserGeneralData.phone);
        newUserGeneralData.name = [newUserGeneralData.firstName, newUserGeneralData.lastName].join(' ');

        if (newUserGeneralData.gdprDelete) {
            newUserGeneralData.phone = '';

            if (newUserGeneralData.phoneValidated === 'Yes') {
                newUserGeneralData.phoneValidated = 'No';
            }

            newUserGeneralData.gdprDelete = true;
        }

        const preparedUserData = this.prepareGeneralUserDataFromRegistrationData(newUserGeneralData);
        userNodeToUpdate = {...userNodeToUpdate, ...preparedUserData};

        const savedNode = await this.updateUserData(req, userNodeToUpdate);

        // if (userData.gdprDelete || userData.hasOwnProperty('companyId')) {
        //     return userNode;
        // }

        // TODO: retrofit!
        // await this.enrichCompanyDataIfNeeded(req, {
        //     ...user,
        //     emailValidated: userData.emailValidated,
        //     freeEmail: userData.freeEmail
        // }, emailIsUpdated);

        return savedNode;
    }

    async updateOwnUser(req: Request, userData: UserFieldsToUpdate) {
        const user = _.cloneDeep(req['userDetails']);

        const savedNode = await this.updateUserFields(req, user.id, userData);

        delete savedNode.security;

        return {...savedNode['general'], id: savedNode._id, type: user.type};
    }

    async isUserExist(req: Request, email) {
        const {userData} = await this.getUserDataByEmail(req, email, {fields: {_id: 1}});
        return !!userData;
    }

    async saveUserFirstLoggedIn(req: Request, userData) {
        const userNodeData = userData;

        userNodeData.general.hasEverLoggedIn = true;
        userNodeData.general.logins = 1;

        await this.dataCrudService.updateNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.users.name, userNodeData);
    }

    async increaseLoginCount(req: Request, userData: UserNode) {
        if (!userData) {
            return _Promise.reject({reason: ERROR_REASON.invalidData,
                message: 'User not found'});
        }

        if (!userData.logins) {
            userData.logins = 1;
        } else {
            userData.logins++;
        }

        return this.dataCrudService.mergeNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.users.name, userData);
    }

    async storeGmailAuthToken(req: Request, userId: string, gmailAuthData) {
        let {userData, customUserData} = await this.getUserDataById(req, userId);

        if (!userData) {
            return _Promise.reject({reason: ERROR_REASON.invalidData, message: 'User not found'});
        }

        const dataToMerge = {_id: userData._id, gmailAuthData};

        return this.dataCrudService.mergeNode(req, userData._type, dataToMerge);
    }

    async getGmailAuthToken(req: Request, userId) {
        const userData = await this.getUserDataById(req, userId);
        return userData.gmailAuthData;
    }

    needToIgnoreEmail(email: string, ignoreList: string[]): boolean {
        for (let ignoreEmail of ignoreList) {
            if (ignoreEmail.length < email.length &&
                email.lastIndexOf(ignoreEmail) === email.length - ignoreEmail.length) {
                return true;
            }
        }

        return false;
    }

    private async _queryUserData(req: Request, query, options?: GetUserOptions) {
        if (options?.fields) {
            query._fields = options.fields;
        }

        const userData = await this.dataCrudService.querySingleNode(req,
          STANDARD_COLLECTIONS_DESCRIPTION.users.name, {query},
          {updateCache: false, readFromCache: false});

        return userData;
    }

    private prepareGeneralUserDataFromRegistrationData(userData: UserRegistrationData): UserGeneralData {
        return {
            type: userData.type,
            roles: userData.roles,
            email: userData.email,
            emailVerified: userData.emailValidated === 'Yes',
            name: [userData.firstName, userData.lastName].join(' '),
            firstName: (userData.firstName ?? '').trim(),
            lastName: (userData.lastName ?? '').trim(),
            createdAt: this.dateHelper.saveDateTimeFormat(new Date()),
            isActive: _.isUndefined(userData.isActive) ? true : !!userData.isActive,
            phone: userData?.phone ? convertPhoneIfNeed(userData.phone) : '',
            phoneValidated: userData?.phoneVerified ? 'Yes' : 'No',
        }
    }

    private async createUserNode(req: Request, userData: UserNode): Promise<UserNode|null> {
        const userNode = await this.dataCrudService.createNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.users.name, userData);

        if (!userNode) {
            return null;
        }

        return userNode;
    }

    private extendUserWithCreatedByData(req: Request, userData: UserNode): void {
        const currentUser = req['userDetails'];

        if (currentUser) {
            userData.createdBy = {
                userType: currentUser.type,
                name: currentUser.name,
                id: currentUser.id
            };
        }
    }

    private async validateUserEmail(req: Request, currentUserData, newUserData) {
        if (!this.userHelper.isUserCustomer(currentUserData)) {
            return {safety: true};
        }

        const currentEmail = currentUserData ? currentUserData.email : null;

        return await this.verifyEmailIfNeed(req, newUserData, currentEmail);
    }
}

