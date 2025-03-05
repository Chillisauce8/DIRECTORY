import {coreServiceLocator} from '../../serviceLocator';
import {ChatGptHelper} from '../../utils';
import {IDataCrud} from '../../db';
import {Market} from './re-build-markets.extras';


const chatGptHelper = coreServiceLocator.get<ChatGptHelper>('chatGptHelper');
const dataCrudService = coreServiceLocator.get<IDataCrud>('dataCrudService');

const collectionName = 'markets';


export async function categoriseMarkets(req: Request) {
    const firstLevelMarketList = await dataCrudService.queryNodes(req, collectionName, {
        query: {
            "$and": [
                {"path.1": {"$exists": true}},
                {"path.2": {"$exists": false}},
                {"type": {"$exists": false}}
            ]
        },
    });

    for (const market of firstLevelMarketList) {
        await processMarket(req, market);
        console.log(`processed ${firstLevelMarketList.indexOf(market) + 1} of ${firstLevelMarketList.length}`);
    }
}


async function processMarket(req: Request, market: Market) {
    const upperMarketList = await getUpperLevelMarketTypes(req, market);

    const message = prepareCompletionMessage(market, upperMarketList);

    const response = await chatGptHelper.createCompletion(message, 'gpt-4o');

    let parsedResponse;

    try {
        parsedResponse = JSON.parse(response);
    } catch (e) {
        console.error('Failed to parse response for', market.fullName, `(${market._doc})`);

        return;
    }

    await dataCrudService.updateNode(req, collectionName, {...market, type: parsedResponse.type})
    console.log(`processed ${market.fullName} (${market._doc})`);

    const childrenList = await dataCrudService.queryNodes(req, collectionName, {
        query: {
            'metadata.parentMarketId': market._doc,
        },
    });

    if (!childrenList.length) {
        return;
    }

    for (const child of childrenList) {
        await processMarket(req, child);
    }
}


async function getUpperLevelMarketTypes(req: Request,
                                        market: Market): Promise<Pick<Market, '_doc' | 'type' | 'name' | 'marketTypes'>[]> {
    const parentIdList = market.path.map(p => p.id);
    parentIdList.pop();

    const parentMarketList: Pick<Market, '_doc' | 'type' | 'name' | 'marketTypes'>[] =
        await dataCrudService.queryNodes(req, collectionName, {
            query: {
                _doc: {$in: parentIdList},
                _fields: {
                    _doc: 1,
                    type: 1,
                    name: 1,
                    marketTypes: 1
                }
            },
        });

    return parentIdList.map(id => parentMarketList.find(p => p._doc === id));
}


function prepareCompletionMessage(market: any, upperMarketList: any[]): string {
    const messageParts = [
        `Given the following:`,
        ``,
        upperMarketList.map(({name, type}) => `${name}: ${type}`).join('\n'),
        ``,
        `We want define the category type "${market.name}" entity in the context of the full naming path: ${market.fullName}, ` +
        `where  order and naming convention for most ${upperMarketList[0].name} vehicles, ` +
        `is as follows: ${JSON.stringify(upperMarketList[0].marketTypes).replace(/,/gi, ', ')}.`,
        ``,
        `ONLY RETURN THE correct enum value as a simple JSON value like this ` +
        `(WITHOUT any formatting tags (e.g., no code blocks or additional text)):`,
        ``,
        `{"type": "{{Value}}"}`,
    ];

    return messageParts.join('\n');
}
