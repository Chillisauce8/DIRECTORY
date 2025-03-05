import * as _ from "lodash";
import {
  type IAddAssociationDetailsTask,
  type IAddAssociationTask,
  type IAssociationTask,
  type IMappingModifiedForAssociationDetailsTask,
  type IMappingModifiedForAssociationTask, type INodeRelatorsUpdatedTask,
  type IRemoveAssociationDetailsTask,
  type IRemoveAssociationTask, type ISourceNodeUpdatedTask, TaskTypes
} from './associationTask.interface';
import {AssociationTasksCreator} from './associationTasksCreator';
import {AssociationCrud} from './associationCrud';
import {AssociationTasksCrud} from './associationTasksCrud';
import {AssociationTasksChecker} from './associationTasksChecker';
import { AssociationsHelper, UpdateSourceRelatorsTaskTypes } from './associationsHelper';
import type { IAssociation, IAssociationDetails, IRelatorMapping, } from './associationsHelper';
import {AssociationTasksExecutorInvoker} from './asociationTasksExecutorInvoker';
import { DefinitionCrud } from '../definition-crud';
import type { IDataCrud } from '../data-crud.interface';
import { coreServiceLocator } from '../../serviceLocator';

var lockHelper = require('../../utils/lockHelper');
var privateSettings = require('../../../privateSettings');
let BBPromise = require('bluebird');
var constant = require('../../const');

const dbLogger = coreServiceLocator.get('dbLogger');


export const DELAY_BETWEEN_EXECUTIONS = 500;

export class AssociationTasksExecutor {

    private _inProgress = false;
    private readonly LOCK_ERROR_TEXT = 'ERROR: Exceeded 10 attempts to lock the resource';

    constructor(private assocCrud: AssociationCrud,
                private assocTaskCreator: AssociationTasksCreator,
                private assocTaskChecker: AssociationTasksChecker,
                private assocTaskCrud: AssociationTasksCrud,
                private associationsHelper: AssociationsHelper,
                private dataCrud: IDataCrud,
                private definitionCrud: DefinitionCrud,
                private assocTasksExecutorInvoker: AssociationTasksExecutorInvoker) {
        //
    }

    public async executeIfNotInProgress(req): Promise<any> {
        if (this._inProgress) {
            return;
        }

        return this.execute(req);
    }

    public async execute(req): Promise<any> {
        this.assocTasksExecutorInvoker.turnToDeferMode();

        try {
            await lockHelper.processWithLock('EXECUTE_ASSOCIATIONS_TASKS_NEW', lockHelper.DEFAULT_LOCK_TIME,
                async (lockInstance) => {
                    this._inProgress = true;
                    let tasks = await this.loadTasks(req);

                    if (privateSettings.CACHE.type && privateSettings.CACHE.type === 'redis' && tasks.length) {
                        lockInstance.extend(lockHelper.DEFAULT_LOCK_TIME + tasks.length * 2000);
                    }

                    return this.executeTaskList(req, tasks);
                });
        } catch (error) {
            let message = `ERROR: ${dbLogger.getErrorMessage(error)}`;

            if (message.startsWith(this.LOCK_ERROR_TEXT)) {
                return;
            }

            await dbLogger.saveError(req, message, dbLogger.ERROR_CATEGORIES.assocTask);
        } finally {
            this.assocTasksExecutorInvoker.turnToImmediateMode();
            this._inProgress = false;
        }
    }

    public async loadTasks(req): Promise<Array<IAssociationTask>> {
        return this.assocTaskCrud.readTasks();
    }

