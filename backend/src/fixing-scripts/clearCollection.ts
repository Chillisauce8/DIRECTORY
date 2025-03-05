import { coreServiceLocator } from '../serviceLocator';


const dataCrudService = coreServiceLocator.get('dataCrudService');


export async function clearCollection(req) {
    const query = {
        "password": {$exists: true}
    };

    await dataCrudService.deleteNodes(req, 'staffs', {query});
}
