import {getDateAsUTCUnixTimestamp, stringCamelToSnakeCase} from "x-utils";

import * as _ from 'lodash';
import * as Promise from 'bluebird';
import {coreServiceLocator} from "../serviceLocator";

const Analytics = require('analytics-node');

const privateSettings = coreServiceLocator.get('privateSettings');

const segmentClient = new Analytics(privateSettings.SEGMENT.writeKey, {flushAt: 1});


let _callSegmentBasicFunction = function (segmentFunc, message) {
    return new Promise((resolve, reject) => {
        segmentFunc.call(segmentClient, message, (e, response) => {

            if (!response){
                reject({message:"Segment returns empty result"});
            }
            else {
                resolve(response);
            }

        });

    });
};


export class SegmentHelper {

    identifyUserLogin(data: any) {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject({message: "No data"});
            }

            const userObj = data.user;

            const userTimestamp = getDateAsUTCUnixTimestamp(userObj.createdOn);

            const segmentMessage = {
                userId: userObj.id,
                traits: {
                    name: userObj.firstName + ' ' + userObj.lastName,
                    email: userObj.email,
                    createdAt: userTimestamp,
                    signedUpAt: userTimestamp
                }
            };

            segmentClient.identify(segmentMessage, (e, response) => {

                if (!response) {
                    reject({message: "Segment returns empty result"});
                } else {
                    resolve(response);
                }
            });
        });
    }

    identifyUserEventInfo(data: any) {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject({message: "No data"});
            }

            let userObj = data.user;

            let basicTraits = {
                name: userObj.firstName + ' ' + userObj.lastName,
                email: userObj.email
            };

            let transformedData = _.mapKeys(data.traits, (value, key) => stringCamelToSnakeCase(key));

            let segmentMessage = {
                userId: userObj._doc,
                traits: _.merge({}, basicTraits, transformedData),
                context: {
                    active: false
                }
            };

            _callSegmentBasicFunction(segmentClient.identify, segmentMessage)
                .then((msg) => resolve(msg))
                .catch((msg) => reject({message: msg}));
        });
    }

    groupUserEventInfo(data: any) {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject({message: "No data"});
            }

            let userObj = data.user;

            let transformedData = _.mapKeys(data.traits, (value, key) => stringCamelToSnakeCase(key));

            let segmentMessage = {
                userId: userObj._doc,
                groupId: data.groupId,
                traits: transformedData
            };

            _callSegmentBasicFunction(segmentClient.group, segmentMessage)
                .then((msg) => resolve(msg))
                .catch((msg) => reject({message: msg}));

        });
    }

    trackArbitraryData(data: any, integrations: any) {
        return this._sendArbitraryData(segmentClient.track, data, integrations);
    }

    identifyArbitraryData(data: any, integrations: any, context: any) {
        return this._sendArbitraryData(segmentClient.identify, data, integrations, context);
    }

    trackEvent(event, userId) {
        return new Promise((resolve, reject) => {
            const message = {event, userId};
            segmentClient.track(message, (e, response) => {
                if (!response) {
                    reject({message: "Segment returns empty result"});
                } else {
                    resolve(response);
                }
            });
        });
    }

    private _sendArbitraryData(segmentFunc, data: any, integrations?: any, context?: any) {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject({message: "No data"});
            }

            if (integrations && !_.isEmpty(integrations)) {
                let integrationsObj = {};
                integrationsObj['All'] = false;

                if (_.isArray(integrations)) {
                    integrations.forEach((integrationItem) => integrationsObj[integrationItem] = true);
                } else {
                    integrationsObj = _.assign({}, integrations, integrationsObj);
                }

                data.integrations = integrationsObj;
            }

            if (context && !_.isEmpty(context)) {
                data.context = context;
            }

            _callSegmentBasicFunction(segmentFunc, data)
                .then((msg) => resolve(msg))
                .catch((msg) => reject({message: msg}));

        });
    }
}


export const segmentHelper = new SegmentHelper();
