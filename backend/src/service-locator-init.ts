import {DateHelper} from 'x-utils';
import { coreServiceLocator } from './serviceLocator';
import { initCrudServices } from './db/services-init';
import { initAuthServices } from './auth/services-init';
import { initNodeChangesServices } from './node-changes/services-init';
import { initFilesServices } from './files/services-init';
import { initGridView } from './grid/grid-view-crud/services-init';
import { importGridCrudServices } from './grid/grid-crud/init-services';
import { initRedisLock } from './utils/lockHelper';
import { initUtilsServices } from './utils/services-init';
import { initCacheServices } from './cache/services-init';
import { initDataHelpersServices } from './data-helpers/services-init';


const privateSettings = require('../privateSettings');


export async function initCoreServiceLocator() {
    coreServiceLocator.register('privateSettings', privateSettings);

    const {STANDARD_COLLECTIONS_DESCRIPTION} = await import('./collectionNames');
    coreServiceLocator.register('STANDARD_COLLECTIONS_DESCRIPTION', STANDARD_COLLECTIONS_DESCRIPTION);

    const dateHelper = new DateHelper();
    coreServiceLocator.register('dateHelper', dateHelper);

    await initCacheServices();
    await initUtilsServices();
    await initCrudServices();

    await initDataHelpersServices();

    await initAuthServices();

    await initFilesServices();

    await initGridView();
    await importGridCrudServices();

    await initNodeChangesServices();

    console.log('Services initialization done');
}

