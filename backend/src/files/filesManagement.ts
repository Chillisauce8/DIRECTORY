import {coreServiceLocator} from '../serviceLocator';
import type { IDataCrud, IQueryParams } from '../db';
import {ERROR_REASON} from '../const';
import { RequestHelper } from '../utils';
import { LoggingHelper } from '../utils';
import { configProjectCloudinary } from '../utils/cloudinaryHelper';
import { ObjectId } from 'mongodb';


const cloudinary = require('cloudinary');


const STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');


export class FilesManagement {

    constructor(private dataCrudService: IDataCrud,
                private requestHelper: RequestHelper,
                private loggingHelper: LoggingHelper) {
        //
    }

    async upload(req: Request, node) {
        const savedNode = await this._saveFile(req, node, false);
        await this._uploadMedia(req, savedNode, false);

        return savedNode;
    }

    async replace(req: Request, node) {
        const savedNode = await this._saveFile(req, node, true);
        await this._uploadMedia(req, savedNode, true);

        return savedNode;
    }

    async update(req: Request, node) {
        return this._saveFile(req, node, true);
    }

    async get(req: Request) {
        return this._getFile(req);
    }

    async getById(req: Request, fileId) {
        return this._getFileById(req, fileId);
    }

    async delete(req: Request, nodeId): Promise<void> {
        const query: IQueryParams = {
            nodeId
        };

        const node = await this.dataCrudService.readNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.files.name, query);

        const isAllowed = await this._isNodeUpdateAllowed(req, node);

        if (!isAllowed) {
            return Promise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
        }

        await this.dataCrudService.deleteNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.files.name, {nodeId});

        configProjectCloudinary(req);
        cloudinary.api.delete_resources([nodeId], result => {});
    }

    private async _isNodeUpdateAllowed(req: Request, node) {
        return true;
    }

    private async _saveFile(req: Request, node, isReplace: boolean) {
        const isAllowed = await this._isNodeUpdateAllowed(req, node);

        if (!isAllowed) {
            return Promise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
        }

        const savedNode = isReplace ?
            await this.dataCrudService.updateNode(req,
                STANDARD_COLLECTIONS_DESCRIPTION.files.name, node) :
            await this.dataCrudService.createNode(req,
                STANDARD_COLLECTIONS_DESCRIPTION.files.name, node);

        return savedNode;
    }

    private async _uploadMedia(req: Request, node, isReplace) {
        const mediaType = node.type.toLowerCase();
        const nodeObj: any = { public_id: node._id, resource_type: mediaType };

        if (isReplace) {
            nodeObj.invalidate = true;
        }

        configProjectCloudinary(req);

        return cloudinary.uploader.upload(
            req['file'].path,
            (result) => {
                this.loggingHelper.toLog('CLOUDINARY ' + JSON.stringify(result));
                return Promise.resolve(result);
            },
            nodeObj);
    }

    private async _getFileById(req: Request, fileId) {
        let query = {};

        query['_id'] = new ObjectId(fileId);

        const fileQuery: IQueryParams = {
            query
        };

        const node = await this.dataCrudService.querySingleNode(req,
            STANDARD_COLLECTIONS_DESCRIPTION.files.name, fileQuery);

        return node;
    }

    private async _getFile(req: Request) {
        const pagination = this.requestHelper.parseRequestPaginationParams(req);
        const query: any = this.requestHelper.parseRequestFiltrationParams(req);

        const mediaQuery: IQueryParams = {
            query,
            pagination
        };

        const nodes = await this.dataCrudService.queryNodes(req,
            STANDARD_COLLECTIONS_DESCRIPTION.files.name, mediaQuery)

        return nodes || [];
    }
}

