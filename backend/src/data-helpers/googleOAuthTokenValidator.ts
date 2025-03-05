// import {gmailApiHelper} from './index';
// import {GoogleApiOAuthHelper} from "./googleApiOAuthHelper";
// import { IDataCrud } from '../crud';
// const eventsHelper = require('../server-features/eventsHelper');
//
//
// type StaffData = {
//   _doc: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   gmailAuthData: any;
// };
//
//
// export class GoogleOAuthTokenValidator {
//
//   constructor(private googleApiOAuthHelper: GoogleApiOAuthHelper) {
//     //
//   }
//
//   async checkOAuthTokenForStaffUsers(req) {
//     const staffList = await this.loadStaffList(req);
//     const invalidStaffList = await this.getStaffListWithInvalidOAuth(staffList);
//
//     const subject = `Staff list with invalid Google OAuth Data`;
//     const body = this.buildReportBody(invalidStaffList);
//
//     await eventsHelper.emit('sendReport', req, subject, body);
//   }
//
//   private async loadStaffList(req): Promise<StaffData[]> {
//     const query = {
//       'gmailAuthData.refresh_token': {$exists: true},
//       _fields: {
//         _doc: 1,
//         firstName: 1,
//         lastName: 1,
//         email: 1,
//         gmailAuthData: 1
//       },
//     };
//
//     return dataCrudService.queryAllAvailableNodes(req, STANDARD_COLLECTIONS_DESCRIPTION.staff.name,
//         {query}, {readFromCache: false});
//   }
//
//   private async getStaffListWithInvalidOAuth(staffList: StaffData[]): Promise<StaffData[]> {
//     const invalidStaffList = [];
//     const scopes = gmailApiHelper.getNeededGmailScopeList();
//
//     for (const staff of staffList) {
//       const token = staff.gmailAuthData;
//
//       const isStaffTokenValid = await this.googleApiOAuthHelper.checkTokenAsync(token, scopes);
//
//       if (!isStaffTokenValid) {
//         invalidStaffList.push(staff);
//       }
//     }
//
//     return invalidStaffList;
//   }
//
//   private buildReportBody(invalidStaffList: StaffData[]): string {
//     return invalidStaffList
//       .map(s => `${s.firstName} ${s.lastName} (${s.email}) [${s._doc}]`)
//       .join('<br>');
//   }
// }
