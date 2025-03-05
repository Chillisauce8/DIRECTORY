import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {coreServiceLocator} from '../serviceLocator';
import {Market} from './markets/re-build-markets.extras';


const dataCrudService: DataCrudWithRelators = coreServiceLocator.get('dataCrudService');
export const MARKETS_COLLECTION_NAME = 'markets';


export async function setTypeForMarkets(req: Request): Promise<void> {
  const marketList = await loadMarketsFromDB(req);

  for (const market of marketList) {
    const updatedMarket = await setTypeForMarket(req, market);

    console.log(`processed ${marketList.indexOf(market) + 1} of ${marketList.length} (${market.name} ${updatedMarket.type})`);
  }
}


async function loadMarketsFromDB(req: Request): Promise<Market[]> {
  return dataCrudService.queryAllAvailableNodes(req, MARKETS_COLLECTION_NAME, {query: {}});
}


async function setTypeForMarket(req: Request, market: Market): Promise<Market> {
  if (market.type) {
    return market;
  }

  const type = market.path.length === 1 ? 'Marque' : 'Model';

  market.type = type;

  return dataCrudService.updateNode(req, MARKETS_COLLECTION_NAME, market);
}
