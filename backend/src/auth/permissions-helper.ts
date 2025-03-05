import * as _ from 'lodash';
import { returnForbidden, returnNotAuthenticated } from '../utils';
import { RoleManagement, UserHelper } from './index';
import { DB_TYPES, STANDARD_COLLECTIONS_DESCRIPTION } from '../collectionNames';
import { coreServiceLocator } from '../serviceLocator';
import { SECURE_COOKIES } from '../const';


export enum PermissionTypes {
    dataPermissions = 'dataPermissions',
    operationPermissions = 'operationPermissions',
}

export enum PermissionView {
    list = 'List',
    form = 'Form',
    page = 'Page',
    data = 'Data',
    any = 'Any'
}


export enum PermissionAction {
    create = 'Create',
    read = 'Read',
    update = 'Update',
    delete = 'Delete',
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


export interface PermissionFunction {
    (req: any, res: any, next: any, returnForbidden?: boolean): Promise<boolean>
}


export function findDataPermissionInRole(role, permissionPath: string, userType) {
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

    if (userType === 'staff') {
        const standardCollection = STANDARD_COLLECTIONS_DESCRIPTION[collectionName];

        if (!standardCollection) {
            return role.customAppDataPermission;
        }

        if (standardCollection?.dbTypes.includes(DB_TYPES.User)) {
            return role.customAppDataPermission;
        }
    }

    return null;
}


export function findOperationPermissionInRole(role, permissionPath: string) {
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


export function findPermissionInRole(role, userType, permissionPath: string) {

    if (!permissionPath) {
        return null;
    }

    const pathSteps = permissionPath.split('.');

    if (pathSteps[0] === PermissionTypes.operationPermissions) {
        return findOperationPermissionInRole(role, permissionPath);
    } else {
        return findDataPermissionInRole(role, permissionPath, userType);
    }
}


// todo: !!!update it in spa code to!!!
export function checkPermissions(userRoleArray, permissions: IPermissionDetails[], userType: string): boolean {
    return _.some(permissions, (permissionDetails: IPermissionDetails) => {
        return _.some(userRoleArray, userRole => {
            //const path = preparePermissionPath(permissionDetails, userType);

            const permissionItemInRole = findPermissionInRole(userRole, userType, permissionDetails?.name);

            if (!permissionItemInRole) {
                return false;
            }

            if (permissionItemInRole.full) {
                return true;
            }

            if (permissionDetails.view) {
                const viewsInRole = permissionItemInRole['views'];

                if (viewsInRole?.length &&
                    !viewsInRole.includes(permissionDetails.view) &&
                    !viewsInRole.includes(PermissionView.any)) {
                    return false;
                }
            }

            return !!(permissionItemInRole?.actions?.[permissionDetails?.action]);
        });
    });
}


export class PermissionsHelper {

    private privateSettings = coreServiceLocator.get('privateSettings');

    constructor(private userHelper: UserHelper,
                private roleManagement: RoleManagement) {
        //
    }

    requireNodeTypePermissionsFor(action: PermissionAction, view?: PermissionView) {
        return this._getRouteCheckNodeTypePermissionFunction(action, view);
    }

    requireRelatorsBulkPermissionsFor(action: PermissionAction, view?: PermissionView) {
        return this._getRouteCheckRelatorsBulkPermissionFunction(action, view);
    }

    requireAuthenticated(req: Request, res, next) {
        const {id} = req['userDetails'];

        if (!!id) {
            return next();
        } else {
            const cookie = req['cookies'][SECURE_COOKIES.SESSION];

            if (!cookie) {
                console.error('Request failed. No auth cookie');
            }

            returnNotAuthenticated(res);
        }
    }

    async getRolesArrayForUserAndPermissionArea(req: Request, user) {
        return this.roleManagement.getUserOwnRoles(req, user);
    }

    async userHasPermissions(req: Request, permission: IPermission): Promise<boolean> {
        if (!permission) {
            return false;
        }

        const checkPermArray = ((permission as IPermissionDetails[]).length ? permission : [permission]) as IPermissionDetails[];

        const user = req['userDetails'];

        const userRoleArray = await this.getRolesArrayForUserAndPermissionArea(req, user)

        if (!userRoleArray.length) {
            if (this.privateSettings.ignorePermissions) {
                console.log('WARNING!: PERMISSIONS FAILED: No roles');
                return true;
            }
            return false;
        }

        const result = checkPermissions(userRoleArray, checkPermArray, user?.type);

        if (this.privateSettings.ignorePermissions) {
            if (!result) {
                console.warn('WARNING: PERMISSIONS WOULD FAIL: ', JSON.stringify(permission));
            }

            return true;
        }

        return result;
    }

    requireAnyOf(permissionFunctions: Array<PermissionFunction>) {
        return async (req, res, next) => {
            for (let func of permissionFunctions) {
                res.testAccess = true;
                res.accessDenied = false;

                await func(req, res, () => {});
                if (!res.accessDenied) {
                    return next();
                }
            }

            res.testAccess = false;
            return returnForbidden(res);
        };
    }

    async userHasPermissionFor(req: Request, permissionDetails: IPermissionDetails) {
        return this.userHasPermissions(req, permissionDetails);
    }

    async userHasReadPermissionsFor(req: Request, permissionDetails: IPermissionDetails) {
        permissionDetails.action = PermissionAction.read;
        return this.userHasPermissions(req, permissionDetails);
    }

    async userHasCreatePermissionsFor(req: Request, permissionDetails: IPermissionDetails) {
        permissionDetails.action = PermissionAction.create;
        return this.userHasPermissions(req, permissionDetails);
    }

    async userHasUpdatePermissionsFor(req: Request, permissionDetails: IPermissionDetails) {
        permissionDetails.action = PermissionAction.update;
        return this.userHasPermissions(req, permissionDetails);
    }

    async userHasDeletePermissionsFor(req: Request, permissionDetails: IPermissionDetails) {
        permissionDetails.action = PermissionAction.delete;
        return this.userHasPermissions(req, permissionDetails);
    }

    async userHasEditViewPermissionsFor(req: Request, permissionDetails: IPermissionDetails) {
        permissionDetails.action = PermissionAction.editView;
        return this.userHasPermissions(req, permissionDetails);
    }

    async userHasEditPublishedPermissionsFor(req: Request, permissionDetails: IPermissionDetails) {
        permissionDetails.action = PermissionAction.editPublished;
        return this.userHasPermissions(req, permissionDetails);
    }

    async userHasEditFullPermissionsFor(req: Request, permissionDetails: IPermissionDetails) {
        permissionDetails.action = PermissionAction.full;
        return this.userHasPermissions(req, permissionDetails);
    }

    requireHasPermissionsFor(permissionDetails: IPermissionDetails) {
        return this._getRouteCheckPermissionFunction(permissionDetails, this.userHasPermissionFor.bind(this));
    }

    requireReadPermissionsFor(permissionDetails: IPermissionDetails) {
        return this._getRouteCheckPermissionFunction(permissionDetails, this.userHasReadPermissionsFor.bind(this));
    }

    requireCreatePermissionsFor(permissionDetails: IPermissionDetails) {
        return this._getRouteCheckPermissionFunction(permissionDetails, this.userHasCreatePermissionsFor.bind(this));
    }

    requireUpdatePermissionsFor(permissionDetails: IPermissionDetails) {
        return this._getRouteCheckPermissionFunction(permissionDetails, this.userHasUpdatePermissionsFor.bind(this));
    }

    requireDeletePermissionsFor(permissionDetails: IPermissionDetails) {
        return this._getRouteCheckPermissionFunction(permissionDetails, this.userHasDeletePermissionsFor.bind(this));
    }

    requireEditFullPermissionsFor(permissionDetails: IPermissionDetails) {
        return this._getRouteCheckPermissionFunction(permissionDetails, this.userHasEditFullPermissionsFor.bind(this));
    }

    requireEditPublishedPermissionsFor(permissionDetails: IPermissionDetails) {
        return this._getRouteCheckPermissionFunction(permissionDetails, this.userHasEditPublishedPermissionsFor.bind(this));
    }

    // requireReadJsonPermissionsFor(permissionDetails: IPermissionDetails) {
    //     return this._getRouteCheckPermissionFunction(name, this., USER_PERMISSIONS.type.readJson);
    // }
    //
    // requireEditJsonPermissionsFor(permissionDetails: IPermissionDetails) {
    //     return this._getRouteCheckPermissionFunction(name, this., USER_PERMISSIONS.type.editJson);
    // }


    private _getRouteCheckPermissionFunction(permissionDetails: IPermissionDetails, checkFunction: Function) {
        return (req, res, next, returnForbiddenAllowed=true) => {
            return checkFunction(req, permissionDetails)
                .then((isAllowed: boolean) => {
                    if (isAllowed) {
                        next();
                        return true;
                    } else {
                        if (returnForbiddenAllowed) {
                            returnForbidden(res, 'Forbidden: Route check permission failed');
                        }

                        return false;
                    }
                });
        }
    }

    private checkForNodeType(req, res, next, nodeType: string, action: PermissionAction,
                             view?: PermissionView,
                             returnForbiddenAllowed=true) {
        return this.userHasPermissions(req,
            <any>{
                name: nodeType,
                action,
                view: view || PermissionView.data
            })
            .then((isAllowed: boolean) => {
                if (isAllowed) {
                    next();
                    return true;
                } else if (returnForbiddenAllowed) {
                    returnForbidden(res);
                }

                return false;
            });
    }

    private _getRouteCheckRelatorsBulkPermissionFunction(action: PermissionAction,
                                                     view?: PermissionView) {
        return async (req, res, next, returnForbidden: any = true) => {
            if (!req.body?.length) {
                next();
                return true;
            }

            const nodeTypes: string[] = _.uniq(req.body.map(item => item.schema));

            return Promise.all(nodeTypes.map(nodeType => {
                return this.checkForNodeType(req, res, next, nodeType, action, view);
            }))
        }
    }

    private _getRouteCheckNodeTypePermissionFunction(action: PermissionAction,
                                                     view?: PermissionView) {
        return (req, res, next, returnForbiddenAllowed: any = true) => {
            let nodeType;

            if (req.body) {
                nodeType = req.body.nodeType;
            }

            if (!nodeType) {
                nodeType = req.params['nodeType'] || req.params['type'] || req.params['collectionName'];
            }

            return this.checkForNodeType(req, res, next, nodeType, action, view, returnForbiddenAllowed);
        }
    }
}
