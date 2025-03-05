import {coreServiceLocator} from '../../serviceLocator';
import {IDataCrud} from '../../db';
import {Market} from './re-build-markets.extras';
import {ChatGptHelper} from '../../utils';
import {nodeSystemDataHelper} from '../../db/node-system-data-helper';
import {ObjectId} from 'mongodb';


interface ExtendExistingMarketListParams {
    depth?: number;
    source?: string[];
    startFromId?: string;
    startFromIndex?: number;
}


const dataCrudService = coreServiceLocator.get<IDataCrud>('dataCrudService');
const chatGptHelper = coreServiceLocator.get<ChatGptHelper>('chatGptHelper');


const collectionName = 'markets';


export async function extendExistingMarques(req: Request) {
    // const marquesWithoutChildren = await checkMarquesWithoutChildren(req);

    const marqueIdList = [
        "669a46e7b66b93c0617970fa",
        // "669a46f8b66b93c061797166",
        // "669a46f8b66b93c061797169",
        // "669a46f9b66b93c06179716c",
        // "669a46f9b66b93c06179716f",
        // "669a46fab66b93c061797172",
        // "669a46fab66b93c061797175",
        // "669a473cb66b93c06179730a",
        // "669a473cb66b93c06179730d",
        // "669a4741b66b93c06179732e"
    ];

    const marquesWithoutChildren = await dataCrudService.queryNodes(req, collectionName, {
        query: {
            _doc: {$in: marqueIdList},
        }
    });

    for (const market of marquesWithoutChildren) {
        await extendMarketWithChildrenRecursive(req, market);
        console.log(`ALL created children list for ${market.name} (${market._doc})`,
            `(${marquesWithoutChildren.indexOf(market) + 1} of ${marquesWithoutChildren.length})`);

    }
}

export async function extendExistingMarketListWithoutChildrenByDepth(req: Request,
                                                                     params: ExtendExistingMarketListParams) {
    const {
      source = ['chat-gpt', 'classic-trader.com', 'classic.com'],
      depth = 1,
      startFromIndex = 0,
      startFromId,
    } = params;


    const marketsWithoutChildren = await getMarketsWithoutChildrenByDepth(req, depth);

    const filteredMarketsWithoutChildren = marketsWithoutChildren.filter(m => source.includes(m.source));

    const startIndex = startFromId ? Math.max(marketsWithoutChildren.findIndex(i => i._doc === startFromId), 0) :
      startFromIndex;

    const filteredAndSlicedMarketsWithoutChildren = filteredMarketsWithoutChildren.slice(startIndex);

    for (const market of filteredAndSlicedMarketsWithoutChildren) {
        try {
            await extendExistingMarketWithChildren(req, market);
        } catch (e) {
            console.log('Failed to extend market', market.name, `(${market._doc})`, e);
        }

        console.log(`processed ${filteredMarketsWithoutChildren.indexOf(market) + 1} of ${filteredMarketsWithoutChildren.length} ${market.name} (${market._doc})`);
    }
}


async function extendExistingMarketWithChildren(req: Request, market: Market) {
    const {fullName, name, path, type} = market;

    const marqueMarket = await dataCrudService.querySingleNode(req, collectionName, {
        query: {
            _id: new ObjectId(path[0]?.id),
            _fields: {_id: 1, marketTypes: 1, name: 1},
        },
    });

    if (!marqueMarket?.marketTypes?.length) {
        return [];
    }

    const marketTypeIndexFromMarketTypes = marqueMarket.marketTypes.indexOf(type);

    const nestedMarketType = marqueMarket.marketTypes[marketTypeIndexFromMarketTypes + 1];

    if (!nestedMarketType) {
        return [];
    }

    const completionMessage = prepareCompletionMessage(fullName, nestedMarketType);

    const response = await chatGptHelper.createCompletion(completionMessage, 'gpt-4o');

    if (response === 'none') {
        return [];
    }

    let parsedResponse: string[];

    try {
        parsedResponse = JSON.parse(response);
    } catch (e) {
        console.error('Failed to parse response for', fullName, `(${market._id})`, e);

        return [];
    }

    if (!parsedResponse.length) {
        return [];
    }

    if (parsedResponse.length === 1) {
        return [];
    }

    const nodeToCreateList = parsedResponse.map(nestedMarketName => prepareNestedMarketNode(market, {
        name: nestedMarketName,
        fullName: [...(new Set([...fullName.split(' '), ...nestedMarketName.split(' ')]))].join(' '),
        type: nestedMarketType
    }));

    const createdNodeList = [];

    for (const nodeToCreate of nodeToCreateList) {
        const existingNode = await dataCrudService.querySingleNode(req, collectionName, {
            query: {
                fullName: nodeToCreate.fullName,
            },
        });

        if (existingNode) {
            continue;
        }

        const node = await dataCrudService.createNode(req, collectionName, nodeToCreate, {ignoreIDSet: true});

        createdNodeList.push(node);
    }

    return createdNodeList;
}



