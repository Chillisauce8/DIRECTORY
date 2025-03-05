
const DEFAULT_MAX_CACHE_TIME = 31536000;


export function setNoStoreForResponse(res) {
    res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.set('X-CS-Cache', 'no-store');
}


export function setStoreForResponse(res, maxAge=DEFAULT_MAX_CACHE_TIME, cacheMaxAge?: number) {
    res.set('Cache-Control', `public,max-age=${maxAge},s-maxage=${cacheMaxAge || maxAge}`);
}
