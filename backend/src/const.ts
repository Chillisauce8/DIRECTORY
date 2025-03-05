export const SECTIONS = {
    stag: 'stag',
    hen: 'hen',
    groups: 'groups',
    events: 'events',
    golf: 'golf',
};

export const ERROR_REASON = {
    objectNotFound: 100,
    genericAuthError: 101,
    invalidData: 102,
    registrationError: 103,
};


export const REQUEST_METHOD = {
    get: 'GET',
    head: 'HEAD'
};


export const CRITICAL_TASK_COUNT_BY_TASK_TYPE_MAP = {
    ['commsTemplate']: 500,
    ['locationUpdateOnExchangeRateUpdate']: 2000,
    ['updateLocationPageAfterProductUpdate']: 2000,
};


export const SECURE_COOKIES = {
    SESSION: 'authdata',
    SESSION_NAME: 'session-name',
    CSRF: '_csrf',
}


export const SECURE_COOKIES_LIST = [
    SECURE_COOKIES.SESSION,
    SECURE_COOKIES.SESSION_NAME,
    SECURE_COOKIES.CSRF
]

export const SECURE_HEADERS = {
    CSRF: 'x-csrf-token'
}


export const SECURE_HEADERS_LIST = [
    SECURE_HEADERS.CSRF
]


export const SERVER_RENDERED_PAGE_CACHE_PREFIX = 'SSR';
