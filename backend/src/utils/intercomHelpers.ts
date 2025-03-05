import {getDateAsUTCUnixTimestamp} from "x-utils";
import {coreServiceLocator} from "../serviceLocator";
var Intercom = require('intercom-client');


const privateSettings = coreServiceLocator.get('privateSettings');


module.exports = function() {
    var r : any = {};

    var getIntercomClient = function() {
        var config;
        if (privateSettings.INTERCOM.connectionParams.oAuthToken){
            config = {token: privateSettings.INTERCOM.connectionParams.oAuthToken};
        }
        else{
            config = privateSettings.INTERCOM.connectionParams;
        }

        return new Intercom.Client(config).usePromises();
    };

    r.createEvent = function(userEmail, name) {
        return getIntercomClient().events.create({
            event_name: name,
            created_at: getDateAsUTCUnixTimestamp(),
            email: userEmail
        })
    };

    r.verifyIntercomRegistrationData = function(data) {
        // validation
        var errors = [];

        // check email provided
        if (!data.email)
        {
            errors.push({
                "field": "email",
                "error": "Field 'email' is missing"
            });
        }

        // check for email validity
        if (data.email)
        {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(data.email)) {
                errors.push({
                    "field": "email",
                    "error": "The provided email is not valid"
                });
            }
        }

        return errors;
    };

    r.getIntercomUser = function(email, fullName) {
        return getIntercomClient().users.find({ email: email, name: fullName });
    };


    r.createIntercomUser = function(email, fullName, phone) {
        return getIntercomClient().users.create({
            email: email,
            name: fullName,
            created_at: getDateAsUTCUnixTimestamp(),
            phone : phone
        });
    };


    r.getOrCreateIntercomUser = function(email, fullName, phone) {
        return r.getIntercomUser(email, fullName).then(function(data) {
            var user = data.body;
            return user;
        }).catch(function() {
            return r.createIntercomUser(email, fullName, phone);
        });
    };

    r.updateIntercomUser = function(currentEmail, newData) {
        return r.getIntercomUser(currentEmail)
            .then(function(data) {
                var user = data.body;

                var newUserParams = {
                    id: user.id,
                    created_at: getDateAsUTCUnixTimestamp()
                };

                if ('email' in newData) {
                    newUserParams['email'] = newData['email'];
                }

                if ('name' in newData) {
                    newUserParams['name'] = newData['name'];
                }

                if ('phone' in newData) {
                    newUserParams['phone'] = newData['phone'];
                }

                if ('companies' in newData) {
                    newUserParams['companies'] = newData['companies'];
                }

                return getIntercomClient().users.create(newUserParams);
            });
    };

    r.addCompanyToUser = function(currentEmail, companyId, companyName) {
        return r.getIntercomUser(currentEmail).then(function(data) {
            var user = data.body;
            var newUserParams = {
                id: user.id,
                created_at: getDateAsUTCUnixTimestamp(),
                companies: user.companies.companies
            };

            newUserParams.companies.push({
                "company_id" : companyId,
                "name" : companyName
            });

            return getIntercomClient().users.create(newUserParams);
        });
    };

    r.sendSupportEmail = function(userEmail, subject, body) {
        var message = {
            message_type: "email",
            subject: subject,
            body: body,
            template: "personal",
            to: {
                type: "user",
                email: userEmail
            },
            "from": {
                "type": "admin",
                "id": privateSettings.INTERCOM.supportAdminId
            }
        };

        return getIntercomClient().messages.create(message);
    };

    return r;

}();
