import * as _ from 'lodash';
import type { ICrudOptions, IDataCrud } from './data-crud.interface';
import {ValidationSchemaGenerator} from './schema-converter';
import {CollectionCrud} from './collection-crud';
import {AssociationTasksCreator} from './associations/associationTasksCreator';
import {AssociationTasksExecutorInvoker} from './associations/asociationTasksExecutorInvoker';
import {ERROR_REASON} from '../const';
import {asyncForEach} from 'x-utils';
import {coreServiceLocator} from '../serviceLocator';
import { AssociationsHelper, type IAssociationDetails } from './associations/associationsHelper';
import { AssociationCrud } from './associations/associationCrud';
import { ObjectId } from 'mongodb';


export interface IDefinitionWriteOptions {
    ignoreStateRestore?: boolean,
    ignoreRelators?: boolean,
}


export class DefinitionCrud {

    private privateSettings = coreServiceLocator.get('privateSettings');
    private STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');

    private collectionName: string = this.STANDARD_COLLECTIONS_DESCRIPTION.collections.name;
    private diffCollectionNameSuffix = ':diff';

    constructor(private crudHelper: IDataCrud,
                private collectionCrud: CollectionCrud,
                private validationSchemaGenerator: ValidationSchemaGenerator,
                private associationsHelper: AssociationsHelper,
                private associationTasksCreator: AssociationTasksCreator,
                private assocTasksExecutorInvoker: AssociationTasksExecutorInvoker,
                private associationCrud: AssociationCrud) {}

    public async getDefinitions(req: Request, query, pagination?): Promise<any> {
        return this.crudHelper.queryNodes(req, this.collectionName,
            {query, pagination} /*, {readFromCache: false}*/);
    }

    public async addDefinition(req: Request, type: string, schema: any, hasDb: boolean = true,
                               options?: IDefinitionWriteOptions): Promise<any> {
        const isCommonDefinitionForDefinitions = this.isCommonDefinitionForDefinitions(schema);

        if (!schema['title']) {
            const title = type.replace(/^is\:/, '');
            schema['title'] = _.capitalize(title);
        }

        const definition = {'name': type, ...schema};

        if (hasDb) {
            await this.resolveDefinitionRefs(req, definition);
        }

        if (!isCommonDefinitionForDefinitions) {
            await this.createOrUpdateCollection(req, type, definition, hasDb);
        }

        let definitionWithType;

        if (hasDb) {
            definitionWithType = await this.crudHelper.querySingleNode(req,
                this.collectionName, {query: {name: type}})
                .catch(error => {
                    if (error.reason === ERROR_REASON.objectNotFound) {
                        return null;
                    }

                    return Promise.reject(error);
                });
        }

        let result = definitionWithType;

        if (!definitionWithType) {
            result = await this.crudHelper.createNode(req, this.collectionName, definition);

            if (!isCommonDefinitionForDefinitions) {

                if (!options?.ignoreRelators) {
                    const tasksCreated = await this.makeTaskListForDefinitionUpdated(req, definition, true);
                    if (tasksCreated) {
                        this.assocTasksExecutorInvoker.invokeAsync();
                    }
                }
            }
        }

        return result;
    }

    public async updateDefinition(req: Request, definition: any, options?: IDefinitionWriteOptions): Promise<any> {
        await this.resolveDefinitionRefs(req, definition);

        let updatedDefinition = await this.crudHelper.updateNode(req, this.collectionName, definition,
            {ignoreStateRestore: options?.ignoreStateRestore});

        const isCommonDefinitionForDefinitions = this.isCommonDefinitionForDefinitions(definition);

        if (!isCommonDefinitionForDefinitions) {
            if (!options?.ignoreRelators) {
                let tasksCreated = await this.makeTaskListForDefinitionUpdated(req, definition, false);

                if (tasksCreated) {
                    await this.assocTasksExecutorInvoker.invokeAsync();
                }
            }

            await this.createOrUpdateCollection(req, updatedDefinition['name'], updatedDefinition, true);
        } else {
            await this.updateDefinitionsWithRefs(req);
        }

        return updatedDefinition;
    }

