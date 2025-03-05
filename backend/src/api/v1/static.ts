import { coreServiceLocator } from '../../serviceLocator';
const express = require('express');


const privateSettings = coreServiceLocator.get('privateSettings');


module.exports = function(app, callback) {

    if (privateSettings.ENVIRONMENT === 'production') {
        const compression = require('compression');
        app.use(compression({level: 9}));
    }

    app.use(express.static('public'));
    callback();
};
