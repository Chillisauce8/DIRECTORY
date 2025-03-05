import { coreServiceLocator } from '../serviceLocator';


export async function initFilesServices() {

    console.log('initFilesServices');

    const dataCrudService = coreServiceLocator.get('dataCrudService');
    const requestHelper = coreServiceLocator.get('requestHelper');
    const loggingHelper = coreServiceLocator.get('loggingHelper');
    const permissionsHelper = coreServiceLocator.get('permissionsHelper');

    const {FilesManagement} = await import('./filesManagement');
    const filesManagement = new FilesManagement(dataCrudService, requestHelper, loggingHelper);
    coreServiceLocator.register('filesManagement', filesManagement);

    // const { staticFileCacheHelperFactory } = await import('./staticFileCacheHelper');
    // const staticFileCacheHelper = staticFileCacheHelperFactory(cacheHelper, appFolderHelper, requestHelper);
    // coreServiceLocator.register('staticFileCacheHelper', staticFileCacheHelper);
}
