

module.exports = function(app, callback) {
    app.use(logErrors);
    app.use(clientErrorHandler);
    // app.use(errorHandler);


    function logErrors(err, req, res, next) {
        console.error(err.stack);
        next(err);
    }

    function clientErrorHandler(err, req, res, next) {
        if (req.xhr) {
            res.status(500).send({ok: false, error: 'Something failed!'});
        } else {
            next(err);
        }
    }

    function errorHandler(err, req, res) {
        res.status(500);
    }

    callback();
}
