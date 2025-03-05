// import * as _ from 'lodash';
// import {TaskState} from "x-server-comms-processing";
// import {coreServiceLocator, dataCrudService, IQueryParams, MomentHelper, requestHelper} from 'x-server-core';
// import {agGridHelper} from "x-server-events-processing";
//
//
// const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.getService('STANDARD_COLLECTIONS_DESCRIPTION');
//
//
// const TASKS_GRID_FIELDS = {
//     _doc: 1,
//     type: 1,
//     state: 1,
//     name: 1,
//     notes: 1,
//     dueDate: 1,
//     dueTime: 1,
//     history: 1,
//     event: 1,
//     product: 1,
//     itineraryId: 1,
//     supplier: 1,
//     customer: 1,
//     company: 1,
// };
//
//
// export class AgGridTasksManagement {
//     private momentHelper = new MomentHelper();
//
//     async getTasksForGrid(req): Promise<any> {
//         const pagination = requestHelper.parseRequestPaginationParams(req);
//         const options = {readFromCache: false, updateCache: false};
//
//         const query: any = requestHelper.parseRequestFiltrationParams(req);
//
//         query._fields = TASKS_GRID_FIELDS;
//
//         const queryParams: IQueryParams = {query, pagination};
//
//         const taskList = await dataCrudService.queryNodes(req, STANDARD_COLLECTIONS_DESCRIPTION.tasks.name, queryParams, options);
//
//         return this._prepareTaskList(req, query, taskList);
//     }
//
//     private _prepareTaskList(req, query, taskList: any[]): any[] {
//         if (!taskList || !taskList.length) {
//             return [];
//         }
//
//         const completed = this._getCompletedFilterValue(query);
//
//         taskList.forEach(task => {
//             if (task.event?.id) {
//                 task.eventId = task.event.id;
//             }
//
//             if (task.product?.id) {
//                 task.productId = task.product.id;
//             }
//
//             if (task.customer?.id) {
//                 task.customerId = task.customer.id;
//             }
//
//             if (task.supplier?.id) {
//                 task.supplierId = task.supplier.id;
//             }
//
//             if (task.company?.id) {
//                 task.companyId = task.company.id;
//             }
//
//             if (completed === 'Yes') {
//                 this._prepareDoneBy(task);
//             }
//         });
//
//         return this._filterTaskListByDate(req, taskList);
//     }
//
//     private _filterTaskListByDate(req, taskList: any[]): any[] {
//         if (!taskList || !taskList.length) {
//             return [];
//         }
//
//         const filterDateFunction = agGridHelper.getFilterDateFunction(req, 'filterDate');
//         const filterDateTimeFunction = agGridHelper.getFilterDateFunction(req, 'filterDateTime');
//
//         if (!filterDateFunction || !filterDateTimeFunction) {
//             return taskList;
//         }
//
//         return taskList.filter(task => {
//             if (!task.dueDate) {
//                 return false;
//             }
//
//             return task.dueDate.length > 10 ? filterDateTimeFunction(task.dueDate) : filterDateFunction(task.dueDate);
//         });
//     }
//
//     private _getCompletedFilterValue(query): string {
//         let stateFilterValue;
//
//         if (query.hasOwnProperty('$and') && query['$and'].length > 0) {
//             const stateFilter = _.find(query['$and'], item => item.hasOwnProperty('state'));
//             stateFilterValue = _.get(stateFilter, 'state');
//         } else {
//             stateFilterValue = _.get(query, 'state');
//         }
//
//         return _.isEqual(stateFilterValue, {$ne: TaskState.active}) ? 'Yes' : 'No';
//     }
//
//     private _prepareDoneBy(task) {
//         const history = _.get(task, 'history');
//
//         if (!history || !history.length) {
//             return;
//         }
//
//         for (let i = history.length - 1; i > -1; i--) {
//             const historyItem = history[i];
//
//             if (historyItem && historyItem.state === task.state) {
//                 task.doneBy = historyItem.doneBy;
//                 delete task.history;
//                 return;
//             }
//         }
//     }
//
//     private _prepareDueDateTime(task) {
//         if (!task.dueTime) {
//             return;
//         }
//
//         const dateTimeObj = this.momentHelper.parseDateTimeFields(task.dueDate, task.dueTime);
//         const saveDateTimeUTC = this.momentHelper.saveDateTimeFormatUTC(dateTimeObj);
//
//         if (task.dueDate) {
//             task.dueDate = saveDateTimeUTC;
//         }
//
//         task.dueTime = saveDateTimeUTC;
//     }
// }
//
//
// const agGridTasksManagement = new AgGridTasksManagement();
//
// export default agGridTasksManagement;
