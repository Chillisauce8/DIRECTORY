import {TemplateManagement} from './templateManagement';
import {DateHelper} from 'x-utils';
import { type IDataCrud, type IQueryParams } from '../db';

const constants = require('../const');


export interface BrowserBundleNode {
    path: string;
    data: string; // hex encoded with Buffer.toString('hex')
}


export class BrowserStaticManagement {
    constructor(private dataCrudService: IDataCrud,
                private templateManagement: TemplateManagement,
                private dateHelper: DateHelper) {}

    public async get(req, path: string): Promise<Buffer> {
        const queryParams: IQueryParams = {
            query: {path},
        }

        const nodeData: BrowserBundleNode = await this.dataCrudService.querySingleNode(req,
          constants.dataTypes.browserStatic, queryParams);

        if (!nodeData?.data) {
            return null;
        }

        return Buffer.from(nodeData.data, 'hex');
    }

    public async create(req, path: string, file: Buffer): Promise<any> {
        const data = file.toString('hex');

        const nodeBody = {path, data};

        const nodeType = constants.dataTypes.browserStatic;

        return this.dataCrudService
            .createNode(req, nodeType, nodeBody, {ignoreDiff: true, ignoreEventSending: true});
    }

    public async remove(req, path: string): Promise<any> {
        const queryParams: IQueryParams = {
            query: {path},
        };

        return this.dataCrudService.deleteNode(req, constants.dataTypes.browserStatic,
          queryParams, {ignoreDiff: true, ignoreEventSending: true});
    }

    public async clearOldStaticFiles(req): Promise<void> {
        const settingTemplate = await this.templateManagement.getByName(req, 'settings');
        const browserStaticLifespan = settingTemplate?.settingsSystem?.browserStaticLifespan ?? 365;

        const dateAgo = this.dateHelper.saveDateFormat(this.dateHelper.getDateInNDays(new Date(), -browserStaticLifespan));
        const query = {'created.date': {$lte: dateAgo}};

        const nodeType = constants.dataTypes.browserStatic;

        return this.dataCrudService.deleteNodes(req, nodeType, {query});
    }
}
