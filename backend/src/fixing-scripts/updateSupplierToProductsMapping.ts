import { coreServiceLocator } from '../serviceLocator';


const dataCrudService = coreServiceLocator.get('dataCrudServiceWithRelators');

export async function updateSupplierToProductsMapping(req) {
    const products = await dataCrudService.queryAllAvailableNodes(req,
        'products', {query: {
            "general.supplier": {"$exists": true},
            "general.supplier.currencyName": {"$exists": false},
            _fields: {"general": 1, _doc: 1}
        }}
    );

    console.log('updateSupplierToProductsMapping: Nodes to process:', products.length);

    let i = 0;
    for (const product of products) {
        if (i % 10 === 0) {
            console.log(i++, 'processed');
        }

        // const currencyNode = await dataCrudService.readNode(req, 'currencies',
        //     {nodeId: supplier.currency.id});

        const supplierId = product.general.supplier.id;

        product.general.supplier = {};

        await dataCrudService.mergeNode(req, 'products', product);

        product.general.supplier.id = supplierId;

        await dataCrudService.mergeNode(req, 'products', product);
    }

    console.log('DOOOOOOOOONE');
}
