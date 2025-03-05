import { restoreAssociations } from '../../fixing-scripts/restoreAssociations';
import { clearCollection } from '../../fixing-scripts/clearCollection';
import { coreServiceLocator } from '../../serviceLocator';
import { wrapDefaultDataResponse } from '../../utils';
import { basicAuthForScheduledTasks } from '../../auth/basic-auth';
import { fixUserSecurity } from '../../fixing-scripts/fixUsersId';
import { updateCurrencyMapping } from '../../fixing-scripts/updateCurrencyMapping';
import { extractCategoriesData } from '../../fixing-scripts/extract-categories-data';
import {
    createNewMarketsFromClassicCom,
    migrateMarketsFromApifyKVS, updateMarketsFromClassicComWithYearsRange
} from '../../fixing-scripts/migrate-markets-from-apify-kvs';
import {
    migrateAllListingsHistoryFromDataset,
    migrateLatestListingFromApifyKvs,
    migrateListingHistoryFromApifyKvs, migrateListingHistoryFromDataset
} from '../../fixing-scripts/migrate-listings-from-apify-kvs';
import {fixListingsIncorrectCurrencies} from '../../fixing-scripts/fix-listings-incorrect-currencies';
import {getCountryCodeToMapSvg, populateCountryCollection} from '../../fixing-scripts/country-collection';
import {
    populateExchangeRatesCollection,
    storeExchangeRateForToday
} from '../../fixing-scripts/populate-exchange-rates-collection';
import { recreateNodes } from '../../fixing-scripts/recreate-nodes';


// const nodeChangeTaskStatisticHelperFactory = coreServiceLocator.get('nodeChangeTaskStatisticHelperFactory', true);
// const serverRenderingHelper = coreServiceLocator.get('serverRenderingHelper');
const cacheHelper = coreServiceLocator.get('cacheHelper');
const dataCrudService = coreServiceLocator.get('dataCrudService');
const definitionCrud = coreServiceLocator.get('definitionCrud');
const redisHelper = coreServiceLocator.get('redisHelper');


const handleGetDefinitionByType = function(req: Request, res, next) {
    const type = req['params'].type;
    wrapDefaultDataResponse(res, definitionCrud.getDefinitionByType(req, type));
};

const handleGetNodesByDefinitionType = function(req: Request, res, next){
    const type = req['params'].type;

    wrapDefaultDataResponse(res, definitionCrud.getDefinitionByType(req, type));
};

const handleClearCache = function(req: Request, res, next){
    wrapDefaultDataResponse(res, cacheHelper.clearAllCommonData(req));
};

const handleClearCacheDataByPrefix = function(req: Request, res, next) {
    const prefix = req['params'].prefix;
    wrapDefaultDataResponse(res, cacheHelper.clearDataByPrefix(req, prefix));
};

const handleClearDataCacheByKey = function(req: Request, res, next) {
    const key = req['params'].key;
    wrapDefaultDataResponse(res, cacheHelper.clearDataByFullKey(req, key));
};

// const handleClearSSRCacheByParams = function(req: Request, res, next) {
//     const {appId, url, environment} = req.body as any;
//
//     wrapDefaultDataResponse(res, serverRenderingHelper.invalidatePageCacheByParams(req, {appId, url, environment}));
// };
//
// const handleClearSSRCacheByUrlList = function(req: Request, res) {
//     const urlList = req.body['urlList'];
//
//     wrapDefaultDataResponse(res, serverRenderingHelper.invalidatePageCacheByUrlList(req, urlList));
// };

// const handleSafeRecacheForUrl = function(req: Request, res) {
//     const url = req.body['url'];
//
//     wrapDefaultDataResponse(res, serverRenderingHelper.safeRecacheSSRPageByUrl(req, url));
// };

// const handleSafeRecacheForUrlList = function(req: Request, res) {
//     const urlList = req.body['urlList'];
//
//     wrapDefaultDataResponse(res, serverRenderingHelper.safeRecacheSSRPageList(req, urlList));
// };

