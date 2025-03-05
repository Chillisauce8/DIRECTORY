'use strict';

module.exports = {
    INTERCOM: { connectionParams: {appId: '', appApiKey: '', oAuthToken:''}, supportAdminId: "290230" },
    SITE_URL: 'http://localhost:3000',
    SERVER_URL: 'http://localhost:2999',
    CLOUDINARY : {},
    CLIENT_PASSWORD_PREFIX: 'ab12!@',
    SEGMENT: {writeKey: '2u3vGkaLsnkaXVAUshnS9XhCI8VPo0WK'},
    SCHEDULER: {username : "", password : ""},
    FAKE_LOGIN: false,
    AUTHENTICATION: {loginCacheTime: 28800, staffAllowedIP:'127.0.0.1', maxLoginAttempt: 5, lockPeriodMin: 10},
    CACHE : {prefix: "c6d419d481fb33b04e23", defaultNodesTimeout: 3600,
        customOptions: { clearProductByLocationCacheOnProductUpdate: false } /*, type : 'redis', config : { endpoint : 'localhost', port : 6379 }*/},
    DIAGNOSTICS: {performanceReportItemTimeout: 600, performanceReportEnabled: false, totalQueryTimeMonitoringEnabled: false},
    TIMEOUT : 120*1000,
    TLS_REJECT: true,
    CURRENT_PLATFORM_ID: '4cd08cef1b164139bd38',
    INNSTANT : {mishor : {url : '', username : '', password : '', agent : '', userAgent : '', clientIp : ''},
    push : {url : '', username : '', password : '', agent : '', userAgent : '', clientIp : ''}},
    SQUID : {url: ''},
    SAGEPAY : {basicAuth : {username : '', password : ''}, vendorName : ''},
    SAGEPAY_LIVE : {basicAuth : {username : '', password : ''}, vendorName : ''},
    SAGE : {basicAuth : {username : '', password : ''}},
    ERROR_MESSAGES_EMAIL_LIST : [],
    SITEMAP: {allowSitemap : true, filename: '/sitemap.cache.xml'},
    TEMP_OPTIONS: { disableUnathorizedApiAccess: false },
    FULL_CONTACT: {apiKey: ''},
    SLACK: {usersReportMail: '', gmailTokenUserId: ''},
    TASKS_EXECUTION: {
        execute: false,
        skipCommsTemplateTasks: true,
    }
};
