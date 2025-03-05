import {coreServiceLocator} from '../../serviceLocator';
import {IDataCrud} from '../../db';
import {ChatGptHelper} from '../../utils';


const chatGptHelper = coreServiceLocator.get<ChatGptHelper>('chatGptHelper');
const dataCrudService = coreServiceLocator.get<IDataCrud>('dataCrudService');

const collectionName = 'markets';


export async function processGetMarketStructure(req: Request) {
    const getMarketMessageWithInfoList = (await prepareGetMarketStructureArrayBatchRequestContentList(req));

    for (const messageWithInfo of getMarketMessageWithInfoList) {
        const {name, message} = messageWithInfo;
        const response = await chatGptHelper.createCompletion(message, 'gpt-4o');

        let marketTypes;

        try {
            marketTypes = JSON.parse(response);
        } catch (e) {
            console.log(response);
            marketTypes = null;
        }

        if (!marketTypes || !Array.isArray(marketTypes)) {
            console.error('Failed to parse response:', response);
            continue;
        }

        const market = await dataCrudService.querySingleNode(req, collectionName, {query: {fullName: name}});

        await dataCrudService.updateNode(req, collectionName, {...market, marketTypes});
        console.log(`processed ${getMarketMessageWithInfoList.indexOf(messageWithInfo) + 1} of ${getMarketMessageWithInfoList.length}`);
    }

}


export async function prepareGetMarketStructureArrayBatchRequestContentList(req: Request) {
    const marqueNodeList = await dataCrudService.queryNodes(req, collectionName, {
        query: {
            "type": "Marque",
            _fields: {fullName: 1},
        },
    });

    const marqueNames = marqueNodeList.map(i => i.fullName);

    return marqueNames
        .map(marqueName => ({name: marqueName, message: prepareGetMarketStructureArrayBatchRequestContent(marqueName)}));
}


function prepareGetMarketStructureArrayBatchRequestContent(marqueName: string) {
    const messageParts = [
        `Given the vehicle marque - "${marqueName}", please provide an ordered array of vehicle category types that ` +
        `accurately reflects how this marque categorises its vehicles (in most cases).`,
        ``,
        `This array should be based on the following categories enum (please ignore sorting of the enum items):`,
        `["Marque", "Sub-brand", "Lineage", "Series", "Model", "Generation", "Body Style", "Trim", ` +
        `"Edition", "Variant", "Engine", "Powertrain", "Fuel"]`,
        '',
        `The array should represent the typical hierarchy for this marque, ` +
        `accounting for historical models and any changes in naming conventions over time. ` +
        `Please reference reliable sources, such as classic car databases, enthusiast websites, ` +
        `and valuation guides like Hagerty, to ensure the accuracy and comprehensiveness of the information.`,
        'IMPORTANT - Please leave "Sub-brand" category if case if marque has at least one sub-brand and it isn\'t standalone marque ' +
        '(EG - if the marque has sub-brand for high-performance vehicle (for example - Abarth for Fiat); ' +
        'but Acura should be recognized as standalone marque - it\'s not just Honda sub-brand). Please double check this.',

        `IMPORTANT - Please make sure categories in the array are ordered based on typical hierarchy of "${marqueName}" marque.`,
        '',
        `IMPORTANT - Return the result as plain JSON array WITHOUT any formatting tags (e.g., no code blocks or additional text).`
    ];

    return messageParts.join('\n');
}