async function extendMarketWithChildrenRecursive(req: Request, market: Market) {
    const {fullName, name, path, type} = market;

    const marqueMarket = await dataCrudService.querySingleNode(req, collectionName, {
        query: {
            _id: new ObjectId(path[0]?.id),
            _fields: {_id: 1, marketTypes: 1, name: 1},
        },
    });

    const marketTypeIndexFromMarketTypes = marqueMarket.marketTypes.indexOf(type);

    const nestedMarketTypes = marqueMarket.marketTypes.slice(marketTypeIndexFromMarketTypes + 1);

    if (!nestedMarketTypes.length) {
        return;
    }

    for (const marketType of nestedMarketTypes) {
        const marketTypeName = (marketType.endsWith('s') ? marketType : `${marketType}s`).toLowerCase();

        const requestNestedMarketItems = [
            prepareCompletionMessage(fullName, marketType),
            `Probably there are some extra ${marketTypeName} of ${fullName}. Please double check no ${marketTypeName} overlooked.`,
        ];

        const response = await chatGptHelper.createCompletion(requestNestedMarketItems, 'gpt-4o');

        if (response === 'none') {
            continue;
        }

        let parsedResponse;

        try {
            parsedResponse = JSON.parse(response);
        } catch (e) {
            console.error('Failed to parse response for', fullName, `(${market._id})`, e);

            return;
        }

        if (!parsedResponse.length) {
            continue;
        }

        if (parsedResponse.length === 1) {
            continue;
        }

        console.log(`parsedResponse for ${marqueMarket.name}`, JSON.stringify(parsedResponse));

        for (const nestedMarketName of parsedResponse) {
            const fullName = market.path.map(p => p.name).concat([nestedMarketName]).join(' ');
            const nestedMarketNode = await createNestedMarketNode(req, market, {
                name: nestedMarketName,
                fullName,
                type: marketType
            });

            console.log(`created ${nestedMarketName.name} (${nestedMarketNode._id}) for ${marqueMarket.name} (${marqueMarket._id})`);
            await extendMarketWithChildrenRecursive(req, nestedMarketNode);
        }

        return;
    }
}


function prepareNestedMarketNode(parentMarket: Market,
                                 marketDetails: Pick<Market, 'name' | 'fullName' | 'type'>) {
    const {name, fullName, type} = marketDetails;

    const id = nodeSystemDataHelper.getUniqueID();

    const parentPath = JSON.parse(JSON.stringify(parentMarket.path));

    const slug = name.toLowerCase().replace(' ', '-');

    return {
        _id: id,
        title: fullName,
        fullName,
        name,
        type,
        source: 'chat-gpt',
        years: [],
        path: [
            ...parentPath,
            {
                name: name,
                slug: slug,
                id: id,
            },
        ],
        metadata: {
            slugToken: slug,
            parentSlugPath: parentPath.map(p => p.slug),
            parentSlugPathReverse: parentPath.map(p => p.slug).reverse(),
            parentMarketId: parentMarket._id,
        },
        isActive: true,
    };
}


async function createNestedMarketNode(req: Request,
                                      parentMarket: Market,
                                      marketDetails: Pick<Market, 'name' | 'fullName' | 'type'>): Promise<Market> {
    const node = prepareNestedMarketNode(parentMarket, marketDetails);

    return await dataCrudService.createNode(req, collectionName, node, {ignoreIDSet: true});
}


