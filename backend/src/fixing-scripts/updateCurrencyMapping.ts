import { coreServiceLocator } from '../serviceLocator';


const dataCrudService = coreServiceLocator.get('dataCrudServiceWithRelators');

const CURRENCY_FIX_ID_MAP = {
    '66efd0b87a657b421ca8': '62dfa336dc80a6649ca20383', // Euro
    '7db429361fb65107fc7e': '62dfa25cdc80a6649ca2037d', // Hungarian Forint
    'db4e3073d2652015a9fe': '62dfa2e3dc80a6649ca20380', // Croatian Kuna
    'a4d55f35ed3d07bad7f7': '62dfa378dc80a6649ca20386', // US Dollar
    'ac8f81eaa4ee24678fb2': '62dfa3cddc80a6649ca20389', // Bulgaria Lev
    '324593cc28ed61281aa1': '62dfa472dc80a6649ca2038f', // Czech Republic Koruna
    '7e704e46fcf545c7ed75': '62dfa412dc80a6649ca2038c', // Polish Zloty
    'd464fe118901e3fc6b05': '62dfa083dc80a6649ca20377', // British Pound
}

export async function updateCurrencyMapping(req) {
    const suppliers = await dataCrudService.queryAllAvailableNodes(req,
        'suppliers', {query: {
            "currency.id": {$exists: true},
            "currency.name": {$exists: false},
            _fields: {"currency": 1, _doc: 1}
        }}
    );

    console.log('updateCurrencyMapping: Nodes to process:', suppliers.length);

    let i = 0;
    for (const supplier of suppliers) {
        if (i % 10 === 0) {
            console.log(i, 'processed');
        }

        // const currencyNode = await dataCrudService.readNode(req, 'currencies',
        //     {nodeId: supplier.currency.id});

        supplier.currency.id = CURRENCY_FIX_ID_MAP[supplier.currency.id];

        await dataCrudService.mergeNode(req, 'suppliers', supplier);
    }

    console.log('DOOOOOOOOONE');
}
