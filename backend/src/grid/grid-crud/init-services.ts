import { coreServiceLocator } from '../../serviceLocator';


export async function importGridCrudServices() {
    const dataCrudServiceWithRelators = coreServiceLocator.get('dataCrudServiceWithRelators');
    const dataCrudService = coreServiceLocator.get('dataCrudService');
    const requestHelper = coreServiceLocator.get('requestHelper');
    const definitionCrud = coreServiceLocator.get('definitionCrud');

    const { FormCrud } = await import('./formCrud');
    const formCrud = new FormCrud(dataCrudServiceWithRelators);
    coreServiceLocator.register('formCrud', formCrud);

    const { GridByDefinitionCrud } = await import('./gridByDefinitionCrud');
    const gridByDefinitionCrud = new GridByDefinitionCrud(dataCrudService, requestHelper, definitionCrud);
    coreServiceLocator.register('gridByDefinitionCrud', gridByDefinitionCrud);

    const { GridsCrud } = await import('./gridsCrud');
    const gridsCrud = new GridsCrud(dataCrudService);
    coreServiceLocator.register('gridsCrud', gridsCrud);

    const {GridByGridsItemCrud} = await import('./gridByGridsItemCrud');
    const gridByGridsItemCrud = new GridByGridsItemCrud(dataCrudService, requestHelper, gridsCrud);
    coreServiceLocator.register('gridByGridsItemCrud', gridByGridsItemCrud);

    const { GridViewsCrud } = await import('./gridViewsCrud');
    const gridViewsCrud = new GridViewsCrud(dataCrudService, gridsCrud);
    coreServiceLocator.register('gridViewsCrud', gridViewsCrud);
}
