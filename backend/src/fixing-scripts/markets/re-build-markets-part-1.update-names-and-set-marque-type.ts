import {coreServiceLocator} from '../../serviceLocator';
import {IDataCrud} from '../../db';


const dataCrudService = coreServiceLocator.get<IDataCrud>('dataCrudService');

const collectionName = 'markets';


export async function updateNameFieldsAndSetTypeIfPossible(req: Request) {
    const marketList = await fetchMarketList(req);

    console.log(`Fetched ${marketList.length} markets`);

    for (const market of marketList) {
        const {name: fullName, path} = market;

        const name = path[path.length - 1]?.name;

        if (!name) {
            console.error(`Market with id ${market._id} has no name`);
            continue;
        }

        const updatedMarket = {...market, fullName, name};

        if (path.length === 1) {
            updatedMarket.type = 'Marque';
        }

        const updatedNode = await dataCrudService.updateNode(req, collectionName, updatedMarket);
        console.log(`processed ${marketList.indexOf(market) + 1} of ${marketList.length}`);
    }
}


export async function getTopLevelMarketList(req: Request) {
    const marketList = await dataCrudService.queryNodes(req, collectionName, {query: {
        path: {$size: 1}, _fields: {name: 1},
    }});

    return marketList.map(i => i.name);
}


async function fetchMarketList(req: Request) {
    return dataCrudService.queryNodes(req, collectionName, {query: {}});
}
