import * as _ from 'lodash';
import type {IQueryParams} from './data-crud.interface';
import {wrapDefaultDataResponse} from '../utils';
import { coreServiceLocator } from '../serviceLocator';


const requestHelper = coreServiceLocator.get('requestHelper');
const dataCrudServiceWithRelators = coreServiceLocator.get('dataCrudServiceWithRelators');


export function readNodeRoute(collectionName: string, onSuccess?) {
    return function(req: Request, res, next) {
        const nodeId = req['params'].id;
        wrapDefaultDataResponse(res, dataCrudServiceWithRelators.readNode(req, collectionName, {nodeId})
            .then((result) => onSuccess ? onSuccess(req, res, result): result)
        );
    };
}


export function createQueryNodesRoute(collectionName: string, onSuccess?, fields?) {
    return function(req: Request, res, next) {
        const pagination = requestHelper.parseRequestPaginationParams(req);
        const query: any = requestHelper.parseRequestFiltrationParams(req);
        query._fields = requestHelper.parseRequestFieldsParams(req);

        if (fields) {
            if (query._fields) {
                _.merge(query._fields, fields);
            } else {
                query._fields = fields;
            }
        }

        const resultQuery: IQueryParams = {
            query,
            pagination
        };

        wrapDefaultDataResponse(res, dataCrudServiceWithRelators.queryNodes(req,
            collectionName, resultQuery)
            .then((result) => onSuccess ? onSuccess(req, res, result) : result)
        );
    };
}


export function createCreationRoute(collectionName: string, onSuccess?) {
    return function(req: Request, res, next) {
        const node = req.body;

        wrapDefaultDataResponse(res,  dataCrudServiceWithRelators.createNode(req, collectionName, node)
            .then((result) => onSuccess ? onSuccess(req, res, result): result)
        );
    };
}


export function createUpdateRoute(collectionName: string, onSuccess?) {
    return function(req: Request, res, next) {
        const node = req.body;

        wrapDefaultDataResponse(res,  dataCrudServiceWithRelators.updateNode(req, collectionName, node)
            .then((result) => onSuccess ? onSuccess(req, res, result): result)
        );
    };
}


export function createDeleteRoute(collectionName: string, onSuccess?) {
    return function(req: Request, res, next) {
        const nodeId = req['params'].id;

        wrapDefaultDataResponse(res, dataCrudServiceWithRelators.deleteNode(req, collectionName, {nodeId})
            .then((result) => onSuccess ? onSuccess(req, res, result): result)
        );
    };
}
