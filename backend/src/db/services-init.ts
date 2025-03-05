import { coreServiceLocator } from '../serviceLocator';
import { historyStateHelperFactory } from './history-state';


export async function initCrudServices() {

    const dateHelper = coreServiceLocator.get('dateHelper');
    const requestHelper = coreServiceLocator.get('requestHelper');
    const loggingHelper = coreServiceLocator.get('loggingHelper');
    const privateSettings = coreServiceLocator.get('privateSettings');
    const cacheHelper = coreServiceLocator.get('cacheHelper');
    const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');

    const { ValidationSchemaGenerator } = await import('./schema-converter');
    const validationSchemaGenerator = new ValidationSchemaGenerator();

    const { AssociationTasksExecutorInvoker } = await import('./associations/asociationTasksExecutorInvoker');
    const associationTasksExecutorInvoker = new AssociationTasksExecutorInvoker();
    coreServiceLocator.register('associationTasksExecutorInvoker', associationTasksExecutorInvoker);

    const {MongoCrudClient} = await import('./mongo/client');
    const mongoCrud = new MongoCrudClient();
    coreServiceLocator.register('mongoCrud', mongoCrud);

    const { CollectionCrud } = await import('./collection-crud');
    const collectionCrud = new CollectionCrud(mongoCrud);
    coreServiceLocator.register('collectionCrud', collectionCrud);

    const { BaseDataCrud } = await import('./base-data-crud');
    const baseDataCrud = new BaseDataCrud(
      mongoCrud, historyStateHelperFactory(false),
      dateHelper,
      cacheHelper,
      privateSettings.CACHE.defaultNodesTimeout, STANDARD_COLLECTIONS_DESCRIPTION);
    coreServiceLocator.register('dataCrudService', baseDataCrud);

    const { AssociationsHelper } = await import('./associations/associationsHelper');
    const associationsHelper = new AssociationsHelper();
    coreServiceLocator.register('associationsHelper', associationsHelper);

    const { AssociationTasksCrud } = await import('./associations/associationTasksCrud');
    const associationTasksCrud = new AssociationTasksCrud(mongoCrud);
    coreServiceLocator.register('associationTasksCrud', associationTasksCrud);

    const { AssociationCrud } = await import('./associations/associationCrud');
    const associationCrud = new AssociationCrud(associationsHelper, mongoCrud);
    coreServiceLocator.register('associationCrud', associationCrud);

    const { AssociationTasksCreator } = await import('./associations/associationTasksCreator');
    const associationTasksCreator = new AssociationTasksCreator(associationTasksCrud, associationsHelper,
        associationCrud);
    coreServiceLocator.register('associationTasksCreator', associationTasksCreator);

    const {DefinitionCrud} = await import('./definition-crud');
    const definitionCrud = new DefinitionCrud(baseDataCrud, collectionCrud,
        validationSchemaGenerator, associationsHelper, associationTasksCreator,
        associationTasksExecutorInvoker, associationCrud);
    coreServiceLocator.register('definitionCrud', definitionCrud);

    const { AssociationTasksChecker } = await import('./associations/associationTasksChecker');
    const associationTasksChecker = new AssociationTasksChecker(definitionCrud,
        associationCrud, associationsHelper, mongoCrud);
    coreServiceLocator.register('associationTasksChecker', associationTasksChecker);

    const {DbLoggingHelper} = await import('./db-logging-helper');
    const dbLogger = new DbLoggingHelper(dateHelper, baseDataCrud, loggingHelper);
    coreServiceLocator.register('dbLogger', dbLogger);

    const { AssociationTasksExecutor } = await import('./associations/associationTasksExecutor');
    const associationTasksExecutor = new AssociationTasksExecutor(
        associationCrud,
        associationTasksCreator,
        associationTasksChecker,
        associationTasksCrud,
        associationsHelper,
        baseDataCrud,
        definitionCrud,
        associationTasksExecutorInvoker);
    coreServiceLocator.register('associationTasksExecutor', associationTasksExecutor);

    const {DataCrudWithRelators} = await import('./data-crud-with-relators');
    const dataCrudServiceWithRelators = new DataCrudWithRelators(
        mongoCrud,
        historyStateHelperFactory(false),
        dateHelper,
        cacheHelper,
        privateSettings.CACHE.defaultNodesTimeout,
        STANDARD_COLLECTIONS_DESCRIPTION,
        associationsHelper,
        associationTasksCreator,
        associationCrud,
        associationTasksExecutorInvoker);
    coreServiceLocator.register('dataCrudServiceWithRelators', dataCrudServiceWithRelators);

    const {DataCrudWithRelatorsEventsExecutor} = await import('./data-crud-with-relators-events-executor');
    const dataCrudWithRelatorsEventsExecutor = new DataCrudWithRelatorsEventsExecutor(
      associationTasksCreator, associationsHelper, associationCrud, baseDataCrud);
    coreServiceLocator.register('dataCrudWithRelatorsEventsExecutor', dataCrudWithRelatorsEventsExecutor);

    const { RawDataHelper } = await import('./raw-data-helper');
    const rawDataHelper = new RawDataHelper(dataCrudServiceWithRelators,
        requestHelper, definitionCrud, associationCrud, associationTasksCrud,
        STANDARD_COLLECTIONS_DESCRIPTION);
    coreServiceLocator.register('rawDataHelper', rawDataHelper);

    const { ClearDiffCollectionsHelper } = await import('./clear-diff-collections-helper');
    const clearDiffCollectionsHelper = new ClearDiffCollectionsHelper(dataCrudServiceWithRelators, dateHelper);
    coreServiceLocator.register('clearDiffCollectionsHelper', clearDiffCollectionsHelper);

    const { RelatorsManagement } = await import('./relators-management');
    const relatorsManagement = new RelatorsManagement(baseDataCrud, definitionCrud,
        loggingHelper, cacheHelper);
    coreServiceLocator.register('relatorsManagement', relatorsManagement);
}
