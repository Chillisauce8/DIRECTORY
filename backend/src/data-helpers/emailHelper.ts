import type { IDataCrud } from '../db';
import {STANDARD_COLLECTIONS_DESCRIPTION} from "../collectionNames";


export class EmailHelper {

    constructor(private dataCrudService: IDataCrud) {
    }

    async checkEmailIsUnique(req: Request, email: string, nodeId: string|null = null): Promise<boolean> {
        const nodes = await this.findUserNodeByEmail(req, email);

        if (!nodes) {
            return true;
        }

        if (nodes.length > 1) {
            return false;
        } else if (nodes.length === 1) {
            return nodes[0]._doc === nodeId;
        }

        return true;
    }

    async findUserNodeByEmail(req: Request, email: string) {
        const nodeType = STANDARD_COLLECTIONS_DESCRIPTION.users.name;

        const query = {
            'general.email': email,
            '_fields': {'_doc': 1}
        };

        return this.dataCrudService.queryNodes(req, nodeType, {query});
    }
}

