import { DefinitionCrud } from './definition-crud';

const _ = require("lodash");
import * as BBPromise from 'bluebird';
import {ERROR_REASON} from "../const";
import {fixBadJson, objectPropertyByString} from 'x-utils';
import type { IDataCrud } from './data-crud.interface';
import { LoggingHelper } from '../utils';
import type { CacheHelper } from '../cache/cacheHelper';


const RELATORS_CACHE_SECONDS = 3600;


function isRelator(rel) {
    return rel && rel.id;
}


export interface RelatorChoicesParams {
    path: string;
    schema: string;
    additionalData?: {[index: string]: any},
    limitWithIdList?: string[];
    targetNodeId: string;
}

export enum DbTypeForRelator {
    application = 'application',
    common = 'common',
}


export class RelatorsManagement {

    constructor(private dataCrudService: IDataCrud,
                private definitionCrud: DefinitionCrud,
                private loggingHelper: LoggingHelper,
                private cacheHelper: CacheHelper,
    ) {
    }

    clearObjRelatorInternalFields(relatorData) {
        delete relatorData['ref'];
        delete relatorData['title'];
        delete relatorData['qname'];
        delete relatorData['typeQName'];
    }

    clearObjRelatorsInternalFields(obj) {
        if (isRelator(obj)) {
            this.clearObjRelatorInternalFields(obj);
        } else {
            for (let key in obj) {
                let dataItem = obj[key];

                if (Array.isArray(dataItem)) {
                    dataItem.forEach((item: any) => {
                        this.clearObjRelatorsInternalFields(item);
                    });

                } else if (isRelator(dataItem)){
                    this.clearObjRelatorInternalFields(dataItem);
                }
                else if (!_.isString(dataItem) && !_.isNumber(dataItem) && !_.isBoolean(dataItem)){
                    this.clearObjRelatorsInternalFields(dataItem);
                }
            }
        }
    }

    async getRelatorChoices(req: Request, params: RelatorChoicesParams) {
        const injectData = {};

        const {schema, path, additionalData, limitWithIdList, targetNodeId} = params;

        const schemaDefinition = await this.definitionCrud.getDefinitionByType(
            req, schema);
        const propertyWithRelator = this._getSchemaItem(schemaDefinition, path);

        if (!propertyWithRelator['_relator'] && !propertyWithRelator.join) {
            return BBPromise.reject({reason: ERROR_REASON.invalidData,
                message: 'Bad relator path ' + path });
        }

        const relatorSchema = propertyWithRelator['_relator'] || propertyWithRelator.join;

        const nodeType = relatorSchema['nodeType'] || relatorSchema['collection'];

        const titleFieldName = relatorSchema['x-title'] || relatorSchema['title'];

        let bind = relatorSchema['x-bind'] || relatorSchema['bind'];
        const bindAllMappings = relatorSchema['bind-all-mappings'] || relatorSchema['bindAll'];

        if (bindAllMappings) {
            bind = relatorSchema['mappings'];
        }

        if (!bind && relatorSchema['mappings']) {
            bind = relatorSchema['mappings'].filter(item => item.bind);
        }

        const select = relatorSchema['x-select'] || relatorSchema['select'];

        let queryParams = {};

        if (select) {
            let queryParamsString;

            if (_.isString(select)) {
                queryParamsString = fixBadJson(select);
            } else {
                // need deep copy because relatorSchema is cached so we will inject some data in original schema
                queryParamsString = JSON.stringify(select);
                queryParamsString = queryParamsString.replace(new RegExp('&', 'g'), '$');
                queryParamsString = queryParamsString.replace(new RegExp('__', 'g'), '.');
            }

            queryParams = JSON.parse(queryParamsString);
            this._injectQueryData(queryParams, injectData);
        }

        if (limitWithIdList) {
            queryParams['_id'] = {'$in': limitWithIdList};
        }

        return this._getRelators(req, nodeType, queryParams, titleFieldName, bind);
    }

    getRelatorsForType(req: Request, type, titleFieldName){
        return this._getRelators(req, type, {}, titleFieldName);
    }

    constructRelatorPropertyParams(nodeToRelateId: string, title?: string) {
        const res = {
            'id': nodeToRelateId
        };

        if (title) {
            res['title'] = title;
        }

        return res;
    }

    private _getSchemaItem(schemaDefinition, path) {

        if (!path) {
            return schemaDefinition;
        }

        let res = schemaDefinition.properties;
        const pathArray = path.split('.');
        let i = 0;

        for (; i < pathArray.length - 1; ++i) {
            res = res[pathArray[i].replace('[]', '')];

            if (res.type === 'array') {
                res = res.items;
            }

            if ('properties' in res) {
                res = res.properties;
            }
        }

        res = res[pathArray[i].replace('[]', '')];

        return res;
    }

    private _createResult(relators, bindProperties, originalData) {
        for (let i = 0; i < relators.length; ++i) {
            if (bindProperties && bindProperties.length) {
                for (let j in bindProperties) {
                    const toProperty = bindProperties[j]['toProperty'] || bindProperties[j]['to']
                        || bindProperties[j]['from'];
                    const fromProperty = bindProperties[j]['fromProperty'] || bindProperties[j]['from'];
                    relators[i][toProperty] = objectPropertyByString(originalData[i], fromProperty);
                }
            }
        }

        return relators;
    }

