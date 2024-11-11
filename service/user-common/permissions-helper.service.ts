import { SwpUserType } from '~/service/user-common/user.service';


export enum PermissionTypes {
  dataPermissions = 'dataPermissions',
  operationPermissions = 'operationPermissions',
}


export abstract class PermissionsHelperService {
  public abstract checkPermissions(roles: any[], permission: IPermission, userType: string): boolean;

  public abstract findDataPermissionInRole(role, permissionPath: string, userType: string);

  public abstract findOperationPermissionInRole(role, permissionPath: string);

  public abstract findPermissionInRole(role, userType, permissionDetail: IPermissionDetails);
}


export enum PermissionView {
  list = 'List',
  form = 'Form',
  page = 'Page',
  code = 'Code',
  any = 'Any'
}


export enum PermissionAction {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
  yes = 'Yes',
  editView = 'EditView',
  editPublished = 'EditPublished',
  full = 'Full',
}


export interface IPermissionDetails {
  name: string;
  action?: PermissionAction;
  view?: PermissionView;
}


export type IPermission = IPermissionDetails | IPermissionDetails[];



export class DefaultPermissionsHelperService extends PermissionsHelperService {

  constructor() {
    super();
  }

  findDataPermissionInRole(role, permissionPath: string, userType: string) {
    let dataPermissions;
    let collectionName;

    if (!permissionPath) {
      return null;
    }

    const pathSteps = permissionPath.split('.');

    if (pathSteps[0] === 'dataPermission') {
      collectionName = pathSteps[1];
    } else {
      collectionName = pathSteps[0];
    }

    dataPermissions = role.dataPermissions;

    const properDataPermissions = dataPermissions?.find(item => {
      return item.collection?.name === collectionName;
    }) || null;

    if (properDataPermissions) {
      return properDataPermissions;
    }

    if (userType === SwpUserType.staff) {
      return role.customAppDataPermission;
    }

    return null;
  }

  findOperationPermissionInRole(role, permissionPath: string) {
    const operationPermissions = role[PermissionTypes.operationPermissions];

    if (!permissionPath) {
      return null;
    }

    const pathSteps = permissionPath.split('.');

    const groupName = pathSteps[1];
    const permissionName = pathSteps[2];

    if (!operationPermissions || !groupName || !permissionName) {
      return null;
    }

    const permissionGroup = operationPermissions.find(item => {
      return item.group.value === groupName;
    });

    if (!permissionGroup || !permissionGroup.permissions) {
      return null;
    }

    return permissionGroup.permissions.find(item => {
      return item.permission.value === permissionName;
    });
  }

  findPermissionInRole(role, userType, permissionDetail: IPermissionDetails) {

    const permissionPath = permissionDetail?.name;

    if (!permissionPath) {
      return null;
    }

    const pathSteps = permissionPath.split('.');

    if (pathSteps[0] === PermissionTypes.operationPermissions) {
      return this.findOperationPermissionInRole(role, permissionPath);
    } else {
      return this.findDataPermissionInRole(role, permissionPath, userType);
    }
  }

  checkPermissions(roles: any[], permissions: IPermissionDetails[], userType: string): boolean {
    return permissions.some((permissionDetails: IPermissionDetails) => {
      return roles.some(userRole => {

        const permissionItemInRole = this.findPermissionInRole(userRole, userType, permissionDetails);

        if (!permissionItemInRole) {
          return false;
        }

        if (permissionItemInRole.full) {
          return true;
        }

        if (permissionDetails.view) {
          const viewsInRole = permissionItemInRole?.views;

          if (viewsInRole?.length &&
            !viewsInRole.includes(permissionDetails.view) &&
            !viewsInRole.includes(PermissionView.any)) {
            return false;
          }
        }

        return !!permissionDetails.action && !!(permissionItemInRole?.actions?.[permissionDetails.action]);
      });
    });
  }
}
