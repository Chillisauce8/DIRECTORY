const cryptoModule = require('crypto');
import * as _ from 'lodash';


export function getRandomId(length?: number) {
    if (_.isUndefined(length)) {
        length = 20;
    }

    return cryptoModule.randomBytes(length).toString('hex');
}


export function deepDiffMapper() {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',

        map: function(obj1, obj2) {

            if (this.isValue(obj1) || this.isValue(obj2)) {
                let type = this.compareValues(obj1, obj2);

                let result: any = {
                    type: type,
                    data: (obj1 === undefined) ? obj2 : obj1
                };


                if (type === this.VALUE_UPDATED) {
                    result.newData = obj2;
                }

                return result;
            }

            let diff = {};

            _.forIn(obj1, (value, key) => {
                let value2 = undefined;
                if ('undefined' != typeof(obj2[key])) {
                    value2 = obj2[key];
                }

                diff[key] = this.map(value, value2);
            });

            _.forIn(obj2, (value, key) => {
                if (key in diff) {
                    return;
                }

                diff[key] = this.map(undefined, value);
            });

            let resultForObject = _.pickBy(diff, (value: any, key) => {
                return value && Object.keys(value).length && value.type !== this.VALUE_UNCHANGED;
            });

            if (Object.keys(resultForObject).length && _.isArray(obj1)) {
                return Object.keys(resultForObject).map(numberKey => {
                    return {
                        index: parseInt(numberKey),
                        data: resultForObject[numberKey]
                    };
                });
            } else {
                return resultForObject;
            }

        },
        isValue: function(obj) {
            return !_.isObject(obj) && !_.isArray(obj);
        },
        compareValues: function(value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (_.isDate(value1) && _.isDate(value2) && value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if ('undefined' == typeof(value1)) {
                return this.VALUE_CREATED;
            }
            if ('undefined' == typeof(value2)) {
                return this.VALUE_DELETED;
            }

            return this.VALUE_UPDATED;
        }
    }
}
