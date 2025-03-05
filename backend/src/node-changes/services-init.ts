import { coreServiceLocator } from '../serviceLocator';


export async function initNodeChangesServices() {

    const dataCrudService = coreServiceLocator.get('dataCrudService');
    const dateHelper = coreServiceLocator.get('dateHelper');
    const privateSettings = coreServiceLocator.get('privateSettings');
    const loggingHelper = coreServiceLocator.get('loggingHelper');

    const {NodeChangeTaskExecutorInvoker} = await import('./index');
    const nodeChangeTaskExecutorInvoker = new NodeChangeTaskExecutorInvoker(
        privateSettings.SERVER_URL, privateSettings.SCHEDULER
    );
    coreServiceLocator.register('nodeChangeTaskExecutorInvoker', nodeChangeTaskExecutorInvoker);

    const {NodeChangeTaskCrud} = await import('./index');
    const nodeChangeTaskCrud = new NodeChangeTaskCrud(dataCrudService, dateHelper);
    coreServiceLocator.register('nodeChangeTaskCrud', nodeChangeTaskCrud);


    const {NodeChangesObserver} = await import('./index');
    const nodeChangesObserver = new NodeChangesObserver(
        nodeChangeTaskExecutorInvoker,
        nodeChangeTaskCrud);
    coreServiceLocator.register('nodeChangesObserver', nodeChangesObserver);


    const {NodeChangeTasksExecutor} = await import('./index');
    const nodeChangeTasksExecutor = new NodeChangeTasksExecutor(
        nodeChangeTaskExecutorInvoker, nodeChangeTaskCrud, dateHelper, loggingHelper);
    coreServiceLocator.register('nodeChangeTasksExecutor', nodeChangeTasksExecutor);
}