// const handleGetPageTTL = function(req: Request, res) {
//     const url = req.body['url'];
//
//     wrapDefaultDataResponse(res, serverRenderingHelper.getPageCacheTTL(req, url));
// };

const handleGetCacheByKey = function(req: Request, res) {
    const key = req['params'].key;

    wrapDefaultDataResponse(res, cacheHelper.readFromCache(req, key));
};

//
// const handleResetSSRCacheInCDN = (req: Request, res) => {
//     const urlList = req.body['pageUrlList'];
//
//     wrapDefaultDataResponse(res, serverRenderingHelper.resetPageListInCDN(req, urlList));
// };
//
// const handleReRenderAndResetSSRCacheInCDN = (req: Request, res) => {
//     const urlList = req.body['pageUrlList'];
//
//     wrapDefaultDataResponse(res, serverRenderingHelper.safeRecacheSSRPageListAndResetInCdn(req, urlList));
// };


const handleRestoreAssociations = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, restoreAssociations(req));
};

const handleClearCollection = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, clearCollection(req));
};


const handleFixUserSecurity = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, fixUserSecurity(req));
};

const handlerRecreateNodes = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, recreateNodes(req));
};

const handleUpdateCurrencyMapping = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, updateCurrencyMapping(req));
};


const handleExtractCategoriesData = function(req: Request, res, next) {
    wrapDefaultDataResponse(res, extractCategoriesData(req));
};

const handleResetLock = async (req: Request, res) => {
    const exec = async (key) => {
        const ttlBefore = await redisHelper.getTTL(key);

        await redisHelper.clearData(`lock:${resourceKey}`);

        const ttlAfter = await redisHelper.getTTL(key);

        return {ttlBefore, ttlAfter};
    };

    const resourceKey = req['params'].resourceKey;

    const key = `lock:${resourceKey}`;

    wrapDefaultDataResponse(res, exec(key));
};

const handleCollectionCount = async (req: Request, res) => {
    const collectionName = req['params'].collectionName;
    const promise =  dataCrudService.queryNodeCount(req, collectionName, {query: {}});
    wrapDefaultDataResponse(res, promise);
};

const healthckeckHandler = (req: Request, res) => {
    res.status(200).json({'ok': true});
};


const handleMigrateMarketsFromApifyKVS = (req: Request, res) => {
    wrapDefaultDataResponse(res, migrateMarketsFromApifyKVS(req));
};


const handleMigrateListingHistoryFromApifyKvs = (req: Request, res) => {
    wrapDefaultDataResponse(res, migrateListingHistoryFromApifyKvs(req));
};


const handleMigrateLatestListingFromApifyKvs = (req: Request, res) => {
    wrapDefaultDataResponse(res, migrateLatestListingFromApifyKvs(req));
};


const handleMigrateListingHistoryFromDataset = (req: Request, res) => {
    wrapDefaultDataResponse(res, migrateListingHistoryFromDataset(req));
};


const handleMigrateAllListingsHistoryFromDataset = (req: Request, res) => {
    wrapDefaultDataResponse(res, migrateAllListingsHistoryFromDataset(req));
};


