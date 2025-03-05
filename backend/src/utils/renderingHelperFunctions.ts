import {join} from 'path';
import { coreServiceLocator } from '../serviceLocator';
var moment = require('moment');
var privateSettings = require('../../privateSettings');
var constant = require('../const');


export const DIST_FOLDER = join(process.cwd(), 'public');

export const DEFAULT_UNKNOWN_PAGE_URL = '/404.html';

const DISABLE_SSR_FOR_NOT_LOGGED_IN_USER = false;
const LOCATION_NOT_ALLOWED_MESSAGE = 'location not allowed';
const TOO_LONG_RENDER = 'Too long render process';
const TOO_LONG_RENDER_DELAY_SEC = 100;
const DEFAULT_MAX_CACHE_TIME = 31536000;


const DOUBLE_SLASH_RE = /[/\\]{2,}/g;


function _normalizeNodeHeaders(nodeHeaders) {
    const headers = new Headers();

    for (const [name, value] of Object.entries(nodeHeaders)) {
        if (Array.isArray(value)) {
            for (const item of value) {
                headers.append(name, item);
            }
        } else if (value) {
            headers.set(name, value as string);
        }
    }

    return headers;
}

class H3Event {
    "__is_event__" = true;

    // Context
    node = undefined;
    context = {};

    // Request
    _method = undefined;
    _headers = undefined;

    // Response
    _handled = false;

    constructor(req, res) {
        this.node = {req, res};
    }

    get path() {
        return (this.node.req.url || "/").replace(DOUBLE_SLASH_RE, "/");
    }

    get handled(): boolean {
        return (
            this._handled || this.node.res.writableEnded || this.node.res.headersSent
        );
    }

    get method() {
        return this._method || (this.node.req.method);
    }

    get headers() {
        if (!this._headers) {
            this._headers = _normalizeNodeHeaders(this.node.req.headers);
        }
        return this._headers;
    }
}


// let nuxtRenderHandler = undefined;

export function getUrlForCheckingForUpperCase(req): {url: string; suffix?: string} {
    const path: string = req.originalPath;

    const excludeUrlList = ['lgn', 'inv', 'rev', 'raw-data', 'cnfrm'];

    for (const excludeUrl of excludeUrlList) {
        if (path.indexOf(`/${excludeUrl}`) === -1) {
            continue;
        }

        const suffixStartSlash = path.indexOf(excludeUrl) + excludeUrl.length;

        return {url: path.slice(0, suffixStartSlash), suffix: path.slice(suffixStartSlash)};
    }

    return {url: path};
}


export function isUpperCaseUrl(req): boolean {
    const {url} = getUrlForCheckingForUpperCase(req);

    return /[A-Z]/.test(url);
}


export function getLowerCaseUrl(req) {
    const {url, suffix} = getUrlForCheckingForUpperCase(req);

    const query = req.originalUrl.split('?')[1];

    const preparedUrl  = [url.toLowerCase(), suffix].filter(part => !!part).join('');

   return [preparedUrl, query].filter(p => !!p).join('?');
}


export function setNoStoreForResponse(res) {
    res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.set('X-CS-Cache', 'no-store');
}

function setStoreForResponse(res, maxAge=DEFAULT_MAX_CACHE_TIME, cacheMaxAge?: number, staleWhileRevalidate = 172800) {
    res.set('Cache-Control', `public,max-age=${maxAge},s-maxage=${cacheMaxAge || maxAge},stale-while-revalidate=${staleWhileRevalidate}`);
}

export function isUrlFromErrorStackTrace(req) {
    let stackTraceUrlRegExp = /(.+)\:\d+\:\d+/g;

    return stackTraceUrlRegExp.test(req.url);
}

export function getCorrectUrlFromErrorStackTraceUrl(req) {
    let stackTraceUrlRegExp = /(.+)\:\d+\:\d+/;
    let url = req.url;

    let match = url.match(stackTraceUrlRegExp);

    if (!match || !match.length) {
        return;
    }

    return match[1];
}