    private _injectQueryData(query, injectData) {
        for (let key in query) {
            if (query[key] !== null && typeof query[key] === 'object') {
                this._injectQueryData(query[key], injectData);
            } else {
                if (typeof query[key] === 'string') {

                    let injectDataKey;
                    let injectDataPath;

                    if (_.startsWith(query[key], 'this.')) {
                        const parts = query[key].split('.');
                        injectDataKey = parts[1];

                        if (parts.length > 2) {
                            injectDataPath = parts.splice(2, parts.length - 1).join('.');
                        }

                    } else if (_.startsWith(query[key], '&')) {
                        const parts = query[key].split('.');
                        injectDataKey = parts[0].replace('&', '');

                        if (parts.length > 1) {
                            injectDataPath = parts.splice(0, 1).join('.');
                        }
                    } else if (_.startsWith(query[key], 'G/')) {
                        const parts = query[key].split('.');
                        injectDataKey = parts[0].replace('G/', '');

                        if (parts.length > 1) {
                            injectDataPath = parts.splice(1, parts.length - 1).join('.');
                        }
                    }

                    if (!injectDataKey) {
                        continue;
                    }

                    let valueToInject = injectData[injectDataKey];

                    if (injectDataKey === 'supplier' && injectDataPath === 'id') {
                        injectDataPath = '_id';
                    }

                    if (injectDataPath) {
                        valueToInject = objectPropertyByString(valueToInject, injectDataPath);
                    }

                    if (!valueToInject) {
                        if (injectDataKey === 'supplier' && injectDataPath === 'subSuppliers.id') {
                            query[key] = [];
                        }
                    } else {
                        query[key] = valueToInject;
                    }
                }
            }
        }
    }

    private _createRelatorsWithTitle(nodes, titleField, type) {
        const result: Object[] = [];

        if (nodes && Array.isArray(nodes)){
            nodes.forEach(function(item) {

                let title = '';
                if (Array.isArray(titleField)) {
                    for (let i = 0; i < titleField.length; ++i) {
                        if (_.startsWith(titleField[i], '&')) {
                            title += objectPropertyByString(item, titleField[i].slice(1));
                        } else {
                            title += titleField[i];
                        }
                    }
                } else {
                    title = objectPropertyByString(item, titleField);
                }

                result.push({
                    id: item._id,
                    type: type,
                    title: title
                });
            });
        }

        return result;
    }

    private _getRelatorsFieldsQueryParam(titleField) {
        const fields = {};
        fields['_id'] = 1;

        if (Array.isArray(titleField)) {
            for (var i = 0; i < titleField.length; ++i) {
                if (_.startsWith(titleField[i], '&')) {
                    fields[titleField[i].slice(1)] = 1;
                }
            }
        } else {
            if (_.startsWith(titleField, '&')) {
                titleField = titleField.slice(1)
            }

            fields[titleField] = 1;
        }

        return fields;
    }

    private _getRelators(req: Request, type, queryParams, titleFieldName,
                         bind?: any) {
        const titleField = titleFieldName || 'title';

        const fields: any = this._getRelatorsFieldsQueryParam(titleField);

        let bindProperties = [];

        if (bind) {
            bindProperties = bind;

            if (!(bindProperties instanceof Array)) {
                bindProperties = [bindProperties];
            }

            for (let i in bindProperties) {
                const fromProperty = bindProperties[i]['fromProperty'] ||
                    bindProperties[i]['from'];
                fields[fromProperty] = 1;
            }
        }

        const query = {_fields: fields };
        _.extend(query, queryParams);

        const cacheKey = this.cacheHelper.createRelatorsListCacheKey(type, query);

        const getRelatorChoices = async () => {
            return this.dataCrudService.queryAllAvailableNodes(req,
                type, {query})
                .then((nodes) => {
                    if (nodes) {
                        const relatorsSourceData = this._createRelatorsWithTitle(nodes, titleField, type);
                        const data = this._batchConstructRelatorPropertyParams(relatorsSourceData);
                        return this._createResult(data, bindProperties, nodes);
                    }

                    return BBPromise.reject({
                        reason: ERROR_REASON.objectNotFound,
                        message: 'Not found type ' + type
                    });
                })
                .then(function (result) {
                    return result.sort(function sortFunction(item1, item2) {
                        const name1 = item1.title ? item1.title.toLowerCase() : item1.title;
                        const name2 = item2.title ? item2.title.toLowerCase() : item2.title;

                        if (name1 < name2) {
                            return -1;
                        }

                        if (name1 > name2) {
                            return 1;
                        }

                        return 0;
                    });
                });
        };

        const getAndCacheRelatorChoices = () => {
            return getRelatorChoices()
                .then((result) => {
                    return this.cacheHelper.writeToCache(req,
                            cacheKey, result, RELATORS_CACHE_SECONDS)
                        .then(() => {
                            return result;
                        })
                        .catch((err) => {
                            this.loggingHelper.toLogError(err);
                            return result;
                        });
                });
        };

        return this.cacheHelper.readFromCache(req, cacheKey)
            .then((data) => {
                if (data) {
                    return data;
                }

                return getAndCacheRelatorChoices();
            });
    }

    private _batchConstructRelatorPropertyParams(nodes) {
        const result: any[] = [];

        if (!nodes || !Array.isArray(nodes)) {
            return result;
        }

        nodes.forEach((item) => {
            result.push(this.constructRelatorPropertyParams(item.id, item.title));
        });

        return result;
    }
}