module.exports = function(app, callback) {
    // probably feature permissions should be more specific
    // instead of 'read product permission - assume that this is authorized supplier
    // 'read suppliers permission' - authorized staff

    // const updateCacheAuth = requireYesPermissionsFor(USER_PERMISSIONS.feature.staffArea.updateCache);
    // const updateSsrCacheAuth = requireYesPermissionsFor(USER_PERMISSIONS.feature.staffArea.updateSsrCache);
    // const updateProductsCacheAuth = requireYesPermissionsFor(USER_PERMISSIONS.feature.staffArea.updateProductsCache);
    // const updateRelatorsAuth = requireYesPermissionsFor(USER_PERMISSIONS.feature.staffArea.updateRelators);

    app.get(['/healthcheck', '/_healthcheck', '/_hc', '/_health'], healthckeckHandler);

    // app.post('/api/sys/ssr/page-cache/reset', handleClearSSRCacheByParams);
    // app.post('/api/sys/ssr/clearCdnCache', /*updateSsrCacheAuth,*/ handleResetSSRCacheInCDN);
    // app.post('/api/sys/ssr/reCacheAndClearCdnCache', /*updateSsrCacheAuth,*/ handleReRenderAndResetSSRCacheInCDN);

    // app.post('/api/sys/updateProductsCache', /*updateProductsCacheAuth,*/ handleUpdateProductsCache);

    // app.get('/api/sys/fixOldGridViews', handleFixOldGridViews);
    // app.get('/api/sys/copyGridViews', handleCopyGridViews);

    // app.get('/api/sys/ssr/cachedPageKeys', handleGetCachedPageKeysByPattern);
    // app.get('/api/sys/definitions', readMassEditAuth, handleGetAllCmsDefinitions);

    app.get('/api/sys/definitions/:type', handleGetDefinitionByType);

    app.get('/api/sys/clearcache', /*updateCacheAuth,*/ handleClearCache);
    app.get('/api/sys/clearcache/byprefix/:prefix', /*updateCacheAuth,*/ handleClearCacheDataByPrefix);
    app.get('/api/sys/clearcache/bykey/:key', /*updateCacheAuth,*/ handleClearDataCacheByKey);

    //app.get('/api/sys/clearDBCollection', basicAuthForScheduledTasks, handleClearDBCollection);
    // app.get('/api/sys/addIndex', basicAuthForScheduledTasks, (req: Request, res) => {
    //   wrapDefaultDataResponse(res, addIndex());
    // });

    app.get('/api/sys/memory_usage', (req: Request, res, next) => {
        const used = process.memoryUsage();
        let result = [];

        for (let key in used) {
            result.push(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }

        wrapDefaultDataResponse(res, Promise.resolve(result));
    });

    app.get('/api/sys/resetLock/:resourceKey', basicAuthForScheduledTasks, handleResetLock);
    app.get('/api/sys/restoreAssociations', handleRestoreAssociations);
    app.get('/api/sys/clearCollection', handleClearCollection);
    //app.get('/api/sys/fixUserSecurity', handleFixUserSecurity);
    app.get('/api/sys/recreateNodes', handlerRecreateNodes);

    app.get('/api/sys/extractCategoriesData', handleExtractCategoriesData);

    app.get('/api/sys/collection-count/:collectionName', basicAuthForScheduledTasks, handleCollectionCount);

    app.get('/api/sys/migrateMarketsFromApifyKVS', handleMigrateMarketsFromApifyKVS);
    app.get('/api/sys/migrateListingHistoryFromApifyKvs', handleMigrateListingHistoryFromApifyKvs);
    app.post('/api/sys/migrateLatestListingFromApifyKvs', handleMigrateLatestListingFromApifyKvs);
    app.post('/api/sys/migrateListingHistoryFromDataset', handleMigrateListingHistoryFromDataset);
    app.post('/api/sys/migrateAllListingsHistoryFromDataset', handleMigrateAllListingsHistoryFromDataset);
    app.get('/api/sys/fixListingsIncorrectCurrencies', (req, res) => {
        fixListingsIncorrectCurrencies(req);
    });


    app.get('/api/sys/createNewMarketsFromClassicCom', (req) => createNewMarketsFromClassicCom(req));
    app.get('/api/sys/updateMarketsFromClassicComWithYearsRange', (req) => updateMarketsFromClassicComWithYearsRange(req));
    app.get('/api/sys/populateCountryCollection', (req) => populateCountryCollection(req));
    app.get('/api/sys/populateExchangeRatesCollection', (req) => populateExchangeRatesCollection(req));
    app.get('/api/sys/storeExchangeRateForToday', (req, res) => {
        wrapDefaultDataResponse(res, storeExchangeRateForToday(req))
    });
    app.get('/api/sys/getCountryCodeToMapSvg', (req, res) => {
        wrapDefaultDataResponse(res, getCountryCodeToMapSvg(req))
    });

    callback();
};
