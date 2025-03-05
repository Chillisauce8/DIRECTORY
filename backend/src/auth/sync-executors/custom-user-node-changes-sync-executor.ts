import { NodeChangesSyncExecutor } from '../../node-changes/nodeChangesSyncExecutor';
import { BaseDataCrud } from '../../db/base-data-crud';
import { STANDARD_COLLECTIONS_DESCRIPTION } from '../../collectionNames';
import { RegistrationManagement, UserManagement } from '../index';
import {ObjectId} from 'mongodb';


export class CustomUserNodeChangesSyncExecutor extends NodeChangesSyncExecutor {

    private userGeneralCommonFields = ['email', 'emailVerified', 'name', 'firstName', 'lastName',
        'isActive', 'phone', 'phoneValidated'];

    constructor(
        private dataCrud: BaseDataCrud,
        private registrationManagement: RegistrationManagement,
        private userManagement: UserManagement,
        private APPS_BASE_SETTINGS: {[id: string]: any}) {
        super();
    }

    protected isActualNode(nodeData: any, prevNodeData: any): boolean {
        return nodeData?.general?.email || prevNodeData?.general?.email;
    }
    protected needAsyncCheck(): boolean {
        return true;
    }

    protected async asyncCheck(req: Request, nodeData: any, prevNodeData: any): Promise<boolean> {
        const properDefinitions = await this.dataCrud.queryNodes(req,
            STANDARD_COLLECTIONS_DESCRIPTION.collections.name, {query: {
                'customUser.active': true,
                _fields: {name: 1}
            }});

        if (!properDefinitions?.length) {
            return false;
        }

        const nodeType = nodeData?._type || prevNodeData?._type;

        const properDefinition = properDefinitions.find(item => item.name === nodeType);

        if (!properDefinition) {
            return false;
        }

        return true;
    }

    protected isActualChanges(nodeData: any, prevNodeData: any, diff?: any): boolean {
        if (!nodeData && !prevNodeData) {
            return true;
        }

        const result = !!this.userGeneralCommonFields.find(fieldName => {
            return nodeData?.general?.[fieldName] !== prevNodeData?.general?.[fieldName];
        });

        return result;
    }

    protected async execute(nodeData: any, prevNodeData: any, req: Request): Promise<any> {
        if (!nodeData) {
            return this.removeUser(req, prevNodeData.userId);
        }

        if (!prevNodeData && !nodeData.userId) {
            const userNode = await this.createUser(req, nodeData);
            nodeData.userId = userNode._id;
        } else if (prevNodeData) {
            return this.updateUser(req, nodeData.userId, nodeData);
        }
    }

    async removeUser(req: Request, userId: string) {
        await this.dataCrud.deleteNode(req, STANDARD_COLLECTIONS_DESCRIPTION.users.name,
            {query: {_id: new ObjectId(userId)}});

        await this.dataCrud.deleteNode(req, STANDARD_COLLECTIONS_DESCRIPTION.userSecurity.name,
            {query: {userId}});
    }

    async createUser(req: Request, customUserNode: any) {
        const registrationData = {...customUserNode.general};

        if (!registrationData.type) {
            registrationData.type = customUserNode._type;
        }

        return this.registrationManagement.registerUser(req, null, registrationData, {},
            {generatePassword: true, enforcePassword: true, selfRegistration: false})
    }

    async updateUser(req: Request, userId: string, customUserNode: any) {
        const userNode = await this.dataCrud.readNode(req, STANDARD_COLLECTIONS_DESCRIPTION.users.name,
            {nodeId: userId});

        if (!userNode) {
            console.log('SWP ERROR: User node missed for user id: ', userId);
            return;
        }

        const customGeneralMainFields =
            this.userGeneralCommonFields
                .filter(key => key in customUserNode.general) // line can be removed to make it inclusive
                .reduce((obj2: any, key: string) => (obj2[key] = customUserNode.general[key], obj2), {});

        userNode.general = {...userNode.general, ...customGeneralMainFields};
        userNode.title =  userNode.general.name;

        return this.dataCrud.updateNode(req, STANDARD_COLLECTIONS_DESCRIPTION.users.name, userNode);
    }
}
