import type {EnvironmentConfiguration} from '~/environment.example';


// const serverURL = 'http://localhost:2999';
const serverURL = 'https://test.chillisauce.com';

const hourInSec = 60 * 60;

const pageCacheRule = {
  //cache: {maxAge: 86400, staleMaxAge: 86400 * 2},
  headers: {'cache-control': `public,max-age=${12 * hourInSec},s-maxage=${12 * hourInSec},stale-while-revalidate=${48 * hourInSec}`}
};

const staticCacheRule = {
  // cache: {maxAge: 86400, staleMaxAge: 86400 * 2},
  headers: {'cache-control': `public, max-age=31536000, immutable`}
};

const noSsrRule = {
  ssr: false,
  headers: {'cache-control': `private, no-cache, no-store, must-revalidate`}
}

const env: EnvironmentConfiguration =  {
  ssr: true,
  http: {
    serverBaseURL: serverURL,
    serverDomain: 'chillisauce.com'
  },
  routeRules: {
    '/my-events/**': noSsrRule,
    '/supplier/**': noSsrRule,
    '/inv/**': noSsrRule,
    '/preview-product': noSsrRule,
    '/preview-post': noSsrRule,
    '/': pageCacheRule,
    '/stag/**': pageCacheRule,
    '/hen/**': pageCacheRule,
    '/groups/**': pageCacheRule,
    '/events/**': pageCacheRule,
    '/blog/**': pageCacheRule,
    '/about-**': pageCacheRule,
    '/_nuxt/**': staticCacheRule,
  },
  IS_LOCAL: false,
  IS_LIVE: false,
  IS_STAGING: false,
  ST_SITE_REFERENCE: 'test_chillisaucelimited97423', // 'test_chillisaucelimited97423'
  enableLogRocket: true,
  leaveDebuggers: false,
  navigationDebug: true,
  enableZukoTracking: false,
  googleAuth: {
    scope: 'email profile',
    clientId: '610674095605-6r1q1gd4d00log9l99ma6a4lplt4e3ff.apps.googleusercontent.com',
  },
};


export default env;