    public async executeTaskList(req, tasks: Array<IAssociationTask>) {
        for (let i = 0; i < tasks.length; ++i) {
            await BBPromise.delay(DELAY_BETWEEN_EXECUTIONS);

            const task = tasks[i];

            console.log(`associationTask ${i} type: ${task.taskType} executed`);

            switch (task.taskType) {
                case TaskTypes.addAssociationDetails:
                    await this.handleAddTaskForAssociationDetails(req, task);
                    break;
                case TaskTypes.removeAssociationDetails:
                    await this.handleRemoveTaskForAssociationDetails(req, task);
                    break;
                case TaskTypes.unsyncAssociationDetails:
                    await this.handleUnsyncAssociationDetails(req, task);
                    break;
                case TaskTypes.syncAssociationDetails:
                    await this.handleSyncAssociationDetails(req, task);
                    break;
                case TaskTypes.mappingModifiedForAssociationDetails:
                    await this.handleUpdateMappingTasksForAssociationDetails(req, task);
                    break;
                case TaskTypes.addAssociation:
                    await this.handleAddTaskForAssociation(req, task);
                    break;
                case TaskTypes.removeAssociation:
                    await this.handleRemoveTaskForAssociation(req, task);
                    break;
                case TaskTypes.mappingModifiedForAssociation:
                    await this.handleModifiedForTaskForAssociation(req, task);
                    break;
                case TaskTypes.nodeRelatorsUpdated:
                    await this.handleNodeRelatorsUpdated(req, task);
                    break;
                case TaskTypes.sourceNodeUpdated:
                    await this.handleSourceNodeUpdatedTask(req, task);
                    break;
            }
        }

        if (tasks.length > 0) {
            this.assocTasksExecutorInvoker.invokeAsync();
        }
    }

    public async handleAddTaskForAssociationDetails(req, task: IAddAssociationDetailsTask) {
        try {
            let associationDetails = task.data.associationDetails;

            let query = {targetType: associationDetails.targetType, targetPath: associationDetails.targetPath,
                sourceType: associationDetails.sourceType};

            let existing = await this.assocCrud.queryAssocDetails(query);

            if (existing.length) {
                return this._removeTask(task);
            }

            let need = await this.assocTaskChecker.needAddAssociationDetails(req, associationDetails);

            if (!need) {
                return this._removeTask(task);
            }

            await this.assocCrud.createAssocDetail(associationDetails);

            await this._removeTask(task);

        } catch(err) {
            await this._saveTaskError(req, task, err);
        }
    }

    public async handleRemoveTaskForAssociationDetails(req, task: IRemoveAssociationDetailsTask) {
        try {
            const assocDetailsId = task.data.associationDetailsId;

            const associationDetailsInstance = await this.assocCrud.getAssocDetailsById(assocDetailsId);

            if (!associationDetailsInstance) {
                return this._removeTask(task);
            }

            const need = await this.assocTaskChecker.needRemoveAssociationDetails(req, associationDetailsInstance);

            if (!need) {
                return this._removeTask(task);
            }

            await this.assocCrud.removeAssociationsByAssocDetailsId(assocDetailsId.toString());
            await this.assocCrud.removeAssocDetail(assocDetailsId);

            await this._removeTask(task);
        } catch(err) {
            this._saveTaskError(req, task, err);
        }
    }

    public async handleUnsyncAssociationDetails(req, task: IAssociationTask) {
        try {
            const assocDetailsId = task.data.associationDetailsId;

            const associationDetailsInstance = await this.assocCrud.getAssocDetailsById(assocDetailsId);

            if (!associationDetailsInstance) {
                return this._removeTask(task);
            }

            associationDetailsInstance.sync = false;

            await this.assocCrud.updateAssociationDetail(assocDetailsId, associationDetailsInstance);

            await this._removeTask(task);
        } catch(err) {
            this._saveTaskError(req, task, err);
        }
    }

    public async handleSyncAssociationDetails(req, task: IAssociationTask) {
        try {
            const assocDetailsId = task.data.associationDetailsId;

            const associationDetailsInstance = await this.assocCrud.getAssocDetailsById(assocDetailsId);

            if (!associationDetailsInstance) {
                return this._removeTask(task);
            }

            associationDetailsInstance.sync = true;

            await this.assocCrud.updateAssociationDetail(assocDetailsId, associationDetailsInstance);

            await this._removeTask(task);
        } catch(err) {
            this._saveTaskError(req, task, err);
        }
    }

    public async handleUpdateMappingTasksForAssociationDetails(req, task: IMappingModifiedForAssociationDetailsTask) {
        try {
            const assocDetailsId = task.data.associationDetails._id;

            let associationDetailsInstance = await this.assocCrud.getAssocDetailsById(assocDetailsId as string);

            if (!associationDetailsInstance) {
                return this._removeTask(task);
            }

            let need = await this.assocTaskChecker.needUpdateMappingTasksForAssociationDetails(req, associationDetailsInstance);

            if (!need) {
                return this._removeTask(task);
            }

            await this.assocTaskCreator.makeTasksUpdateMappingForAssociations(associationDetailsInstance);

            const updatedMapping = task.data.associationDetails.mappings;

            await this.assocCrud.updateAssocDetailMapping(assocDetailsId as string, updatedMapping);

            await this._removeTask(task);
        } catch(err) {
            await this._saveTaskError(req, task, err);
        }
    }

