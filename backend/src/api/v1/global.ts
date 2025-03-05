import moment from 'moment';

import { coreServiceLocator } from '../../serviceLocator';


const toobusy = require('toobusy-js');

const privateSettings = coreServiceLocator.get('privateSettings');
const userManagement = coreServiceLocator.get('userManagement');
const authHelper = coreServiceLocator.get('authHelper');
const userHelper = coreServiceLocator.get('userHelper');



module.exports = function(app, callback) {

    app.use(tooBusy);
    app.use(logRequestStart);

    function logRequestStart(req: Request, res, next) {
        console.info(`${moment().utc().toDate().toISOString()} ${req.method} ${req['originalUrl']}`);
        next();
    }

    function tooBusy(req: Request, res, next) {
        toobusy.maxLag(3000); // 2000 ms lag in eventProcessing queue, quite extremely high but usable for SSR
        toobusy.interval(500);

        if (toobusy()) {
            res.status(503).send("The web application is too busy to serve this request. Please try again.");
        } else {
            next();
        }
    }

    app.use('*', function (req: Request, res, next) {
        // let origin = privateSettings.ACCESS_CONTROL_ALLOW_ORIGIN;
        //
        // if (!origin) {
        //     origin = req['headers']["origin"];
        // }
        //
        // if (!origin) {
        //     origin = "*";
        // }

        let origin;

        const requestOrigin = req['headers']['origin'];
        if (privateSettings.CORS_ALLOWED_URLS && privateSettings.CORS_ALLOWED_URLS.includes(requestOrigin)) {
            origin = requestOrigin;
        } else if (requestOrigin && requestOrigin.includes(privateSettings.APPS_BASE_SETTINGS.SITE_DOMAIN)) {
            origin = requestOrigin;
        } else {
            origin = "*";
        }

        res.append("Access-Control-Allow-Origin", origin);
        res.append("Access-Control-Allow-Headers", "X-CSRF-TOKEN, Content-Type, X-Forwarded-Host, X-COMPRESS, X-APP-ID, X-APP-ENVIRONMENT");
        res.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.append("Access-Control-Allow-Credentials", "true");
        next();
    });


    async function loadCurrentUserData(req: Request, res) {
        const cookieValue = req['cookies'].authdata;

        if (cookieValue) {
            const userId = await authHelper.getUserIdByToken(req, cookieValue);

            if (userId) {
                const {userData, customUserData} = await userManagement.getUserDataById(req, userId);

                req['userDetails'] = await userHelper.prepareInternalUserData(req, userData, customUserData);
            } else {
                // await tryToRestoreSession(req, res);
            }
        }
    }


    app.all('*', async function (req: Request, res, next) {
        if (req.url.includes('healthcheck')) {
            return next();
        }

        await loadCurrentUserData(req, res);

        if (req['query'] && req['query'].currentCustomerId) {
            req['currentCustomerId'] = req['query'].currentCustomerId;
        }

        return next();
    });

    //UNCOMMENT NEXT LINE TO GET CSRF PROTECTION WORKING
    // app.use(getCsrfProtectionFunction);

    callback();
};
