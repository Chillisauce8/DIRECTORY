import {coreServiceLocator} from '../../serviceLocator';
import {IDataCrud} from '../../db';
import {
    processFilterNonMarqueNamesFromListBatchResult
} from './re-build-markets-part-2.clear-marque-list-batch-request-preparer';
import {join} from 'path';
import {promises as fsPromises} from 'fs';

const {writeFile, readFile} = fsPromises;


type MarketSource = 'classic-trader.com' | 'classic.com' | 'chat-gpt';


type MarketType = "Marque" | "Sub-brand" | "Lineage" | "Series" | "Model" | "Body Style" | "Trim" | "Edition" |
    "Variant" | "Engine" | "Generation" | "Powertrain" | "Fuel";


interface MarketPathItem {
    id: string;
    slug: string;
    name: string;
}

interface MarketMeta {
    slugToken: string; // path.slug items - joined via '@' EG - mercedes-benz@170@type-170
    parentSlugPath: string[]; // path.slag array without item
    parentSlugPathReverse: string[]; // path.slag array without item (reversed) - from parent to root
    parentMarketId: string;
}

export interface Market {
    fullName?: string;
    name: string;
    path: MarketPathItem[];
    metadata: MarketMeta;
    _id?: string;
    _doc?: string;
    type?: MarketType;
    marketTypes?: MarketType[];
    source?: MarketSource;
    years?: string[];
    classicUrl?: string;
    classicDescription?: string;
}


const dataCrudService = coreServiceLocator.get<IDataCrud>('dataCrudService');

const collectionName = 'markets';


export async function setSourceForExistingMarkets(req: Request) {
    const existingMarkets = await dataCrudService.queryAllAvailableNodes(req, collectionName, {});

    const marqueListFromClassicTraderCom = (await processFilterNonMarqueNamesFromListBatchResult())
        .map(i => i.name);

    for (const market of existingMarkets) {
        if (market.source) {
            continue;
        }

        const {fullName} = market;

        const source = market?. marqueListFromClassicTraderCom.includes(fullName) ?
            'classic-trader.com' : 'classic.com';

        market.source = source;
        delete market.isActive;

        await dataCrudService.updateNode(req, collectionName, market);
        console.log(`processed ${existingMarkets.indexOf(market) + 1} of ${existingMarkets.length}`);
    }
}


export function prepareCompletionBatchItem(content: string, id: string, model: string = 'gpt-4o') {
    return {
        'custom_id': id,
        method: 'POST',
        url: '/v1/chat/completions',
        body: {
            model,
            messages: [{'role': 'user' as 'user', content}],
        }
    };
}


export async function storeBatchFile(contentList: any[], fileName: string): Promise<void> {
    const filePath = join('src', 'cars', 'fixing-scripts', '.tmp', fileName);

    const content = contentList.map(i => JSON.stringify(i)).join('\n');

    await writeFile(filePath, content);
}


export async function clearMarketTypeForModels(req: Request) {
    const modelList = await dataCrudService.queryNodes(req, collectionName, {
        query: {
            "$and": [
                {"path.1": {"$exists": true}},
                {"path.2": {"$exists": false}},
                {type: {'$ne': 'Marque'}},
            ],
        },
    });

    for (const model of modelList) {
        delete model.type;
        await dataCrudService.updateNode(req, collectionName, model);

        console.log(`processed ${modelList.indexOf(model) + 1} of ${modelList.length}`);
    }
}


export async function removeMarketsFromChatGPT(req: Request) {
    return dataCrudService.deleteNodes(req, collectionName, {
        query: {
            source: 'chat-gpt',
        }
    });
}
