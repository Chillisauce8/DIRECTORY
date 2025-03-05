import { STANDARD_COLLECTIONS_DESCRIPTION } from '../collectionNames';
import { UserHelper } from './userHelper';
import type { IDataCrud } from '../db';



export class RoleManagement {

    constructor(private userHelper: UserHelper,
                private dataCrudService: IDataCrud) {
    }

    async updateRole(req: Request, node) {
        return this.dataCrudService.updateNode(req, node._type, node);
    }

    async getRolesByNames(req: Request, roleNames: string[]) {

        const roleNodes = await this.dataCrudService.queryNodes(req,
            STANDARD_COLLECTIONS_DESCRIPTION.roles.name,
            {query: {'general.name': {'$in': roleNames}}});

        return roleNodes.filter(item => !!item);
    }

    async getDefaultOwnerRole(req: Request,
                              roleType: string) {
        return this.dataCrudService.querySingleNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.roles.name,
            {query: {'general.type': roleType, 'general.defaultForOwner': true}});
    }

    async getDefaultMemberRole(req: Request,
                              roleType: string) {
        return this.dataCrudService.querySingleNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.roles.name,
            {query: {'general.type': roleType, 'general.defaultForMember': true}});
    }

    async getUserOwnRoles(req: Request, user) {
        const roleNames = user.roles?.map(role => role['name']);

        if (roleNames) {
            return this.getRolesByNames(req, roleNames);
        }

        return [];
    }
}