    public async handleSourceNodeUpdatedTask(req, task: ISourceNodeUpdatedTask) {
        try {
            let diff = task.data.diff;
            let nodeType = task.data.nodeType;
            let nodeId = task.data.nodeId;

            const publicNodeType = constant.dataTypesToCollectionPublicNames[nodeType] || nodeType;

            let associationsDetailsList = await this.assocCrud.queryAssocDetails({sourceType: publicNodeType});

            associationsDetailsList = associationsDetailsList.filter(associationsDetailsItem => {
                if (!associationsDetailsItem.mappings || associationsDetailsItem.sync === false) {
                    return false;
                }

                const mappedPaths = associationsDetailsItem.mappings
                    .filter((item: IRelatorMapping) => {
                        return item.sync !== false;
                    })
                    .map((item: IRelatorMapping) => {
                        return item.fromProperty || item.from;
                    });

                return _.some(mappedPaths, path => {
                   const valueFromDiff = this.associationsHelper.getSourceNodePropertyByPath(diff, path);
                   return !!valueFromDiff;
                });
            });

            await BBPromise.each(associationsDetailsList, async (associationDetails: IAssociationDetails) => {
                let associationDetailsId = associationDetails._id;

                let query = {sourceId: nodeId, associationDetailsId: associationDetailsId};
                let associations = await this.assocCrud.queryAssociations(query);

                return BBPromise.each(associations, association => {
                   return this.assocTaskCreator.makeTaskUpdateMappingForAssociations(associationDetailsId as string,
                       association.sourceId, association.targetId);
                });
            });

            await this._removeTask(task);
        } catch(err) {
            await this._saveTaskError(req, task, err);
        }
    }

    public async handleNodeRelatorsUpdated(req, task: INodeRelatorsUpdatedTask) {
        try {
            const updateSourceRelatorsTasks = task.data.updateSourceRelatorsTasks;
            const targetId = task.data.nodeId;
            const targetType = task.data.nodeType;

            const publicTargetType = constant.dataTypesToCollectionPublicNames[targetType] || targetType;

            let definition = await this.definitionCrud.getDefinitionByType(req, targetType);

            let preparedAssociationDetailsList = this.associationsHelper.prepareAssociationDetailsForDefinition(definition);

            await BBPromise.each(updateSourceRelatorsTasks, async (relatorTask) => {
                let sourceId = relatorTask.relatorDetails.value.id;
                let targetPath = relatorTask.relatorDetails.path;

                let properAssociationDetails = _.find(preparedAssociationDetailsList, (item: IAssociationDetails) => {
                    return item.targetType === publicTargetType && item.targetPath === targetPath;
                });

                if (!properAssociationDetails) {
                    return;
                }

                let query = {targetType: publicTargetType, targetPath, sourceType: properAssociationDetails.sourceType};

                let associationDetailsList = await this.assocCrud.queryAssocDetails(query);
                let associationDetails = associationDetailsList[0];

                if (!associationDetails) {
                    return;
                }

                switch (relatorTask.taskType) {
                    case UpdateSourceRelatorsTaskTypes.add:
                        return this.assocTaskCreator.makeTaskAddAssociation(
                            associationDetails._id as string, sourceId, targetId);
                    case UpdateSourceRelatorsTaskTypes.update:
                        return this.assocTaskCreator.makeTaskUpdateMappingForAssociations(
                            associationDetails._id as string, sourceId, targetId);
                    case UpdateSourceRelatorsTaskTypes.remove:
                        let associations = await this.assocCrud.queryAssociations({
                            associationDetailsId: associationDetails._id, sourceId, targetId});

                        if (associations.length) {
                            return this.assocTaskCreator.makeTaskRemoveAssociation(associations[0]._id as string);
                        }
                }
            });

            await this._removeTask(task);
        } catch(err) {
            await this._saveTaskError(req, task, err);
        }
    }

