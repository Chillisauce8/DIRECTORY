import * as _ from 'lodash';
import {AssociationsHelper} from './associationsHelper';
import type {IAssociation, IAssociationDetails, IUpdateSourceRelatorsTask} from './associationsHelper';
import {
  type IAddAssociationDetailsTask, type IAddAssociationTask,
  type IAssociationTask, type IMappingModifiedForAssociationDetailsTask, type IMappingModifiedForAssociationTask,
  type IRemoveAssociationDetailsTask, type IRemoveAssociationTask,
  type TaskType, type INodeRelatorsUpdatedTask, type ISourceNodeUpdatedTask, TaskTypes
} from './associationTask.interface';
import {AssociationTasksCrud} from './associationTasksCrud';
import {DateHelper} from 'x-utils';
import {associationCrud, AssociationCrud} from './associationCrud';
var constant = require('../../const');


export class AssociationTasksCreator {

    private _dateHelper = new DateHelper();

    constructor(private assocTaskCrud: AssociationTasksCrud,
                private assocHelper: AssociationsHelper,
                private assocCrud: AssociationCrud) {}

    public prepareTask(taskType: TaskType, data: any): IAssociationTask {
        return {
            taskType, data, dateTime: this._getCurrentDateTime()
        };
    }

    public prepareRemoveAssociationDetailsTask(associationDetailsId: string): IRemoveAssociationDetailsTask {
        return this.prepareTask(TaskTypes.removeAssociationDetails, {associationDetailsId});
    }

    public async makeRemoveAssociationDetailsTask(associationDetailsId: string) {
        let task = this.prepareRemoveAssociationDetailsTask(associationDetailsId);
        return this.assocTaskCrud.createTask(task);
    }

    public prepareUnsyncAssociationDetailsTask(associationDetailsId: string): IRemoveAssociationDetailsTask {
        return this.prepareTask(TaskTypes.unsyncAssociationDetails, {associationDetailsId});
    }

    public prepareSyncAssociationDetailsTask(associationDetailsId: string): IRemoveAssociationDetailsTask {
        return this.prepareTask(TaskTypes.syncAssociationDetails, {associationDetailsId});
    }

    public prepareAddAssociationDetailsTask(associationDetails: IAssociationDetails): IAddAssociationDetailsTask {
        return this.prepareTask(TaskTypes.addAssociationDetails, {associationDetails});
    }

    public prepareMappingModifiedForAssociationDetailsTask(associationDetails: IAssociationDetails): IMappingModifiedForAssociationDetailsTask {
        return this.prepareTask(TaskTypes.mappingModifiedForAssociationDetails, {associationDetails});
    }

    public prepareTasksForChangedAssociationDetails(prevAssociationDetailsArray: Array<IAssociationDetails>,
                                                newAssociationDetailsArray: Array<IAssociationDetails>): Array<IAssociationTask> {
        let result: Array<IAssociationTask> = [];

        prevAssociationDetailsArray.forEach(item => {
            if (!_.find(newAssociationDetailsArray, newItem => {
                    return item.sourceType === newItem.sourceType && item.targetPath === newItem.targetPath;
                })
            ) {
                result.push(this.prepareRemoveAssociationDetailsTask(item._id as string));
            }
        });

        newAssociationDetailsArray.forEach(item => {
            const tasks = this.prepareAssociationTaskFor(item, prevAssociationDetailsArray);

            if (tasks.length) {
                result = [...result, ...tasks];
            }
        });

        return result;
    }

    public prepareAssociationTaskFor(newAssociationDetailsItem: IAssociationDetails,
                                     prevAssociationDetailsArray: IAssociationDetails[]): IAssociationTask[] {
        const prevAssociationDetails = _.find(prevAssociationDetailsArray, newItem => {
            return newAssociationDetailsItem.sourceType === newItem.sourceType &&
              newAssociationDetailsItem.targetPath === newItem.targetPath;
        });

        const result: IAssociationTask[] = [];

        if (!prevAssociationDetails && !!newAssociationDetailsItem.mappings) {
            result.push(this.prepareAddAssociationDetailsTask(newAssociationDetailsItem));
        } else if (prevAssociationDetails && (!newAssociationDetailsItem.mappings ||
          !newAssociationDetailsItem.mappings.length)) {
            result.push(this.prepareRemoveAssociationDetailsTask(prevAssociationDetails._id as string));
        } else if (prevAssociationDetails && newAssociationDetailsItem.sync === false) {
            result.push(this.prepareUnsyncAssociationDetailsTask(prevAssociationDetails._id as string));
        } else if (prevAssociationDetails && prevAssociationDetails.sync === false &&
          newAssociationDetailsItem.sync !== false) {
            result.push(this.prepareSyncAssociationDetailsTask(prevAssociationDetails._id as string));
        }

        if (prevAssociationDetails) {
            const hadMapping = !!prevAssociationDetails.mappings;
            const hasMapping = !!newAssociationDetailsItem.mappings;
            if ((hadMapping || hasMapping) && !_.isEqual(prevAssociationDetails.mappings,
              newAssociationDetailsItem.mappings)) {
                const associationDetailForTask = _.assign({}, prevAssociationDetails, newAssociationDetailsItem);
                result.push(this.prepareMappingModifiedForAssociationDetailsTask(associationDetailForTask));
            }
        }

        return result;
    }

