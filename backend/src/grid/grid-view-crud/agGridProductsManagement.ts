// import * as _ from 'lodash';
// const moment = require('moment');
// import {DateHelper, roundNumberAtLeastDecimalPoints} from "x-utils";
// import {
//   coreServiceLocator,
//   dataCrudService,
//   IQueryParams,
//   locationManagement,
//   requestHelper,
//   templateManagement
// } from "x-server-core";
// // import {agGridHelper, IBookedProductsGridFilters} from "x-server-events-processing";
//
//
// const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.getService('STANDARD_COLLECTIONS_DESCRIPTION');
// const productsSearchAndGroupsManager = coreServiceLocator.getService('productsSearchAndGroupsManager');
// const eventCommon = coreServiceLocator.getService('eventCommon');
// const eventManagement = coreServiceLocator.getService('eventManagement');
//
// interface IProductStatsFilters {
//   location?: {
//     id: string;
//     name: string;
//     lat: number;
//     lng: number;
//   };
//   section?: string;
//   filterDate?: {
//     field: string;
//     from?: string;
//     to?: string;
//   };
//   filterDateFunction?: Function;
// }
//
// interface IPrepareProductStatsConfig {
//   productList: any[];
//   productStatsList: any[];
//   venueList: any[];
//   productStatsFilters: IProductStatsFilters;
// }
//
//
// export class AgGridProductsManagement {
//   constructor(private dateHelper: DateHelper) {
//     //
//   }
//
//   async getProductsForBookedProductsGrid(req, tasksOverdue: string): Promise<any[]> {
//     const processingStatisticData: any = {
//       start: moment(),
//       dataLoading: null,
//       dataProcessing: null,
//       dataUpdating: null
//     };
//
//     const currentDate = this.dateHelper.getStartOfTheDay(new Date());
//
//     const pagination = requestHelper.parseRequestPaginationParams(req);
//     const query = requestHelper.parseRequestFiltrationParams(req);
//     const filters = agGridHelper.getBookedProductsGridFilters(query, tasksOverdue);
//
//     query['_fields'] = {
//       '_doc': 1,
//       'eventSummary': 1,
//       'supplierSummary.supplier': 1,
//       'packageBooked.productList.productId': 1,
//       'packageBooked.productList.productCustom.setting.supplier.id': 1,
//       'packageBooked.productList.productCustom.setting.supplier.currencyName': 1,
//       'packageBooked.productList.productCustom.setting.supplier.currencySymbol': 1,
//       'packageBooked.productList.productCustom.setting.type': 1,
//       'packageBooked.productList.productCustom.setting.category.name': 1,
//       'packageBooked.productList.productCustom.content.supplierName': 1,
//       'packageBooked.productList.productCustom.content.name': 1,
//       'packageBooked.productList.productCustom.optionProducts.products.product.id': 1,
//       'packageBooked.productList.productCustom.optionProducts.products.product.name': 1,
//       'packageBooked.productList.productCustom.addOnProducts.id': 1,
//       'packageBooked.productList.productCustom.addOnProducts.name': 1,
//       'packageBooked.productList.itinerary': 1
//     };
//
//     pagination.sort = {_doc: -1};
//
//     const options = {readFromCache: false, updateCache: false};
//
//     const eventList = await eventCommon.queryEvents(req, {query, pagination, options, clearSecureEventFields: true});
//
//     processingStatisticData.dataLoading = moment();
//
//     const result = this._getPackageBookedProducts(eventList, currentDate, filters, false);
//
//     processingStatisticData.dataProcessing = moment();
//
//     console.log(
//       '###getProductsForBookedProductsGrid TRACKING### -',
//       `Read: ${processingStatisticData.dataLoading.diff(processingStatisticData.start)} ms`,
//       `Handle: ${processingStatisticData.dataProcessing.diff(processingStatisticData.dataLoading)} ms`
//     );
//
//     return result;
//   }
//
//   async getProductsForSupplierBookedProductsGrid(req, supplierId, tasksOverdue: string): Promise<any[]> {
//     const currentDate = this.dateHelper.getStartOfTheDay(new Date());
//
//     const query = requestHelper.parseRequestFiltrationParams(req);
//     const filters = agGridHelper.getBookedProductsGridFilters(query, tasksOverdue);
//
//     if (!supplierId) {
//       return [];
//     }
//
//     const eventList = await eventManagement.getSupplierBookedEventsForSupplierBookedProductsGrid(req, supplierId)
//
//     return this._getPackageBookedProducts(eventList, currentDate, filters, true);
//   }
//
//   async getProductsForStaffProductsGrid(req): Promise<any[]> {
//     const pagination = requestHelper.parseRequestPaginationParams(req);
//     const options = {readFromCache: false, updateCache: false};
//
//     const query: any = requestHelper.parseRequestFiltrationParams(req);
//
//     query._fields = {
//       _doc: 1,
//       'content.name': 1,
//       'content.customDescription': 1,
//       'kit': 1,
//       'setting.type': 1,
//       'setting.section': 1,
//       'setting.category.name': 1,
//       'setting.supplier.id': 1,
//       'setting.supplier.name': 1,
//       'locations.venues': 1,
//       'reviews': 1,
//       '_system.created_on.iso_8601': 1,
//       'created': 1,
//       'lastEdited': 1,
//       'lastUpdated': 1,
//     };
//
//     pagination.sort = {_doc: -1};
//
//     const queryParams: IQueryParams = {query, pagination};
//
//     let productList = await dataCrudService.queryNodes(req, STANDARD_COLLECTIONS_DESCRIPTION.product.name, queryParams, options);
//
//     const productStatsFilters = await this._getProductStatsFilters(req);
//
//     productList = await this._filterProductListByLocation(req, productList, productStatsFilters.location);
//
//     const productIdList = productList && productList.length > 0 ?
//       productList.map(item => item._doc) : [];
//
//     const productStatsQuery: IQueryParams = {
//       query: {
//         productId: {$in: productIdList},
//         _fields: {
//           'productId': 1,
//           'bookings.fullList': 1,
//           'quotes.fullList': 1,
//         }
//       }
//     };
//
//     const productStatsList = await dataCrudService.queryAllAvailableNodes(req,
//      STANDARD_COLLECTIONS_DESCRIPTION.venue.name,
//         productStatsQuery, options);
//
//     const venueListQuery: IQueryParams = {
//       query: {
//         _fields: {_doc: 1, 'setting.supplier.id': 1}
//       }
//     };
//
//     const venueList = await dataCrudService.queryAllAvailableNodes(req,
//         STANDARD_COLLECTIONS_DESCRIPTION.venue, venueListQuery, options);
//
//     return this._prepareProductsForStaffProductsGrid(req, {productList, productStatsList, venueList, productStatsFilters});
//   }
//
//   private async _prepareProductsForStaffProductsGrid(req, config: IPrepareProductStatsConfig): Promise<any[]> {
//     if (!config.productList || !config.productList.length) {
//       return [];
//     }
//
//     return config.productList.map(product => {
//       const productStats = this._prepareProductStats(product, config.productStatsList, config.productStatsFilters);
//
//       this._prepareTopVenuesList(product, config.venueList);
//       this._prepareKitCount(product);
//       this._calculateReviews(product);
//       this._prepareCreated(product);
//       this._prepareLastEdited(product);
//
//       this._prepareStats(product, productStats);
//
//       return product;
//     });
//   }
//
//   private async _getProductStatsFilters(req): Promise<IProductStatsFilters> {
//     const fieldList = [
//       'locationName',
//       'section',
//       'filterDate',
//     ];
//
//     const filters: IProductStatsFilters = {};
//
//     for (let field of fieldList) {
//       const val = _.get(req, 'query.' + field);
//
//       if (!val) {
//         continue;
//       }
//
//       if (field === 'locationName') {
//         const location = await locationManagement.getLocationByName(req, val);
//
//         if (location) {
//           filters.location = {
//             id: location._doc,
//             name: location.name,
//             lng: location.address.loc[0],
//             lat: location.address.loc[1],
//           };
//         }
//       }
//       else if (field === 'filterDate') {
//         filters.filterDate = JSON.parse(val);
//         filters.filterDateFunction = agGridHelper.getFilterDateFunction(req);
//       }
//       else {
//         filters[field] = val;
//       }
//     }
//
//     return filters;
//   }
//
//   private _prepareProductStats(product, productStatsList: any[], statsFilterParams: IProductStatsFilters): any {
//     if (!productStatsList || !productStatsList.length) {
//       return null;
//     }
//
//     const productStats = _.find(productStatsList, item => item.productId === product._doc);
//
//     if (!productStats) {
//       return null;
//     }
//
//     this._filterProductStatsFullList(productStats, statsFilterParams);
//     return productStats;
//   }
//
//   private _filterProductStatsFullList(productStats, statsFilterParams: IProductStatsFilters) {
//     const statsNameList = ['bookings', 'quotes'];
//
//     const filterDateField = _.get(statsFilterParams, 'filterDate.field');
//
//     statsNameList.forEach(statsName => {
//       const fullList = _.get(productStats, statsName + '.fullList');
//
//       if (!fullList || !fullList.length) {
//         return;
//       }
//
//       productStats[statsName].fullList = fullList.filter(item => {
//         const locationId = _.get(item, 'location.id');
//
//         return (!statsFilterParams.section || item.section === statsFilterParams.section) &&
//           (!statsFilterParams.location || locationId === statsFilterParams.location.id) &&
//           (!filterDateField ||
//             (filterDateField === 'byDate.createdDate' && statsFilterParams.filterDateFunction(item.createdDate)) ||
//             (filterDateField !== 'byDate.createdDate' && statsFilterParams.filterDateFunction(item.date)));
//       });
//     });
//   }
//
//   private _prepareTopVenuesList(product, venueList: any[]) {
//     product.venueFeatureCount = 0;
//     product.venueList = [];
//     const venues = _.get(product, 'locations.venues');
//
//     if (venues && venues.length > 0) {
//       const topVenueList: string[] = [];
//
//       venues.forEach(venue => {
//         const topVenue = _.get(venue, 'topVenue.venue');
//
//         if (topVenue) {
//           product.venueList.push(topVenue);
//         }
//
//         if (topVenue && topVenue.name) {
//           topVenueList.push(topVenue.name);
//         }
//
//         const venueFeatureList = _.get(venue, 'topVenue.venueFeature');
//
//         if (venueFeatureList && venueFeatureList.length > 0) {
//           product.venueFeatureCount += venueFeatureList.length;
//           product.venueList = _.concat(product.venueList, venueFeatureList);
//         }
//       });
//
//       if (topVenueList.length > 0) {
//         product.topVenueList = topVenueList;
//       }
//     }
//
//     if (product.venueList.length > 0) {
//       product.venueList = _.uniqWith(product.venueList, _.isEqual);
//
//       product.venueList.forEach(item => {
//         const venue = _.find(venueList, venue => venue._doc === item.id);
//         const supplierId = _.get(venue, 'setting.supplier.id');
//
//         if (supplierId) {
//           item.supplierId = supplierId;
//         }
//       });
//     }
//
//     if (product.hasOwnProperty('locations')) {
//       delete product.locations;
//     }
//   }
//
//   private _prepareKitCount(product) {
//     product.kitCount = product.kit && product.kit.length > 0 ? product.kit.length : 0;
//
//     if (product.kit) {
//       delete product.kit;
//     }
//   }
//
//   private _calculateReviews(product) {
//     const reviews = _.get(product, 'reviews');
//
//     if (reviews && reviews.length > 0) {
//       let totalCount: number = 0;
//       let totalScore: number = 0;
//
//       reviews.forEach(review => {
//         totalScore += review.score * review.count;
//         totalCount += review.count;
//       });
//
//       product.reviewsCount = totalCount || 0;
//       product.reviewsScore = totalCount ? Math.ceil(totalScore * 10 / totalCount) / 10 : 0;
//     } else {
//       product.reviewsCount = 0;
//       product.reviewsScore = 0;
//     }
//
//     if (product.hasOwnProperty('reviews')) {
//       delete product.reviews;
//     }
//   }
//
//   private _prepareStats(product, productStats) {
//     const bookingsFullList = _.get(productStats, 'bookings.fullList', []);
//
//     const bookingsIdList = _.chain(bookingsFullList).map(item => item.eventId).filter(item => !!item).uniq().value();
//
//     product.bookingsCount = bookingsIdList.length;
//     product.bookingsPeople = _.sumBy(bookingsFullList, 'people');
//     product.bookingsCost = _.sumBy(bookingsFullList, 'costGBP');
//     product.bookingsMargin = _.sumBy(bookingsFullList, 'marginGBP');
//
//     const quotesList = _.get(productStats, 'quotes.fullList', []);
//
//     const quotesIdList = _.chain(quotesList).map(item => item.eventId).filter(item => !!item).uniq().value();
//
//     product.quotesCount = quotesIdList.length;
//
//     const eventsIdList = _.chain([]).concat(bookingsIdList, quotesIdList).uniq().value();
//
//     product.eventsCount = eventsIdList.length;
//
//     product.quoteConv = _.isFinite(product.bookingsCount) && product.quotesCount && _.isFinite(product.quotesCount) ?
//       roundNumberAtLeastDecimalPoints(product.bookingsCount * 100 / product.quotesCount, 0) : 0;
//
//     product.eventsConv = _.isFinite(product.bookingsCount) && product.eventsCount && _.isFinite(product.eventsCount) ?
//       roundNumberAtLeastDecimalPoints(product.bookingsCount * 100 / product.eventsCount, 0) : 0;
//
//     product.bookingsMPE = _.isFinite(product.bookingsMargin) && product.eventsCount && _.isFinite(product.eventsCount) ?
//       roundNumberAtLeastDecimalPoints(product.bookingsMargin / product.eventsCount, 0) : 0;
//
//     product.bookingsMPQ = _.isFinite(product.bookingsMargin) && product.quotesCount && _.isFinite(product.quotesCount) ?
//       roundNumberAtLeastDecimalPoints(product.bookingsMargin / product.quotesCount, 0) : 0;
//   }
//
//   private _prepareCreated(product) {
//     if (!product.hasOwnProperty('_system')) {
//       return;
//     }
//
//     const date = _.get(product, '_system.created_on.iso_8601');
//
//     if (date) {
//       product.created = product.created || {};
//       product.created.date = product.created.date || date;
//     }
//
//     delete product._system;
//   }
//
//   private _prepareLastEdited(product) {
//     if (!product.lastEdited && product.lastUpdated && product.lastUpdated.name) {
//       product.lastEdited = {
//         name: product.lastUpdated.name,
//         date: product.lastUpdated.date,
//       };
//
//       delete product.lastUpdated;
//     }
//   }
//
//   private _getPackageBookedProducts(events: Array<any>, currentDate: Date, filters: IBookedProductsGridFilters, isSupplier: boolean): Array<any> {
//     if (!events || !events.length) {
//       return [];
//     }
//
//     let result: Array<any> = [];
//
//     for (let event of events) {
//       if (!event || !event.packageBooked || !event.packageBooked.productList || !event.packageBooked.productList.length) {
//         continue;
//       }
//
//       for (let product of event.packageBooked.productList) {
//         if (!product || !product.itinerary || !product.itinerary.length) {
//           continue;
//         }
//
//         let supplier = agGridHelper.getSupplierForProduct(product, event);
//
//         if (filters.supplierId && (!supplier || filters.supplierId !== supplier.id)) {
//           continue;
//         }
//
//         for (let itinerary of product.itinerary) {
//           if (!itinerary) {
//             continue;
//           }
//
//           if (filters.itineraryDateFrom && itinerary.date < filters.itineraryDateFrom) {
//             continue;
//           }
//
//           if (filters.itineraryDateTo && itinerary.date > filters.itineraryDateTo) {
//             continue;
//           }
//
//           let tasksDue = agGridHelper.getTasksDue(itinerary, currentDate);
//
//           if (filters.tasksOverdue) {
//             if (filters.tasksOverdue === 'Yes') {
//               if (!tasksDue || tasksDue === 0) {
//                 continue;
//               }
//             } else if (filters.tasksOverdue === 'No') {
//               if (tasksDue !== 0) {
//                 continue;
//               }
//             }
//           }
//
//           let productData = {
//             productId: product.productId,
//             name: agGridHelper.getProductName(product),
//             currencyName: agGridHelper.getCurrencyName(product),
//             currencySymbol: agGridHelper.getCurrencySymbol(product),
//             type: agGridHelper.getType(product),
//             categoryName: agGridHelper.getCategoryName(product),
//             productOptions: agGridHelper.getProductOptions(itinerary, product),
//             productAddOns: agGridHelper.getProductAddOns(itinerary, product),
//             productCustom: product.productCustom,
//           };
//
//           agGridHelper.removeStartTimeIfTransfer(itinerary, product);
//
//           itinerary.supplierNote = agGridHelper.getSupplierNote(itinerary);
//           itinerary.tasksDue = tasksDue;
//           itinerary.overdueDays = agGridHelper.getOverdueDays(itinerary);
//           itinerary.tasksTotal = agGridHelper.getTasksTotal(itinerary);
//           itinerary.tasksFor = agGridHelper.getTasksFor(itinerary);
//           itinerary.daysUntil = agGridHelper.getItineraryDaysUntil(itinerary, currentDate);
//
//           if (!isSupplier) {
//             itinerary.declineReason = agGridHelper.getDeclineReason(itinerary);
//           }
//
//           result.push({
//             _doc: event._doc,
//             eventSummary: event.eventSummary,
//             product: productData,
//             itinerary,
//             supplier
//           });
//         }
//       }
//     }
//
//     return result;
//   }
//
//   private async _filterProductListByLocation(req, productList: any[], location): Promise<any[]> {
//     if (!productList || !productList.length || !location) {
//       return productList;
//     }
//
//     const productTemplate = await templateManagement.getByName(req, 'product');
//
//     return productsSearchAndGroupsManager.filterProductListByLocation(productList, location, productTemplate);
//   }
// }
//
//
// const dateHelper = new DateHelper();
// const agGridProductsManagement = new AgGridProductsManagement(dateHelper);
// export default agGridProductsManagement;