export function isReqMethodPossibleForSSR(req) {
    return req.method === constant.requestMethod.get || req.method === constant.requestMethod.head;
}

export function prepareServerRenderingError(options: {message: string | Array<string>, req: any}) {
    let url = options.req.url;
    let userAgent = options.req.headers['user-agent'];
    let message = options.message instanceof Array ? options.message.join(', ') : options.message;
    let date = moment().toISOString();

    return new Error(JSON.stringify({url, userAgent, message, date}));
}


export function isRequestToNuxtAppStatic(url: string): boolean {
    return url.startsWith('/_nuxt/');
}

export function isRequestToNuxtAppIsland(url: string): boolean {
    return url.startsWith('/__nuxt_island/');
}

export function isRequestToNuxtStats(url: string): boolean {
    return url.indexOf('stats.html') !== -1;
}

export function isUrlAllowedForServerRendering(url: string) {
    if (isUrlFromList(url, ['/(stag|hen|groups|golf|events)/package', '/(stag|hen|groups|golf|events)/custom-location'])) {
        return false;
    }

    if (isUrlFromList(url, ['/assets'])) {
        return false;
    }

    if (isRequestToNuxtAppStatic(url)) {
        return false;
    }

    if (isRequestToNuxtStats(url)) {
        return false;
    }

    let urlListAllowedForServerRendering = [
        '/',
        '/about-.+',
        '/stag',
        '/hen',
        '/events',
        '/groups',
        '/golf',
        '/blog',
        '/index.html',
        '/my-events',
        '/inv',
        '/supplier/[a-z0-9]+/event/[a-z0-9]+/package',
    ];

    return isUrlFromList(url, urlListAllowedForServerRendering);
}

export function isSafeSSRRecacheRequst(req) {
    const safeRecacheQueryParamName = 'safeRecache';
    return safeRecacheQueryParamName in req.query;
}

function hasNotFoundError(errorMessage: string) {
    let notFoundRegExp = /\- 404 \-/gi;

    return notFoundRegExp.test(errorMessage);
}

function handleNotFoundPage(res) {
    setNoStoreForResponse(res);
    res.status(404);
}

function redirectNotCorrectBlogUrl(originalUrl, req, res): boolean {
    const urlAndQuery = originalUrl.split('?');
    const steps = urlAndQuery[0].split('/');

    if (originalUrl === DEFAULT_UNKNOWN_PAGE_URL) {
        return false;
    }

    if (steps.length < 2) {
        return false;
    }

    const lastUrlStep = steps[steps.length - 1];
    const prevUrlStep = steps[steps.length - 2];

    if (lastUrlStep.startsWith('post-') && prevUrlStep !== 'blog') {
        const newUrl = [...steps.slice(0, steps.length - 2), 'blog', steps[steps.length - 1]].join('/')
            + (urlAndQuery[1] ? ('?' + urlAndQuery[1]) : '');

        return res.redirect(301, newUrl);
    }

    return false;
}


function redirectToPreviousUrlIfPossible(originalUrl, req, res): boolean {
    const urlAndQuery = originalUrl.split('?');
    const steps = urlAndQuery[0].split('/');

    if (originalUrl === DEFAULT_UNKNOWN_PAGE_URL) {
        return false
    }

    if (steps.length < 2) {
      return false;
    }

    const result = redirectNotCorrectBlogUrl(originalUrl, req, res);

    if (result) {
        return true;
    }

    steps.pop();

    const newUrl = (steps.join('/') || '/') + (urlAndQuery[1] ? ('?' + urlAndQuery[1]) : '');

    res.redirect(301, newUrl);
    return true;
}

function isPageUnknown(html): boolean {
    return !html || html.indexOf('no-data-for-page') !== -1;
}

