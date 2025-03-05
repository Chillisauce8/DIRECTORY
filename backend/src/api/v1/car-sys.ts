import {
    getTopLevelMarketList,
    updateNameFieldsAndSetTypeIfPossible
} from '../../fixing-scripts/markets/re-build-markets-part-1.update-names-and-set-marque-type';
import {wrapDefaultDataResponse} from '../../utils';
import {processGetMarketStructure} from '../../fixing-scripts/markets/re-build-markets-part-3.get-market-structure';
import {categoriseMarkets} from '../../fixing-scripts/markets/re-build-markets-part-4.categorize-markets';
import {
    checkMarquesWithoutChildren, extendExistingMarketListWithoutChildrenByDepth,
    extendExistingMarques
} from '../../fixing-scripts/markets/re-build-markets-part-5.extend-existing-marques';
import {clearMarketTypeForModels, removeMarketsFromChatGPT} from '../../fixing-scripts/markets/re-build-markets.extras';


async function handleUpdateNameFieldsAndSetTypeIfPossible(req: Request, res) {
    await updateNameFieldsAndSetTypeIfPossible(req);

    wrapDefaultDataResponse(res, Promise.resolve('Done'));
}


async function handleGetTopLevelMarketList(req: Request, res) {
    wrapDefaultDataResponse(res, getTopLevelMarketList(req));
}


async function handleProcessGetMarketStructure(req, res) {
    await wrapDefaultDataResponse(res, processGetMarketStructure(req));
}


async function handleCategoriseMarkets(req: Request, res) {
    await wrapDefaultDataResponse(res, categoriseMarkets(req));
}


async function handleCheckMarquesWithoutChildren(req: Request, res) {
    await wrapDefaultDataResponse(res, checkMarquesWithoutChildren(req));
}


async function handleClearMarketTypeForModels(req: Request, res) {
    await wrapDefaultDataResponse(res, clearMarketTypeForModels(req));
}


async function handleExtendExistingMarques(req: Request, res) {
    await wrapDefaultDataResponse(res, extendExistingMarques(req));
}


async function handleExtendExistingMarketListWithoutChildrenByDepth(req: Request, res) {
    const source = req['query'].sources ? JSON.parse(req?.['query']?.sources) : undefined;
    const depth = parseInt(req['params'].depth, 10);
    const startFromId = req?.['query']?.startFromId;
    const startFromIndex = parseInt(req?.['query']?.startFromIndex, 10);

    const params = {
        source,
        depth,
        startFromId,
        startFromIndex,
    };

    await wrapDefaultDataResponse(res, extendExistingMarketListWithoutChildrenByDepth(req, params));
}


async function handleRemoveMarketsFromChatGPT(req: Request, res) {
    await wrapDefaultDataResponse(res, removeMarketsFromChatGPT(req));
}


module.exports = function(app, callback) {
  app.get('/api/sys/updateNameFieldsAndSetTypeIfPossible', handleUpdateNameFieldsAndSetTypeIfPossible);
  app.get('/api/sys/getTopLevelMarketList',
    handleGetTopLevelMarketList);
  app.get('/api/sys/processGetMarketStructure',
    handleProcessGetMarketStructure);
  app.get('/api/sys/categoriseMarkets',
    handleCategoriseMarkets);
  app.get('/api/sys/checkMarquesWithoutChildren',
    handleCheckMarquesWithoutChildren);
  app.get('/api/sys/clearMarketTypeForModels',
    handleClearMarketTypeForModels);
  app.get('/api/sys/extendExistingMarques',
    handleExtendExistingMarques);
  app.get('/api/sys/extendExistingMarketListByDepth/:depth',
    handleExtendExistingMarketListWithoutChildrenByDepth);
  app.get('/api/sys/removeMarketsFromChatGPT',
    handleRemoveMarketsFromChatGPT);
}
