import { BaseDataCrud } from './base-data-crud';

import * as _ from 'lodash';
import { EventEmitter } from '../utils';
import { AssociationTasksCreator } from './associations/associationTasksCreator';
import {AssociationsHelper, UpdateSourceRelatorsTaskTypes} from './associations/associationsHelper';
import type {IAssociationDetails, IUpdateSourceRelatorsTask, } from './associations/associationsHelper';
import { ObjectId } from 'mongodb';
import { AssociationCrud } from './associations/associationCrud';


export const associationActionsEmitter: any = new EventEmitter();

export const UpdateAssociationsOnChangesSignalName = 'updateAssociationsOnChanges';
export const UpdateNodeForSourceRelatorsTasksSignalName = 'updateNodeForSourceRelatorsTasks';


export class DataCrudWithRelatorsEventsExecutor {
    constructor(
        private associationTasksCreator: AssociationTasksCreator,
        private associationsHelper: AssociationsHelper,
        private associationCrud: AssociationCrud,
        private baseDataCrud: BaseDataCrud,
    ) {
        this.init();
    }

    private init() {
        associationActionsEmitter.on(UpdateAssociationsOnChangesSignalName,
            async (req, collectionName, nodeId, diffResult) => {
            this.updateAssociationsOnChanges(req, collectionName, nodeId, diffResult);
        });

        associationActionsEmitter.on(UpdateNodeForSourceRelatorsTasksSignalName,
            async (req, nodeBody, updateSourceRelatorsTasks, associationDetails) => {
            await this.updateNodeForSourceRelatorsTasks(req, nodeBody,
                    updateSourceRelatorsTasks, associationDetails);
        });
    }

    private async updateAssociationsOnChanges(req: Request, collectionName: string,
                                        nodeId: string, diffResult) {
        const hasAssociationsFromSource =
            await this.associationCrud.hasAssociationsFromSource(nodeId);

        if (!hasAssociationsFromSource) {
            return;
        }

        await this.associationTasksCreator.makeTaskForSourceNodeUpdated(diffResult, nodeId, collectionName);
    }

    private async updateNodeForSourceRelatorsTasks(req: Request, nodeBody: any,
                                                   updateSourceRelatorsTasks: Array<IUpdateSourceRelatorsTask>,
                                                   associationDetails: IAssociationDetails[]) {
        const promises = updateSourceRelatorsTasks.map((updateSourceRelatorsTask) => {
            if (updateSourceRelatorsTask.taskType === UpdateSourceRelatorsTaskTypes.add) {
                return this.setMappingForRelator(req, nodeBody, updateSourceRelatorsTask.relatorDetails,
                    associationDetails);
            } else if (updateSourceRelatorsTask.taskType === UpdateSourceRelatorsTaskTypes.update) {
                return this.setMappingForRelator(req, nodeBody, updateSourceRelatorsTask.relatorDetails,
                    associationDetails);
            }
        });

        await Promise.all(promises);

        updateSourceRelatorsTasks = updateSourceRelatorsTasks.filter(item =>
            item.taskType !== UpdateSourceRelatorsTaskTypes.update);

        if (updateSourceRelatorsTasks.length) {
            this.saveTasksToUpdateAssociations(req, nodeBody._id, nodeBody._type,
                updateSourceRelatorsTasks);
        }
    }

    private async saveTasksToUpdateAssociations(req: Request, nodeId: string, nodeType: string,
                                                updateSourceRelatorsTasks: Array<IUpdateSourceRelatorsTask>) {
        await this.associationTasksCreator.makeTaskToProcessChangesForNodeRelators(nodeId, nodeType,
            updateSourceRelatorsTasks);
    }

    private async setMappingForRelator(req: Request, node, relatorsDetailsItem,
                                       associationDetails: IAssociationDetails[]) {
        const associationDetailForRelator = _.find(associationDetails, associationDetailsItem => {
            return associationDetailsItem.targetPath === relatorsDetailsItem.path;
        });

        if (!associationDetailForRelator || !associationDetailForRelator.mappings ||
            !associationDetailForRelator.mappings.length) {
            return Promise.resolve();
        }

        const mappedFields = associationDetailForRelator.mappings.map(item => item.fromProperty || item.from);
        const _fields = _.reduce(mappedFields, (obj, field) => {
            obj[_.trim(field, '.')] = 1;
            return obj;
        }, {});


        const sourceNode = await this.baseDataCrud.querySingleNode(req,
            associationDetailForRelator.sourceType,
            {query: {_id: new ObjectId(relatorsDetailsItem.value.id), _fields}});

        const relatorsObjects = this.associationsHelper.getRelatorObjects(node,
            relatorsDetailsItem.path, relatorsDetailsItem.value.id);

        relatorsObjects.forEach(relatorItem => {
            associationDetailForRelator.mappings.forEach(mappingsItem => {
                const mappedValue = this.associationsHelper.getSourceNodePropertyByPath(sourceNode,
                    mappingsItem.fromProperty || mappingsItem.from);
                const toProperty = mappingsItem.toProperty || mappingsItem.to || mappingsItem.from;
                relatorItem[toProperty] = mappedValue;
            });
        });
    };
}
