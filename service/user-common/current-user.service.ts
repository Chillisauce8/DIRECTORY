import type {UserData} from './user-data.interface';
import {UserTypes} from '~/service/user-common/user.service';
import type { IPermission } from '~/service/user-common/permissions-helper.service';
import {
  PermissionAction,
  PermissionsHelperService,
  PermissionView
} from '~/service/user-common/permissions-helper.service';
import type {CurrentUserStore} from '~/store/current-user';
import { isString } from '~/service/utils';



export class CurrentUser {
  public userData: UserData | null = null;
  private _isLoggedIn = false;

  constructor(protected permissionsHelperService: PermissionsHelperService,
              private currentUserStore: CurrentUserStore) {

    this.userData = this.currentUserStore.user;
    this._isLoggedIn = !!this.userData;

    this.currentUserStore.$onAction(({name, after}) => {

      after(() => {
        this._isLoggedIn = !!currentUserStore.user;
        this.userData = currentUserStore.user;
      });
    });
  }

  public getCSRFTokenCookieName(): string {
    return '_csrf';
  }

  public getRegisteredCookieName(): string {
    return 'registered';
  }

  set(userData: UserData) {
    return this.currentUserStore.set(userData);
  }

  getRawData(): UserData|null {
    return this.userData;
  }

  reset() {
    this.currentUserStore.reset();
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  getId(): string {
    if (this.userData) {
      return this.userData?.id;
    }

    return '';
  }

  getPrincipalId(): string {
    return '';
  }

  getFullName(): string {
    if (this.userData) {
      return this.userData.firstName + ' ' + this.userData.lastName;
    }

    return '';
  }

  getFirstName(): string {
    if (this.userData) {
      return this.userData.firstName;
    }

    return '';
  }

  getLastName(): string {
    if (this.userData) {
      return this.userData.lastName;
    }

    return '';
  }

  getAccountName(): string {
    if (this.userData) {
      return this.userData.name;
    }

    return '';
  }

  getStaffInitials(): string | null {
    if (this.isStaff()) {
      return this.getFullName().split(' ').map(item => item[0]).join('');
    }

    return null;
  }

  getEmail(): string {
    if (this.userData) {
      return this.userData.email as string;
    }

    return '';
  }

  getPhone(): string {
    if (this.userData) {
      return this.userData.phone as string;
    }

    return '';
  }

  getType(): UserTypes|null {
    if (this.userData && this.userData.type) {
      return this.userData.type as UserTypes;
    }

    return null;
  }

  isCustomer(): boolean {
    return this.getType() === UserTypes.customer;
  }

  isStaff(): boolean {
    return this.getType() === UserTypes.staff;
  }

  hasPermission(permission: IPermission | string, view?: PermissionView, action?: PermissionAction): boolean {
    // TODO: need to fix it

    throw 'need to implement';
    // if (!this.isLoggedIn()) {
    //   return false;
    // }
    //
    // let preparedPermission!: IPermission;
    //
    // if (typeof permission === 'string') {
    //   const permissionStringParts = (permission as string).split('.');
    //
    //   if (permissionStringParts.length === 1) {
    //     preparedPermission = {
    //       name: permissionStringParts[0],
    //       action: action || PermissionAction.read,
    //       view: view || PermissionView.page,
    //       // area: (area ?? this.csConfig.defaultSiteArea) as PermissionArea,
    //     };
    //   } else if (permissionStringParts.length === 2) {
    //     preparedPermission = {
    //       // area: (area ?? this.csConfig.defaultSiteArea) as PermissionArea,
    //       name: permissionStringParts[0],
    //       action: permissionStringParts[1] as PermissionAction,
    //       view: view || PermissionView.page,
    //     };
    //   } else if (permissionStringParts.length === 3) {
    //     preparedPermission = {
    //       // area: permissionStringParts[0]  as PermissionArea,
    //       name: permissionStringParts[1],
    //       action: permissionStringParts[2] as PermissionAction,
    //       view: view || PermissionView.page,
    //     };
    //   }
    // } else {
    //   preparedPermission = permission;
    // }
    //
    // // @ts-ignore
    // if (!!preparedPermission && !Array.isArray(permission) && !(permission as IPermissionDetails).area) {
    //   (preparedPermission as any).area = this.csConfig.defaultSiteArea;
    // }
    //
    // if (!this.userData?.role || !preparedPermission) {
    //   return false;
    // }
    //
    // return this.permissionsHelperService.checkPermissions(this.userData?.role, preparedPermission,
    //   this.getType());
  }

  getRoles(): Array<object>|undefined {
    if (!this.userData) {
      return [];
    }
    // TODO: need to fix it
    // if (this.userData.role && !_.isArray(this.userData.role)) {
    //   return [this.userData.role];
    // }

    return this.userData.roles;
  }

  setRoles(roles: Array<object>) {
    this.set({...this.userData, roles: roles});
  }

  useRoles(roles: Array<object>) {
    this.setRoles(roles);
  }

  hasRole(roleName: string): boolean {
    if (!roleName) {
      return false;
    }

    const role = this.userData?.roles;

    if (!role || !role.length) {
      return false;
    }

    for (const item of role) {
      if (item.name === roleName) {
        return true;
      }
    }

    return false;
  }

  isUserTypeIs(userType: string): boolean {
    let realUserType = this.getType();

    if (!realUserType) {
      return false;
    }

    return realUserType.toUpperCase() === userType.toUpperCase();
  }

  isUserTypeIn(userTypes: string | string[]): boolean {
    if (!userTypes) {
      return false;
    }

    const userTypeArray = userTypes ?
      (isString(userTypes) ? [userTypes] : userTypes) : null;

    return (userTypeArray as string[]).some(userType => this.isUserTypeIs(userType));
  }

  hasUserSession(): boolean {
    if (!window) {
      return false;
    }

    return !!useCookie(this.getCSRFTokenCookieName());
  }

  wasRegistered(): boolean {
    if (!window) {
      return false;
    }

    return !!useCookie(this.getRegisteredCookieName());
  }

  isIpBlocked(): boolean|null {
    return this.userData?.ipBlocked || null;
  }

  getSubscribe(): string {
    if (this.userData) {
      // return this.userData.subscribe;
    }

    return '';
  }

  getCompany(): any {
    if (this.userData) {
      // return this.userData.company;
    }

    return null;
  }

  isVirtual(): boolean | null {
    if (!this.userData?.id) {
      return null;
    }

    return this.userData.id.indexOf('v_') === 0;
  }

  getGmailTokenData() {
    if (!this.isStaff()) {
      return;
    }

    const staffData: any = this.userData;

    return staffData.gmailAuthData;
  }
}
