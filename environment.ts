import type {EnvironmentConfiguration} from '~/environment.example';


export const serverURL = 'http://localhost:2999';
// export const serverURL = 'https://test.skunkworksproject.com';
// export const serverURL = 'https://test.chillisauce.com';


const pageCacheRule = {
  // cache: {maxAge: 86400, staleMaxAge: 86400 * 2},
  headers: {'cache-control': `public,max-age=${86400},s-maxage=${86400},stale-while-revalidate=${2*86400}`}
};

const staticCacheRule = {
  // cache: {maxAge: 86400, staleMaxAge: 86400 * 2},
  headers: {'cache-control': `public, max-age=31536000, immutable`}
};

const noSsrRule = {
  ssr: false,
  headers: {'cache-control': `private, no-cache, no-store, must-revalidate`}
}

const appId = 'car';
const environment = 'development';

const env: EnvironmentConfiguration =  {
  appId,
  environment,
  ssr: false,
  http: {
    serverBaseURL: serverURL,
    headers: {
      'x-app-id': appId,
      'x-app-environment': environment,
    },
  },
  routeRules: {
    '/_nuxt/**': staticCacheRule,
  },
  devProxy: {
    '/api': {target: `${serverURL}/api`, changeOrigin: true, secure: false},
  },
  IS_LOCAL: true,
  IS_LIVE: false,
  // ST_SITE_REFERENCE: 'test_chillisaucelimited97423',
};


export default env;







