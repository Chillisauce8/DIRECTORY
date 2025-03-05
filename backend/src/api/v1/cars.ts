import {wrapDefaultDataResponse} from '../../utils';
import {coreServiceLocator} from '../../serviceLocator';
import {ListingsHelper} from '../../data-helpers/listings-helper';
import {NodeChangeTaskCrud, NodeChangeTaskExecutorInvoker} from '../../node-changes';
import {DateHelper} from 'x-utils';
import {IDataCrud} from '../../db';


const listingHelper: ListingsHelper = coreServiceLocator.get('listingsHelper');
const nodeChangeTaskCrud = coreServiceLocator.get<NodeChangeTaskCrud>('nodeChangeTaskCrud');
const dataCrudService = coreServiceLocator.get<IDataCrud>('dataCrudService');
const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
const nodeChangeTaskExecutorInvoker = coreServiceLocator.get<NodeChangeTaskExecutorInvoker>('nodeChangeTaskExecutorInvoker');
const dateHelper = new DateHelper();



const handeGetCarsOrganisationsForSalePages = (req: Request, res) => {
  wrapDefaultDataResponse(res, listingHelper.getOrganisationForSaleInfo(req));
};


const handleCreateOrUpdateListingData = (req: Request, res) => {
  const data: any = req.body;

  wrapDefaultDataResponse(res, listingHelper.createOrUpdateListingData(req, data));
};


const handleCheckListingDataExists = (req: Request, res) => {
  const url = req['query'].url;

  wrapDefaultDataResponse(req, listingHelper.checkListingDataExists(req, url));
};


const handleCheckListingDataShouldBeProcessedByChatGPTByUrlList = (req: Request, res) => {
  const urlList: any = req.body;

  wrapDefaultDataResponse(res, listingHelper.checkListingDataShouldBeProcessedByChatGPTByUrlList(req, urlList));
};


const handleCheckListingsDataShouldBeProcessedByChatGPT = (req: Request, res) => {
  const data: any = req.body;

  wrapDefaultDataResponse(res, listingHelper.checkListingsDataShouldBeProcessedByChatGPT(req, data));
};


const handleCreateOrUpdateListingFromPageJSON = (req: Request, res) => {
  const data: any = req.body;

  wrapDefaultDataResponse(res, listingHelper.createOrUpdateListingContentFromPageJSON(req, data));
}


const handleCreateListingDataImportTask = async (req: Request, res) => {
  const datasetId = req.body?.['datasetId'];

  if (!datasetId) {
    return;
  }

  await nodeChangeTaskCrud.createTask(req, {
    type: 'listingDataImport',
    nodeId: datasetId,
    dateTime: dateHelper.saveDateTimeFormat(new Date()),
  });

  wrapDefaultDataResponse(res, nodeChangeTaskExecutorInvoker.invokeAsync(req));
};


const handleCheckListingDataProcessingInProgress = async (req: Request, res) => {
  const query = {
    'type': {'$in': ['listingDataPageUpdate', 'listingDataImport']},
  };

  const taskToImportOrProcessListing = await dataCrudService.querySingleNode(req,
      STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name, {query});

  wrapDefaultDataResponse(res, Promise.resolve(!!taskToImportOrProcessListing));
};


module.exports = function(app, callback) {
  app.get('/api/organisations/forSalePages', handeGetCarsOrganisationsForSalePages);
  app.post('/api/listingData/createOrUpdate', handleCreateOrUpdateListingData);
  app.get('/api/listingData/checkExists', handleCheckListingDataExists);
  app.post('/api/listingData/checkNeedToProcessUrlList',
    handleCheckListingDataShouldBeProcessedByChatGPTByUrlList);
  app.post('/api/listingData/checkNeedToListingData',
    handleCheckListingsDataShouldBeProcessedByChatGPT);
  app.post('/api/listing/createOrUpdate',
    handleCreateOrUpdateListingFromPageJSON);
  app.post('/api/listingData/importTask',
    handleCreateListingDataImportTask);
  app.get('/api/listingData/processingProgress',
    handleCheckListingDataProcessingInProgress);
}