export async function checkMarquesWithoutChildren(req: Request) {
    const marqueList = await dataCrudService.queryNodes(req, collectionName, {
        query: {
            type: 'Marque',
        },
    });

    const marqueListWithoutChildren = [];

    for (const marque of marqueList) {
        const children = await dataCrudService.querySingleNode(req, collectionName, {
            query: {
                'metadata.parentMarketId': marque._id,
                _fields: {_id: 1},
            },
        });

        if (children) {
            continue;
        }

        marqueListWithoutChildren.push(marque);
    }

    return marqueListWithoutChildren;
}

async function getMarketsWithoutChildrenByDepth(req: Request, depth: number) {
    const marketList = await dataCrudService.queryNodes(req, collectionName, {
        query: {
            path: {$size: depth},
        },
    });

    const marketIdList = marketList.map(m => m._id);

    const childrenList = await dataCrudService.queryNodes(req, collectionName, {
        query: {
            'metadata.parentMarketId': {$in: marketIdList},
            _fields: {_id: 1, 'metadata.parentMarketId': 1},
        },
    });

    const marketWithChildrenList = childrenList.map(c => c.metadata.parentMarketId);

    return marketList.filter(m => !marketWithChildrenList.includes(m._id));
}


function prepareCompletionMessage(marketFullName: string, nestedMarketType: string) {
    const marketTypeDescriptionMap = {
        "Marque": "The primary brand identifier, such as Ferrari, BMW, or Ford.",
        "Sub-brand": "Performance or luxury-focused divisions within a marque.",
        "Lineage": "Historical or thematic lines within the marque.",
        "Series": "A family of related models within a lineage.",
        "Model": "The specific vehicle designation within a series.",
        "Body Style": "The vehicle's physical configuration.",
        "Trim": "Indicates both regular and performance trims, specifying luxury or feature levels.",
        "Edition": "Special or limited versions of a model.",
        "Variant": "Specific configurations or performance versions.",
        "Engine": "Specifies engine types or capacities.",
        "Generation": "Indicates major updates or redesigns.",
        "Powertrain": "Denotes drivetrain specifics.",
        "Fuel": "Indicates the fuel type."
    };

    const listOfOtherMarketTypes = Object.keys(marketTypeDescriptionMap)
        .filter(t => t !== nestedMarketType);


    const marketType = nestedMarketType.endsWith('s') ? nestedMarketType : `${nestedMarketType}s`;

     const updatedMessageParts = [
         'I\'m working on the DB of the car markets. I need your help to extend the existing marques with their vehicles.',
         '',
           `I want you to provide an exhaustive list of ALL ${marketFullName} ${marketType}.`,
         `Here's our definition of the "${nestedMarketType}": ${marketTypeDescriptionMap[nestedMarketType]}`,
         '',
           `To ensure your list is complete and exhaustive, consider all historic vehicles,  particularly those with historical significance, niche appeal, or collector interest.`,
           '',
           `Only include ${marketFullName} ${marketType} in your list as we query for more specific details later.`,
           '',
           `Cross-reference multiple trustworthy sources, including but not limited to official marque websites, reputable car collectors platforms, and classic vehicle databases, such as Hagerty.`,
           '',
         `If there are no ${marketFullName} ${marketType} of note then return 'none' - ` +
         ` Otherwise return a your result as a simple array of names in JSON so they can be added to the database.`,
         '',
         `Ensure that you differentiate between ${marketType} and other categories. ` +
         `If the body styles are the same across variations, group them together and provide a single entry.`,
         '',
         `Please double check your list for accuracy and completeness. ` +
         `It should contain existing ${marketType} of the ${marketFullName} ONLY.`,
         `Exclude any fictional or speculative entries.`,
         ``,
         `Please also make sure you provide ${nestedMarketType} name NOT full vehicle name.`,
         '',
         `Return your result as a simple array of ${nestedMarketType} names in JSON so they can be added to the database.`,
         `IMPORTANT - Return the result as plain JSON array WITHOUT any formatting tags (e.g., no code blocks or additional text).`
     ];


    return updatedMessageParts.join('\n');
}
