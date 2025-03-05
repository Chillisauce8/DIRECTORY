// import * as _ from 'lodash';
// import {DateHelper} from "x-utils";
// import {coreServiceLocator, requestHelper} from "x-server-core";
// // import {agGridHelper} from "x-server-events-processing";
//
//
//
// const eventCommon = coreServiceLocator.getService('eventCommon');
//
//
// export class AgGridEventsManagement {
//   constructor(private dateHelper: DateHelper) {
//     //
//   }
//
//   async getEventsForEnquiriesGrid(req): Promise<any[]> {
//     const currentDate = this.dateHelper.getStartOfTheDay(new Date());
//
//     const pagination = requestHelper.parseRequestPaginationParams(req);
//     const query = requestHelper.parseRequestFiltrationParams(req);
//
//     query['_fields'] = {
//       '_doc': 1,
//       'eventSummary': 1,
//       'customerSummary.customer': 1,
//       'customerSummary.attending': 1,
//       'customerSummary.money': 1,
//       'customerSummary.role': 1,
//       'salesFunnel': 1,
//       'packageOption.location.name': 1,
//       'marketing.form': 1,
//       'comms.calls.firstCallMinutes': 1,
//       'comms.calls.enquiryCalls': 1,
//       'comms.calls.lastInboundCall': 1,
//       'comms.calls.lastOutboundCall': 1,
//       'comms.emails.lastOutboundEmail': 1,
//     };
//
//     pagination.sort = {_doc: -1};
//
//     const params = {
//       query,
//       pagination,
//       options: {readFromCache: false, updateCache: false},
//       clearSecureEventFields: true,
//     };
//
//     const events = await eventCommon.queryEvents(req, params);
//
//     this._extendEventsFieldsForEnquiriesGrid(events, currentDate);
//
//     return events;
//   }
//
//   async getEventsForBookingsGrid(req): Promise<any[]> {
//     const currentDate = this.dateHelper.getStartOfTheDay(new Date());
//
//     const pagination = requestHelper.parseRequestPaginationParams(req);
//     const query = requestHelper.parseRequestFiltrationParams(req);
//
//     query['_fields'] = {
//       '_doc': 1,
//       'eventSummary': 1,
//       'customerSummary.customer': 1,
//       'customerSummary.attending': 1,
//       'customerSummary.money': 1,
//       'customerSummary.role': 1,
//       'salesFunnel': 1,
//       'moneySummary': 1,
//       'marketing.form': 1,
//     };
//
//     pagination.sort = {_doc: -1};
//
//     const params = {
//       query,
//       pagination,
//       options: {readFromCache: false, updateCache: false},
//       clearSecureEventFields: true
//     };
//
//     const events = await eventCommon.queryEvents(req, params);
//
//     this._extendEventsFieldsForBookingsGrid(events, currentDate);
//
//     return events;
//   }
//
//   async getEventsForStatsGrid(req): Promise<any[]> {
//     const currentDate = this.dateHelper.getStartOfTheDay(new Date());
//
//     const pagination = requestHelper.parseRequestPaginationParams(req);
//     const query = requestHelper.parseRequestFiltrationParams(req);
//
//     query['_fields'] = {
//       '_doc': 1,
//       'eventSummary': 1,
//       'customerSummary.customer': 1,
//       'customerSummary.attending': 1,
//       'customerSummary.money': 1,
//       'customerSummary.role': 1,
//       'packageBooked.status': 1,
//       'packageOption.location.name': 1,
//       'moneySummary': 1,
//       'marketing.form': 1,
//       'marketing.enquirySessions.firstSession': 1,
//       'marketing.enquirySessions.sessionCount': 1,
//       'marketing.enquirySessions.mobileSessions': 1,
//       'marketing.enquirySessions.tabletSessions': 1,
//       'marketing.enquirySessions.desktopSessions': 1,
//       'comms.calls.firstCallMinutes': 1,
//       'comms.calls.enquiryCalls': 1,
//       'comms.calls.bookingCalls': 1,
//     };
//
//     pagination.sort = {_doc: -1};
//
//     const params = {
//       query,
//       pagination,
//       options: {readFromCache: false, updateCache: false},
//       clearSecureEventFields: true
//     };
//
//     const events = await eventCommon.queryEvents(req, params);
//
//     const timezoneOffsetStr = _.get(req, 'query.timezoneOffset');
//     const timezoneOffset = timezoneOffsetStr ? Number(timezoneOffsetStr) : 0;
//
//     this._extendEventsFieldsForStatsGrid(events, currentDate, currentDate.getTimezoneOffset() - timezoneOffset);
//
//     return events;
//   }
//
//   private _extendEventsFieldsForEnquiriesGrid(events: Array<any>, currentDate: Date) {
//     if (!events || !events.length) {
//       return;
//     }
//
//     events.forEach(event => {
//
//       // agGridHelper.addLastSessionField(event, currentDate);
//       // agGridHelper.addAgeField(event, currentDate);
//       // agGridHelper.addLocationNameFieldIfEnquiry(event, true);
//       // agGridHelper.addDisplayPricesNullFields(event);
//       // agGridHelper.prepareSalesFunnel(event);
//     });
//   }
//
//   private _extendEventsFieldsForBookingsGrid(events: Array<any>, currentDate: Date) {
//     if (!events || !events.length) {
//       return;
//     }
//
//     events.forEach(event => {
//
//       agGridHelper.addLastSessionField(event, currentDate);
//       agGridHelper.addDaysToEventField(event, currentDate);
//       agGridHelper.prepareSalesFunnel(event);
//
//     });
//   }
//
//   private _extendEventsFieldsForStatsGrid(events: Array<any>, currentDate: Date, timezoneOffset: number) {
//     if (!events || !events.length) {
//       return;
//     }
//
//     events.forEach(event => {
//
//       agGridHelper.addLastSessionField(event, currentDate);
//       agGridHelper.addDaysToEventField(event, currentDate);
//       agGridHelper.addLocationNameFieldIfEnquiry(event, true);
//       agGridHelper.prepareCreated(event, timezoneOffset);
//
//     });
//   }
//
//   private _filterEventListByDateIfNeed(req, eventList: any[]): any[] {
//     if (!eventList || !eventList.length) {
//       return [];
//     }
//
//     const filterDateField = _.get(req['query'], 'filterDateField');
//     const filterDateFunction = agGridHelper.getFilterDateFunction(req, 'filterDate', false);
//     const filterDateTimeFunction = agGridHelper.getFilterDateFunction(req, 'filterDateTime', true);
//
//     if (!filterDateField || !filterDateFunction || !filterDateTimeFunction) {
//       return eventList;
//     }
//
//     return eventList.filter(event => {
//       const date = _.get(event, filterDateField);
//
//       if (!date) {
//         return false;
//       }
//
//       return date.length > 10 ? filterDateTimeFunction(date) : filterDateFunction(date);
//     });
//   }
// }
//
//
// const dateHelper = new DateHelper();
// const agGridEventsManagement = new AgGridEventsManagement(dateHelper);
// export default agGridEventsManagement;