    public async getDefinitionById(req: Request, id: string, options?: ICrudOptions) {
        return this.getDefinition(req, {_id: new ObjectId(id)}, options);
    }

    public async getDefinitionByType(req: Request, type: string, options?: ICrudOptions) {
        const query = {
            $or: [
                {_type: type},
                {name: type}
            ]
        };

        return this.getDefinition(req, query, options);
    }

    public async getDefinitionByUrl(req: Request, url: string, siteArea: string): Promise<any> {
        if (!req?.['userDetails']) {
            return null;
        }

        const definition = await this.findDefinitionByUrl(req, url, siteArea);

        if (!definition) {
            return null;
        }

        const associationDetailList = this.associationsHelper.prepareAssociationDetailsForDefinition(definition);

        if (!associationDetailList) {
            return definition;
        }

        const sourceTypeList = _.chain(associationDetailList)
          .map(item => item.sourceType).uniq().value();

        const sourceDefinitionList = await this.getDefinitions(req,
            {name: {$in: sourceTypeList}});

        return {...definition, associationDetailList, sourceDefinitionList};
    }

    public async deleteDefinitionById(req: Request, id: string) {
        return this.deleteDefinition(req, {_id: new ObjectId(id)});
    }

    public async getDefinition(req: Request, query: any, options?: ICrudOptions): Promise<any> {
        return this.crudHelper.querySingleNode(req, this.collectionName, {query}, options);
    }

    private async createOrUpdateCollection(req: Request, name, definition, hasDb = true) {
        let hasCollection;

        if (hasDb) {
            hasCollection = await this.collectionCrud.hasCollection(req, name);
        } else {
            hasCollection = false;
        }

        if (!hasCollection) {
            await this.createCollectionForDefinition(req, name, definition);
            await this.createCollectionForDiff(req, name);
        } else {
            await this.updateCollectionValidatorForDefinition(req, name, definition);

            const diffCollectionName = this.getCollectionForDiffName(req, name);
            const hasDiffsCollection = await this.collectionCrud.hasCollection(req, diffCollectionName,
                {useRawCollectionName: true});

            if (!hasDiffsCollection) {
                await this.createCollectionForDiff(req, name);
            }
        }
    }

    private isCommonDefinitionForDefinitions(schema: any): boolean {
        return !!schema.definitions;
    }

    private async resolveDefinitionRefs(req: Request, schema: any): Promise<boolean> {
        const commonResolveMap = await this.fetchCommonResolveDefinitionsMap(req);
        return this.resolveDefinitionRefsRecursive(schema, commonResolveMap);
    }

    private async fetchCommonResolveDefinitionsMap(req: Request) {
        const schemas = await this.crudHelper.queryNodes(req, this.collectionName,
            {query: {definitions: {$exists: true}}});

        return _.assign({}, ..._.map(schemas, 'collections'));
    }

    private resolveDefinitionRefsRecursive(schema: any, commonResolveMap): boolean {
        let foundRefs = false;

        _.forIn(schema, (value, key) => {
            if (_.isObject(value)) {
                if (value['&ref'] || value['&refSource']) {
                    const refValue = value['&ref'] || value['&refSource'];

                    const resolveMapKey = refValue.split('/').slice(-1)[0];

                    const resolveValue = _.get(commonResolveMap, resolveMapKey, {});

                    schema[key] = {...resolveValue, '&refSource': refValue};
                    foundRefs = true;
                } else {
                    const result = this.resolveDefinitionRefsRecursive(value, commonResolveMap);
                    foundRefs = foundRefs || result;
                }
            }
        });

        return foundRefs;
    }