async function renderPage(req, res, rendererFabric, attemptCount = 1) {
    for (let attempt = 0; attempt < attemptCount; ++attempt) {
        try {
            const renderResult = await rendererFabric();

            return renderResult;
        } catch (e) {
            console.log('Render error', e.message || JSON.stringify(e));

            const error = prepareRenderingErrorIfNeeded(req, e, attempt, attemptCount);

            logRenderingError(req, error);

            if (needStopPageRendering(error)) {
                return null;
            }
        }
    }
}

function prepareRenderingErrorIfNeeded(req, error, attempt, attemptCount) {
    const errorMessage = `Rendering attempt #${attempt + 1} of ${attemptCount}: ${error.message || error}`;

    if (hasNotFoundError(errorMessage) || attempt === attemptCount) {
        if ('message' in error) {
            error.message = errorMessage;
        } else {
            error = prepareServerRenderingError({message: errorMessage, req: req});
        }
    }

    return error;
}

function logRenderingError(req, error) {
    const dbLogger = coreServiceLocator.get('dbLogger');
    dbLogger.saveError(req, error.message || error, dbLogger.ERROR_CATEGORIES.ssrError);
}

function needStopPageRendering(error) {
    let errorMessage = error.message || error;

    if (errorMessage.indexOf(LOCATION_NOT_ALLOWED_MESSAGE) !== 1) {
        return true;
    }

    if (errorMessage.indexOf(TOO_LONG_RENDER) !== -1) {
        return true;
    }

    if (hasNotFoundError(errorMessage)) {
        return true;
    }

    return false;
}

function isRequestToAPI(req) {
    let specialUrls = ['/login', '/logout', '/healthcheck', '/_healthcheck', '/_hc', '/_health'];

    for (let i = 0; i < specialUrls.length; ++i) {
        if (req.originalPath === specialUrls[i]) {
            return true;
        }
    }

    return req.url.indexOf('/api') !== -1;
}

export function isRequestToStatic(req) {
    let staticRegExp = /\.(svg|woff|woff2|eot|ttf|css|js|ico|png|jpg|map|txt|json)$/;
    let serviceWorkerManifestName = 'ngsw.json';

    return staticRegExp.test(req.url) ||
        req.url.indexOf(serviceWorkerManifestName) !== -1;
}


export function isUrlFromList(url: string, possibleUrlList) {
    const cleanedUrl = url.split('?')[0].split(':')[0];

    return possibleUrlList.some(url => {
        let regExpStr;

        if (url.endsWith('$')) {
            regExpStr = url;
        } else {
            regExpStr = '^\\' + url + '(\\/.*)?$';
        }

        return new RegExp(regExpStr, 'i').test(cleanedUrl)
    });
}

export function handleGetRequestForStaticDataIfNeeded(req, res, next, distFolder) {
  // clearCloudCMSSetCookieHeaders(res);

  if (privateSettings.ENVIRONMENT === 'staging' && req.url.indexOf('google803f597ccd647c6c.html') !== -1) {
    return res.status(200).send('google-site-verification: google803f597ccd647c6c.html');
  }

  if (/\/s\/.{5}/.test(req.url)) {
    return next();
  }

  if (req.url.indexOf('report.html') !== -1 || req.url.indexOf('stats.html') !== -1) {
    setNoStoreForResponse(res);
    return next();
  }

  if (isRequestToAPI(req)) {
    return next();
  }

  if (isRequestToStatic(req)) {
    setStoreForResponse(res);
    return next();
  }

  // if (!isUrlAllowedForStatic(req.url)) {
  //   return next();
  // }

  const authHelper = coreServiceLocator.get('authHelper');

  if ((DISABLE_SSR_FOR_NOT_LOGGED_IN_USER && authHelper.isAuthenticatedSync(req)) ||
    !isUrlAllowedForServerRendering(req.originalPath)) {
    setNoStoreForResponse(res);
    return res.sendFile(join(distFolder, 'browser', 'index.html'));
  }

  next();
}
