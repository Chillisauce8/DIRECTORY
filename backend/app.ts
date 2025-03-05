import 'reflect-metadata';
import {join} from 'path';
import { coreServiceLocator } from './src/serviceLocator';
import { connectProjectsDatabase } from './src/db/mongo/data-bases-connector';
import {
  DEFAULT_UNKNOWN_PAGE_URL,
  DIST_FOLDER, handleGetRequestForStaticDataIfNeeded,
  isRequestToNuxtAppStatic,
  isRequestToNuxtStats
} from './src/utils/renderingHelperFunctions';
import { BrowserStaticFileWithMeta } from './src/utils';

const cookieParser = require('cookie-parser');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const privateSettings = require('./privateSettings');
const minifyHTML = require('express-minify-html');

process.env.UV_THREADPOOL_SIZE = 128 as any;


process.on('uncaughtException', function(err) {
    console.error('process.on handler');
    console.error(err);
});


const app = express();


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({
    limit: "20480kb",
    type:'application/json',
    verify: (req, res, buf) => req.rawBody = buf,
}));

app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms :remote-user'));

app.use(require('./src/cache/cacheMidleware')());


const startServer = async function() {
    const port = process.env.PORT || 8081;
    const server = app.listen(port, function () {
        console.log('Backend listening on port ' + port);
    });

    server.setTimeout(500000);

    server.on('error', function (err) {
        console.error('on error handler');
        console.error(err);
    });

    server.on('clientError', function (err) {
        console.error('on clientError handler');
        console.error(err);
    });

    if (privateSettings && privateSettings.TLS_REJECT) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const {initCoreServiceLocator} = await import('./src/service-locator-init');
    await initCoreServiceLocator();

    await connectProjectsDatabase();

    const {initPassport} = await import('./src/auth/passport-helpers/swp-passport-init');
    initPassport(app);

    const routes = [
        require('./src/api/v1/login'),
        require('./src/api/v1/register'),
        require('./src/api/v1/user'),
        require('./src/api/v1/seo'),
        require('./src/api/v1/sys'),
        require('./src/api/v1/relator'),
        require('./src/api/v1/settings'),
        require('./src/api/v1/role'),
        require('./src/api/v1/log-error'),
        require('./src/api/v1/definition'),
        require('./src/api/v1/association-tasks'),
        require('./src/api/v1/raw-data'),
        require('./src/api/v1/history-state'),
        require('./src/api/v1/scheduled-tasks'),
        require('./src/api/v1/stat'),

        require('./src/api/v1/data-api'),
        require('./src/api/v1/files'),
        require('./src/api/v1/slug'),
        require('./src/api/v1/form'),
        require('./src/api/v1/grids'),
        require('./src/api/v1/gridViews'),
        require('./src/api/v1/cars'),
        require('./src/api/v1/car-sys'),
    ];

    const { setNoStoreForResponse } = await import('./src/utils');

    const nodeChangesObserver = coreServiceLocator.get('nodeChangesObserver');
    const browserStaticHelper = coreServiceLocator.get('browserStaticHelper');

    const globalRoute = require('./src/api/v1/global'); //keep global first in the list

    globalRoute(app, () => {});

    routes.forEach((route) => {
        route(app, () => {});
    });


    async function enableStaticServer(app) {
      app.use(minifyHTML({
        override: true,
        exception_url: false,
        htmlMinifier: {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          html5: true,
          minifyJS: true,
          minifyCSS: true,
        }
      }));

      app.get('*', (req, res, next) => {
        handleGetRequestForStaticDataIfNeeded(req, res, next, DIST_FOLDER);
      });


      app.get('*.*', async (req, res, next) => {
        try {
          browserStaticHelper.storeIfPossible(req);
        } catch (e) {
          console.error('Could not cache static file in cache', req.url);
        }

        next();
      });

      app.get('*.*', async (req, res, next) => {
        let staticPath;

        if (isRequestToNuxtStats(req.originalPath)) {
          staticPath = join(DIST_FOLDER, 'frontend');
        } else if (isRequestToNuxtAppStatic(req.originalPath)) {
          staticPath = join(DIST_FOLDER, 'frontend', 'public');
        } else {
          staticPath = join(DIST_FOLDER, 'browser');
        }

        try {
          const path = req.url.split('?')[0];
          const fileExists = browserStaticHelper.checkFileExistsOnDisk(path);

          if (!fileExists) {
            setNoStoreForResponse(res);
            return next();
          }

          return express.static(staticPath, {fallthrough: false})(req, res, next);
        } catch (ex) {
          console.log(ex);
        }
      });

      app.get('*.*', async (req, res, next) => {
        let fileFromInfoFromCache: BrowserStaticFileWithMeta;

        try {
          fileFromInfoFromCache = await browserStaticHelper.get(req);
        } catch (e) {
          fileFromInfoFromCache = null;
        }

        if (!fileFromInfoFromCache) {
          return next();
        }

        res.status(200)
          .set('Content-type', fileFromInfoFromCache.mimeType)
          .send(fileFromInfoFromCache.data);
      });

      app.get('*', async (req, res) => {
        req.url = DEFAULT_UNKNOWN_PAGE_URL;

        setNoStoreForResponse(res);
        res.status(404);

        res.end();
      });
    }

    nodeChangesObserver.observeAndProcess();

    enableStaticServer(app);

    require('./src/api/v1/final-handlers')(app, () => {}); //keep final-handlers.js last
}


startServer();
