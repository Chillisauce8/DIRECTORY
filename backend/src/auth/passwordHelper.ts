import { type IDataCrud, type IQueryParams } from '../db';
import { STANDARD_COLLECTIONS_DESCRIPTION } from '../collectionNames';

import * as _ from 'lodash';
const cryptoModule = require('crypto');
const bcrypt = require('bcryptjs');
const base64url = require('base64url');
const nanoidGenerate = require('nanoid/generate');


export class PasswordHelper {

    constructor(
        private dataCrudService: IDataCrud) {
    }

    generatePassword(length) {
        const random_number = Math.floor(Math.random() * 10);
        return this.generateRandomShortToken(length - 1) + random_number;
    }

    generateRandomToken() {
        return cryptoModule.randomBytes(20).toString('hex');
    }

    generateRandomShortToken(length: number) {
        const bytes = cryptoModule.randomBytes(length);
        const token = base64url(bytes).slice(0, length - 1);
        return token.replace(/_$/, '0');
    }

    generateCharString(length: number): string {
        const alphabet = '1234567890abcdefghijklmnopqrstuvwxyz';
        return nanoidGenerate(alphabet, length);
    }

    enforcePassword(password) {
        if (password.length < 8) {
            password = password + this.hashCode(password);
        }

        if (!password.match(/\d/i)) {
            password = password + password.length;
        }

        if (!password.match(/[a-z]/i)) {
            password = password + 'w';
        }

        //We should never expose user password!

        return password;
    }

    async checkPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    getPasswordHash(password) {
        return bcrypt.hashSync(password, 8); //move salt length to the config
    }

    findBestPasswordSettings(settings: Array<any>) {
        if (!settings.length) {
            return null;
        }

        let strengthArray = [
            'high',
            'medium',
            'low'
        ];

        let bestSettings: Array<any>;

        for (let strength of strengthArray) {
            bestSettings = settings.filter(item => item && item.strength === strength);

            if (bestSettings.length) {
                return bestSettings[0];
            }
        }

        bestSettings = settings.filter(item => item && item.visibility);

        if (bestSettings.length) {
            return bestSettings[0];
        }

        return null;
    }

    private hashCode(s) {
        return s.split('').reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
    }

    async handleGetPasswordStrengthByToken(req, token) {
        const defaultData = {
            strength: 'default',
        };

        // TODO: if no password setings in roles use from custom user definition then from common definition
        const roles = await this.queryUserRolesByResetPasswordToken(req, token);

        if (!roles) {
            return defaultData;
        }

        const passwordSettings = roles.map(role => _.get(role, 'security.password')).filter(item => {
            return !!item && !!item.strength;
        });

        if (!passwordSettings.length) {
            return defaultData;
        }

        return this.findBestPasswordSettings(passwordSettings);
    }

    private async queryUserRolesByResetPasswordToken(req: Request, token) {
        if (!token) {
            return Promise.resolve();
        }

        const query: IQueryParams = {
            query: {
                'security.resetPasswordToken': token,
                '_fields': {'general.type': 1, '_doc': 1}
            }
        };

        const userData = await this.dataCrudService.querySingleNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.users.name, query);

        if (!userData) {
            return null;
        }

        const roleNames = userData.roles.map(role => role['name']);

        return await this.dataCrudService.queryNodes(
            req,
            STANDARD_COLLECTIONS_DESCRIPTION.roles.name,
            {query: {'general.name': {'$in': roleNames}}});
    }
}
