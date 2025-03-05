import { coreServiceLocator } from '../../serviceLocator';


export async function initGridView() {

    const requestHelper = coreServiceLocator.get('requestHelper');
    const dataCrudService = coreServiceLocator.get('dataCrudService');

    const { AgGridCommsManagement } = await import('./agGridCommsManagement');
    const agGridCommsManagement = new AgGridCommsManagement(requestHelper, dataCrudService);
    coreServiceLocator.register('agGridCommsManagement', agGridCommsManagement);

    const { AgGridContentManagement } = await import('./agGridContentManagement');
    const agGridContentManagement = new AgGridContentManagement(dataCrudService, requestHelper);
    coreServiceLocator.register('agGridContentManagement', agGridContentManagement);

    const { AgGridReviewsManagement } = await import('./agGridReviewsManagement');
    const agGridReviewsManagement = new AgGridReviewsManagement(dataCrudService, requestHelper);
    coreServiceLocator.register('agGridReviewsManagement', agGridReviewsManagement);
}
