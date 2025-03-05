import * as _ from "lodash";


export interface IAssociationDetails {
    targetType: string;
    targetPath: string;
    originalPath: string;
    sourceType: string;
    mappings: Array<any>;
    sync?: boolean;
    _id?: string;
}


export interface IRelatorTaskDetails {
    path: string;
    value: any;
}

export interface IUpdateSourceRelatorsTask {
    relatorDetails: IRelatorTaskDetails;
    taskType: string;
}


export interface IAssociation {
    associationDetailsId: string;
    targetId: string;
    sourceId: string;
    _id?: string;
}


export interface IRelatorMapping {
    fromProperty?: string;
    from?: string;
    toProperty?: string;
    to?: string;
    sync?: boolean;
    bind?: boolean;
}

export interface IRelatorDefinition {
    nodeType?: string;
    collection?: string;
    mappings: Array<IRelatorMapping>;
    sync?: boolean;
    syncAll?: boolean;
}


export const UpdateSourceRelatorsTaskTypes = {
    remove: 'remove',
    add: 'add',
    update: 'update'
};


export class AssociationsHelper {
    private _getDefinitionObject(definition: string | Object): Object {
        let definitionObject: any = definition;

        if (!_.isObject(definition)) {
            definitionObject = JSON.parse(<string>definition);
        }

        return definitionObject;
    }

    public getTypeForDefinition(definition: string | Object): string {
        const definitionObject = this._getDefinitionObject(definition);
        return definitionObject['_qname'];
    }

    public prepareAssociationDetailsForDefinition(definition: string | Object): Array<IAssociationDetails> {
        let definitionObject: any = this._getDefinitionObject(definition);

        const targetType = this.getTypeForDefinition(definitionObject);

        let associationDetailsArray: IAssociationDetails[] = [];

        this._traverseRelatorDefinitions(definitionObject, '',(key, originalPath, value) => {
            const targetPath = this._preparePathForNodes(originalPath);
            const associationDetails = this.prepareAssociationDetails(value, originalPath, targetPath, targetType);
            associationDetailsArray.push(associationDetails);
        });

        return associationDetailsArray;
    }

    public prepareAssociationDetails(relatorDefinition: IRelatorDefinition,
                                     originalPath: string,
                                     targetPath: string,
                                     targetType: string): IAssociationDetails {
        return {
            targetType: targetType,
            sourceType: (relatorDefinition.collection || relatorDefinition.nodeType || relatorDefinition.collection) as string,
            originalPath: originalPath,
            targetPath: targetPath,
            mappings: relatorDefinition.mappings,
            sync: relatorDefinition.sync || relatorDefinition.syncAll,
        };
    }

    public getRelatorsLikeFromData(data) {
        let result: Object[] = [];

        this._traverseRelators(data, '',(prevPath, value) => {
            let path = this._preparePathForNodes(prevPath);
            result.push({path, value});
        });

        return _.uniq(result);
    }

    public getRelatorObjects(data: Object, path: string, relatedId: string) {
        let results: Array<any> = [];

        let steps = path.split('.');
        let keyToCheck = steps[0];
        let nextSteps = steps.slice(1).join('.');

        let value = data[keyToCheck];

        if (data['id'] && data['id'] === relatedId) {
            results.push(data);
            return results;
        } else if (_.isArray(value)) {
            value.forEach((el) => {
                if (_.isObject(el)) {
                    results = results.concat(this.getRelatorObjects(el, nextSteps, relatedId));
                }
            });
        } else if (_.isObject(value) && steps.length >= 1) {
            results = results.concat(this.getRelatorObjects(value, nextSteps, relatedId));
        }

        return results;
    }

    public makeTaskListForNodeRelators(prevRelators, newRelators): Array<IUpdateSourceRelatorsTask> {
        let result: Array<IUpdateSourceRelatorsTask> = [];

        prevRelators.forEach(item => {
            if (!_.find(newRelators, newItem => {
                    return item.path === newItem.path && item.value.id === newItem.value.id;
                })) {
                result.push({
                    relatorDetails: item,
                    taskType: UpdateSourceRelatorsTaskTypes.remove
                });
            }
        });

        newRelators.forEach(item => {
            let prevRelatorDetails = _.find(prevRelators, newItem => {
                return item.path === newItem.path &&
                    item.value.id === newItem.value.id;
            });

            if (!prevRelatorDetails) {
                result.push({
                    relatorDetails: item,
                    taskType: UpdateSourceRelatorsTaskTypes.add
                });

            } else if (!_.isEqual(prevRelatorDetails.value, item.value)) {
                result.push({
                    relatorDetails: item,
                    taskType: UpdateSourceRelatorsTaskTypes.update
                });
            }
        });

        return result;
    }

    getSourceNodePropertyByPath(sourceNode, fromPropertyPath) {
        const path = _.trim(fromPropertyPath, '.');
        const pathSteps = path.split('.');

        let result = sourceNode;

        for (const step of pathSteps) {
            let newResult = result[step];

            if (!newResult) {
                newResult = _.get(result, ['data', step]);
            }

            if (!newResult) {
                return undefined;
            }

            result = newResult;
        }

        return result;
    }

    _traverseRelatorDefinitions(obj, prevPath, callback) {
        _.forIn(obj, (val, key) => {
            if (key === '_relator' || key === 'join') {
                callback(key, prevPath, val);
            } else if (_.isArray(val)) {
                val.forEach((el) => {
                    if (_.isObject(el)) {
                        this._traverseRelatorDefinitions(el, this._prepareFieldPath(prevPath, key), callback);
                    }
                });
            } else if (_.isObject(val)) {
                this._traverseRelatorDefinitions(obj[key], this._prepareFieldPath(prevPath, key), callback);
            }
        });
    }

    private _prepareFieldPath(prevPath: string, field: string) {
        if (prevPath) {
            return prevPath + '.' + field;
        } else {
            return field;
        }
    }

    private _traverseRelators(obj, prevPath, callback) {
        if (obj && obj['id'] && prevPath !== '._id') {
            callback(prevPath, obj);
            return;
        }

        _.forIn(obj, (val, key) => {
            if (_.isArray(val)) {
                val.forEach((el) => {
                    if (_.isObject(el)) {
                        this._traverseRelators(el, prevPath + '.' + key, callback);
                    }
                });
            } else if (_.isObject(val)) {
                this._traverseRelators(obj[key], prevPath + '.' + key, callback);
            }
        });
    }

    private _preparePathForNodes(rawPath) {
        let result = rawPath.replace(/\.?properties/g, '');
        result = result.replace(/\.?items/g, '');

        return _.trim(result, '.');
    }
}
