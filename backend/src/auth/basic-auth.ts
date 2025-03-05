const basicAuth = require('basic-auth');
import {coreServiceLocator} from "../serviceLocator";


export function checkBasicAuthSync(req: Request) {
    const user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        return false;
    }

    const privateSettings = coreServiceLocator.get('privateSettings');

    return user.name === privateSettings.SCHEDULER.username &&
        user.pass === privateSettings.SCHEDULER.password;
}


export function basicAuthForScheduledTasks(req: Request, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }

    if (checkBasicAuthSync(req)) {
        return next();
    } else {
        return unauthorized(res);
    }
}
