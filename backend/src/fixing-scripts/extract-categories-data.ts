import { coreServiceLocator } from '../serviceLocator';
import fs from 'fs';


const dataCrudService = coreServiceLocator.get('dataCrudServiceWithRelators');


export async function extractCategoriesData(req) {
    const categories = await dataCrudService.queryAllAvailableNodes(req,
        'categories', {query: {
                "general.categories.0": {$exists: true},
                _fields: {"general.categories": 1, _doc: 1}
            }}
    );

    fs.writeFileSync('categories-data.json', JSON.stringify(categories, null, 2), 'utf8');
}
