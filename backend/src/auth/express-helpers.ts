import {coreServiceLocator} from '../serviceLocator';
import { PermissionFunction, PermissionsHelper, PermissionView } from './permissions-helper';


const permissionsHelper: PermissionsHelper = coreServiceLocator.get('permissionsHelper');


export function requireAuthenticated(req: Request, res, next) {
    return permissionsHelper.requireAuthenticated(req, res, next);
}


export function requireHasPermissionsFor(name: string, view?: PermissionView) {
    return permissionsHelper.requireHasPermissionsFor({name, view});
}

export function requireReadPermissionsFor(name: string, view?: PermissionView) {
    return permissionsHelper.requireReadPermissionsFor({name, view});
}


export function requireCreatePermissionsFor(name: string, view?: PermissionView) {
    return permissionsHelper.requireCreatePermissionsFor({name, view});
}


export function requireUpdatePermissionsFor(name: string, view?: PermissionView) {
    return permissionsHelper.requireUpdatePermissionsFor({name, view});
}


export function requireDeletePermissionsFor(name: string, view?: PermissionView) {
    return permissionsHelper.requireDeletePermissionsFor({name, view});
}


export function requireEditFullPermissionsFor(name: string, view?: PermissionView) {
    return permissionsHelper.requireEditFullPermissionsFor({name, view});
}


export function requireEditPublishedPermissionsFor(name: string, view?: PermissionView) {
    return permissionsHelper.requireEditPublishedPermissionsFor({name, view});
}


// export function requireReadJsonPermissionsFor(type: PermissionFeatureType, name: string, view?: PermissionView) {
//     return authHelper.requireReadJsonPermissionsFor(permissions, view);
// }
//
// export function requireEditJsonPermissionsFor(type: PermissionFeatureType, name: string, view?: PermissionView) {
//     return authHelper.requireEditJsonPermissionsFor(permissions, view);
// }


export function getCrudRequirePermissionsFor(name: string, view?: PermissionView) {
    const readAuth = requireReadPermissionsFor(name, view);
    const createAuth = requireCreatePermissionsFor(name, view);
    const updateAuth = requireUpdatePermissionsFor(name, view);
    const deleteAuth = requireDeletePermissionsFor(name, view);

    return {readAuth, createAuth, updateAuth, deleteAuth};
}


export function requireAnyOf(permissionFunctions: Array<PermissionFunction>) {
    return permissionsHelper.requireAnyOf(permissionFunctions);
}