    public async makeTaskListForDefinitionUpdated(definition: any, isNew?: boolean) {

        const associationDetailList = this.assocHelper.prepareAssociationDetailsForDefinition(definition);

        const query = {
            targetType: this.assocHelper.getTypeForDefinition(definition)
        };

        const oldAssociationDetailList = isNew ? [] : await this.assocCrud.queryAssocDetails(query);

        let tasks = this.prepareTasksForChangedAssociationDetails(oldAssociationDetailList, associationDetailList);
        await this.assocTaskCrud.createTasks(tasks);

        return !!tasks.length;
    }

    public prepareTaskAddAssociation(associationDetailsId: string, sourceId: string, targetId: string): IAddAssociationTask {
        return this.prepareTask(TaskTypes.addAssociation, {associationDetailsId, sourceId, targetId});
    }

    public async makeTaskAddAssociation(associationDetailsId: string, sourceId: string, targetId: string) {
        let task = this.prepareTaskAddAssociation(associationDetailsId, sourceId, targetId);
        return this.assocTaskCrud.createTask(task);
    }

    public prepareTaskRemoveAssociation(associationId: string): IRemoveAssociationTask {
        return this.prepareTask(TaskTypes.removeAssociation, {associationId});
    }

    public async makeTaskRemoveAssociation(associationId: string) {
        let task = this.prepareTaskRemoveAssociation(associationId);
        return this.assocTaskCrud.createTask(task);
    }

    public async makeTasksRemoveAssociationsForTarget(targetId: string) {
        let associationsToTarget = await associationCrud.queryAssociations({targetId});

        if (!associationsToTarget.length) {
            return;
        }

        let tasks = associationsToTarget.map(assoc => {
            return this.prepareTaskRemoveAssociation(assoc._id as string);
        });

        return this.assocTaskCrud.createTasks(tasks);
    }

    public async makeTasksRemoveAssociationsForSource(sourceId: string) {
        let associationsFromSource = await associationCrud.queryAssociations({sourceId});

        if (!associationsFromSource.length) {
            return;
        }

        let tasks = associationsFromSource.map(assoc => {
            return this.prepareTaskRemoveAssociation(assoc._id as string);
        });

        return this.assocTaskCrud.createTasks(tasks);
    }

    public prepareTaskForAssociationsMappingUpdated(associationDetailsId: string, sourceId: string, targetId: string): IMappingModifiedForAssociationTask {
        return this.prepareTask(TaskTypes.mappingModifiedForAssociation, {associationDetailsId, sourceId, targetId});
    }

    public async makeTaskUpdateMappingForAssociations(associationDetailsId: string, sourceId: string, targetId: string) {
        let task = this.prepareTaskForAssociationsMappingUpdated(associationDetailsId, sourceId, targetId);
        return this.assocTaskCrud.createTask(task);
    }

    public async makeTasksUpdateMappingForAssociations(associationDetails: IAssociationDetails) {
        let associations = await this.assocCrud.getAssociationsByAssocDetailsId(associationDetails._id as string);

        let tasks = associations.map((association: IAssociation) => {
            return this.prepareTaskForAssociationsMappingUpdated(associationDetails._id as string, association.sourceId,
                association.targetId);
        });

        return this.assocTaskCrud.createTasks(tasks);
    }

    public prepareTaskForSourceNodeUpdated(diffResult: Object, nodeId: string, nodeType: string): ISourceNodeUpdatedTask {
        return this.prepareTask(TaskTypes.sourceNodeUpdated, {diff: diffResult, nodeId, nodeType});
    }

    public prepareTaskForNodeRelatorsUpdated(nodeId: string, nodeType: string,
                                             updateSourceRelatorsTasks: Array<IUpdateSourceRelatorsTask>): INodeRelatorsUpdatedTask {
        const publicNodeType = constant.dataTypesToCollectionPublicNames[nodeType] || nodeType;
        return this.prepareTask(TaskTypes.nodeRelatorsUpdated, {nodeId, nodeType: publicNodeType,
            updateSourceRelatorsTasks});
    }

    public async makeTaskForSourceNodeUpdated(diffResult: Object, nodeId: string, nodeType: string) {
        const task = this.prepareTaskForSourceNodeUpdated(diffResult, nodeId, nodeType);
        return this.assocTaskCrud.createTask(task);
    }

    public async makeTaskToProcessChangesForNodeRelators(nodeId: string, nodeType: string,
                                                         updateSourceRelatorsTasks: Array<IUpdateSourceRelatorsTask>) {
        let task = this.prepareTaskForNodeRelatorsUpdated(nodeId, nodeType, updateSourceRelatorsTasks);
        return this.assocTaskCrud.createTask(task);
    }

    private _getCurrentDateTime(): string {
        return this._dateHelper.saveDateTimeFormat(new Date());
    }
}

