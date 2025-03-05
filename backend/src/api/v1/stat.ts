import { wrapDefaultDataResponse } from '../../utils';
import { isMediaLinked } from '../../utils';


let handleIsMediaLinked = function (req: Request, res, next) {
    let id = req['params'].id;
    wrapDefaultDataResponse(res, isMediaLinked(req, id));
};

module.exports = function (app, callback) {
    app.get('/api/stat/media/:id/isLinked', handleIsMediaLinked);

    callback();
};
