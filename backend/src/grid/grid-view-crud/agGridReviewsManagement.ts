import * as _ from 'lodash';
import { coreServiceLocator } from '../../serviceLocator';
import { ERROR_REASON } from '../../const';
import { RequestHelper } from '../../utils';
import { IDataCrud, IQueryParams } from '../../db';


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
// const customerManagement = coreServiceLocator.get('customerManagement');


export class AgGridReviewsManagement {

  constructor(private dataCrudService: IDataCrud, private requestHelper: RequestHelper) {
  }

  async getProductReviewsForGrid(req: Request): Promise<Array<any>> {
    return this._getReviewList(req, /*REVIEW_TYPE.product*/ 'product');
  }

  async getSupplierProductReviewsForGrid(req: Request, supplierId: string): Promise<Array<any>> {
    if (!supplierId) {
      return Promise.reject({reason: ERROR_REASON.invalidData, message: 'Supplier Id is invalid'});
    }

    return this._getReviewList(req, /*REVIEW_TYPE.product*/ 'product', supplierId);
  }

  async getStaffReviewsForGrid(req: Request): Promise<any[]> {
    return this._getReviewList(req, /*REVIEW_TYPE.staff*/ 'staff');
  }

  private async _getReviewList(req: Request, type: string, supplierId?: string): Promise<Array<any>> {
    const pagination = this.requestHelper.parseRequestPaginationParams(req);
    const options = {readFromCache: false, updateCache: false};

    const query: any = this.requestHelper.parseRequestFiltrationParams(req);

    query.type = type;

    if (type === /*REVIEW_TYPE.product*/ 'product') {
      query._fields = {
        _doc: 1,
        score: 1,
        comment: 1,
        reviewDate: 1,
        reviewerId: 1,
        reviewerName: 1,
        productId: 1,
        productType: 1,
        categoryName: 1,
        venueId: 1,
        venueName: 1,
        supplierId: 1,
        supplierName: 1,
        organiserName: 1,
        managerName: 1,
        eventId: 1,
        eventSection: 1,
        locationName: 1,
        supplierReply: 1,
        supplierRead: 1,
      };

      if (!supplierId) {
        query._fields.published = 1;
        query._fields.reviewerId = 1;
        query._fields.staffComment = 1;
        query._fields.staffReply = 1;
        query._fields.staffRead = 1;
        query._fields.productName = 1;
        query._fields.multiProductName = 1;
        query._fields.managerTeamName = 1;
      }

      if (supplierId) {
        query.supplierId = supplierId;
        query._fields.supplierId = 1;
        query._fields.supplierProductName = 1;
        query._fields.supplierMultiProductName = 1;
      }
    }
    else if (type === /*REVIEW_TYPE.staff*/ 'staff') {
      query._fields = {
        _doc: 1,
        managerName: 1,
        managerTeamName: 1,
        score: 1,
        comment: 1,
        reviewDate: 1,
        reviewerId: 1,
        reviewerName: 1,
        reviewerRole: 1,
        eventId: 1,
        eventSection: 1,
        stage: 1,
        paymentStage: 1,
      };
    }

    const queryParams: IQueryParams = {query, pagination};

    const reviewList = await this.dataCrudService.queryNodes(req,
        STANDARD_COLLECTIONS_DESCRIPTION.review, queryParams, options);

    return this._extendReviewList(req, reviewList, type, !!supplierId);
  }

  private async _extendReviewList(req: Request, reviewList: any[], type: string, isSupplierArea: boolean): Promise<any[]> {
    if (!reviewList && !reviewList.length) {
      return reviewList;
    }

    let phoneList;

    if (!isSupplierArea) {
      const reviewerIdList = _.chain(reviewList).map(item => item.reviewerId).filter(item => !!item).uniq().value();

      if (reviewerIdList && reviewerIdList.length > 0) {
        // phoneList = await customerManagement.getPhones(req, {customerIdList: reviewerIdList});
      }
    }

    return reviewList.map(review => {
      if (type === /*REVIEW_TYPE.product*/ 'product') {
        review.staffComment = review.staffComment || {};
        review.supplierReply = review.supplierReply || {};
        review.staffReply = review.staffReply || {};
      }

      if (phoneList && review.reviewerId && phoneList.hasOwnProperty(review.reviewerId)) {
        review.phone = phoneList[review.reviewerId];
      }

      return review;
    });
  }
}

