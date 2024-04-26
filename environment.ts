import type {EnvironmentConfiguration} from '~/environment.example';


// const serverURL = 'http://localhost:2999';
const serverURL = 'https://testorigin.chillisauce.com';
// const serverURL = 'https://chillisauce.com';


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

const env: EnvironmentConfiguration =  {
  ssr: false,
  http: {
    serverBaseURL: serverURL
  },
  routeRules: {
    // '/my-events/**': noSsrRule,
    // '/supplier/**': noSsrRule,
    // '/inv/**': noSsrRule,
    // '/product-preview': noSsrRule,
    // '/': pageCacheRule,
    // '/stag/**': pageCacheRule,
    // '/hen/**': pageCacheRule,
    // '/groups/**': pageCacheRule,
    // '/events/**': pageCacheRule,
    // '/blog/**': pageCacheRule,
    // '/about-**': pageCacheRule,
    // '/_nuxt/**': staticCacheRule,
  },
  devProxy: {
    '/api/': serverURL,
    // '/login': serverURL,
    // '/logout': serverURL,
    // '/register': serverURL,
  },
  IS_LOCAL: true,
  IS_LIVE: false,
  // ST_SITE_REFERENCE: 'test_chillisaucelimited97423',
};


export default env;