    public async handleAddTaskForAssociation(req, task: IAddAssociationTask) {
        try {
            let associationDetailsId = task.data.associationDetailsId;
            let sourceId = task.data.sourceId;
            let targetId = task.data.targetId;

            let associations = await this.assocCrud.queryAssociations({associationDetailsId, sourceId, targetId});

            if (associations.length) {
                return this._removeTask(task);
            }

            let need = await this.assocTaskChecker.needAddAssociation(req, associationDetailsId, sourceId, targetId);

            if (!need) {
                return this._removeTask(task);
            }

            await this.assocCrud.createAssociation(associationDetailsId, sourceId, targetId);

            await this._removeTask(task);

        } catch(err) {
            await this._saveTaskError(req, task, err);
        }
    }

    public async handleRemoveTaskForAssociation(req, task: IRemoveAssociationTask) {
        try {
            let associationId = task.data.associationId;

            let existingAssociation = await this.assocCrud.getAssociationById(associationId.toString());

            if (!existingAssociation) {
                return this._removeTask(task);
            }

            let need = await this.assocTaskChecker.needRemoveAssociation(req, existingAssociation);

            if (!need) {
                return this._removeTask(task);
            }

            await this.assocCrud.removeAssociation(associationId);

            await this._removeTask(task);

        } catch(err) {
            await this._saveTaskError(req, task, err);
        }
    }

    public async handleModifiedForTaskForAssociation(req, task: IMappingModifiedForAssociationTask) {

        try {
            let associationDetailsId = task.data.associationDetailsId;
            let sourceId = task.data.sourceId;
            let targetId = task.data.targetId;

            let existingAssociations = await this.assocCrud.queryAssociations({associationDetailsId, sourceId, targetId});

            if (!existingAssociations.length) {
                return this._removeTask(task);
            }

            let assocDetail = await this.assocCrud.getAssocDetailsById(associationDetailsId);

            if (!assocDetail) {
                return this._removeTask(task);
            }

            let association = existingAssociations[0];

            await lockHelper.processWithLock(association.targetId, lockHelper.DEFAULT_LOCK_TIME,
                async () => {
                    return this._updateMapping(req, assocDetail, association);
                });

            await this._removeTask(task);

        } catch(err: any) {
            if (err?.message.startsWith('Node not found')) {
                await this._removeTask(task);
            }

            await this._saveTaskError(req, task, err);
        }
    }

    private async _removeTask(task: IAssociationTask) {
        return this.assocTaskCrud.removeTask(task);
    }

    private async _getTargetNode(req, assocDetail: IAssociationDetails, targetId: string): Promise<any> {
        return this.dataCrud.readNode(req, assocDetail.targetType, {nodeId: targetId},
          {readFromCache: false});
    }

    private async _saveTargetNode(req, assocDetail: IAssociationDetails, node: any): Promise<any> {
        return this.dataCrud.updateNode(req, assocDetail.targetType, node);
    }

    private async _updateMapping(req, assocDetail: IAssociationDetails, association: IAssociation): Promise<any> {
        const targetNode = await this._getTargetNode(req, assocDetail, association.targetId);
        const mappingValues = await this.assocCrud.getAssociatedValues(assocDetail, association.sourceId);

        const relatorsObjects = this.associationsHelper.getRelatorObjects(targetNode, assocDetail.targetPath,
            association.sourceId);

        let legalFields = _.keys(mappingValues).concat(['id', 'title']);

        const definition = await this.definitionCrud.getDefinitionByType(req, assocDetail.targetType);
        const additionalFieldProperties = _.get(definition, assocDetail.originalPath + '.properties');

        if (additionalFieldProperties) {
            legalFields = [...legalFields, ...Object.keys(additionalFieldProperties)];
        }

        relatorsObjects.forEach(relatorItem => {
            _.assign(relatorItem, mappingValues);

            _.keys(relatorItem).forEach(key => {
                if (!_.includes(legalFields, key)) {
                    delete relatorItem[key];
                }
            })
        });

        console.log('Update mapping for:', targetNode._id);
        return this._saveTargetNode(req, assocDetail, targetNode);
    }

    private async _saveTaskError(req, task: IAssociationTask, error) {
        let taskStr = JSON.stringify(task);
        let message = `${taskStr} ERROR: ${dbLogger.getErrorMessage(error)}`;
        await dbLogger.saveError(req, message, dbLogger.ERROR_CATEGORIES.assocTask);
    }
}