    private async makeTaskListForDefinitionUpdated(req: Request, data, isNew) {
        try {
            return this.associationTasksCreator.makeTaskListForDefinitionUpdated(data, isNew);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private async deleteDefinition(req: Request, query: any): Promise<any> {
        const definition = await this.getDefinitionById(req, query._id);

        const collectionName = definition['name'];

        await this.crudHelper.deleteNode(req, this.collectionName, {nodeId: query._id});

        const associationDetails = await this.associationCrud.queryAssocDetails({
            $or: [{'targetType': collectionName}, {'sourceType': collectionName}]
        });

        if (associationDetails.length) {
            associationDetails.forEach(async (assDetails: IAssociationDetails) => {
                const id = assDetails._id as string;
                await this.associationCrud.removeAssociationsByAssocDetailsId(id);
                await this.associationCrud.removeAssocDetail(id);
            });
        }

        await this.collectionCrud.dropCollection(req, collectionName);
    }

    private async createCollectionForDefinition(req: Request, name: string, definition: any) {
        const validator = this.validationSchemaGenerator.convertDefinitionToMongoValidator(definition);

        return this.collectionCrud.createCollection(req, name, {validator});
    }

    private async updateCollectionValidatorForDefinition(req: Request, type: string, definition: any) {
        const validator = this.validationSchemaGenerator.convertDefinitionToMongoValidator(definition);

        const commandAdditionalParams = {
            validationLevel: definition.validationLevel || 'strict',
            validationAction: definition.validationAction || 'error',
        };

        return this.collectionCrud.updateValidator(req, type, validator, commandAdditionalParams);
    }

    private getCollectionForDiffName(req: Request, name: string): string {
        return name + this.diffCollectionNameSuffix;
    }

    private async createCollectionForDiff(req: Request, name: string): Promise<any> {
        const diffCollectionName = this.getCollectionForDiffName(req, name);
        return this.collectionCrud.createCollection(req, diffCollectionName,
            {}, {useRawCollectionName: true});
    }

    private async updateDefinitionsWithRefs(req: Request) {
        const allDefinitions = await this.getDefinitions(req, {});

        await asyncForEach(allDefinitions, async (definition) => {
            const resolved = await this.resolveDefinitionRefs(req, definition);

            if (resolved) {
                await this.updateDefinition(req, definition);
            }
        });
    }

    private async findDefinitionByUrl(req: Request, url: string, siteArea: string): Promise<any> {
        const name = _.camelCase(url);
        const query = ['staff', 'master'].includes(siteArea) ?
          {$or: [{name: name}, {dataViews: {$elemMatch: {url}}}]} : {dataViews: {$elemMatch: {url}}};

        const definitionList = await this.crudHelper.queryNodes(req, this.collectionName, {query});

        if (!definitionList?.length) {
            return null;
        }

        // TODO: permissions there?
        for (const definition of definitionList) {
            if (!definition?.properties || _.isEmpty(definition.properties)) {
                continue;
            }

            const dataViews = definition.dataViews || [];

            if (!dataViews.length) {
                if (['staff', 'master'].includes(siteArea) && !definition.skipDefaultGrid) {
                    dataViews.push({
                        permission: `${siteArea}Area.lists.${name}`,
                    });
                } else {
                    continue;
                }
            }

            for (const dataView of dataViews) {
                // if (dataView?.url && dataView.url !== url) {
                //     continue;
                // }
                //
                // if (!dataView.permission) {
                //     if (['staff', 'master'].includes(siteArea) && this.privateSettings.ignorePermissions) {
                //         return definition;
                //     }
                //
                //     continue;
                // }
                //
                // const path = dataView.permission.split('.');
                //
                // if (path.length !== 3) {
                //     continue;
                // }
                //
                // if (path[0] !== `${siteArea}Area` || path[1] !== 'lists') {
                //     continue;
                // }
                //
                // const permissionsHelper = coreServiceLocator.get('permissionsHelper');
                // const isAllowed = await permissionsHelper.userHasPermissions(req, {
                //     name: path[2],
                //     action: PermissionAction.read,
                //     view: PermissionView.list,
                // });
                //
                // if (isAllowed) {
                //     return definition;
                // }

                return definition;
            }
        }

        return null;
    }
}
