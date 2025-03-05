import type {IAssociationDetails, IUpdateSourceRelatorsTask} from './associationsHelper';

export type TaskType =
    'addAssociation' | 'removeAssociation' | 'mappingModifiedForAssociation' |
    'addAssociationDetails' | 'removeAssociationDetails' | 'mappingModifiedForAssociationDetails' |
    'sourceNodeUpdated' | 'nodeRelatorsUpdated' |
    string;


export const TaskTypes: {[action: string]: TaskType} = {
    addAssociation: 'addAssociation',
    removeAssociation: 'removeAssociation',
    unsyncAssociationDetails: 'unsyncAssociationDetails',
    syncAssociationDetails: 'syncAssociationDetails',
    mappingModifiedForAssociation: 'mappingModifiedForAssociation',
    addAssociationDetails: 'addAssociationDetails',
    removeAssociationDetails: 'removeAssociationDetails',
    mappingModifiedForAssociationDetails: 'mappingModifiedForAssociationDetails',
    sourceNodeUpdated: 'sourceNodeUpdated',
    nodeRelatorsUpdated: 'nodeRelatorsUpdated'
};


export interface IAssociationTask {
    taskType: TaskType;
    data: any;
    dateTime?: string;
    _id?: string;
}


export interface IAddAssociationTask extends IAssociationTask {
    data: {
        sourceId: string;
        targetId: string;
        associationDetailsId: string;
    };
}

export interface IRemoveAssociationTask extends IAssociationTask {
    data: {
        associationId: string;
    };
}

export interface IMappingModifiedForAssociationTask extends IAssociationTask {
    data: {
        sourceId: string;
        targetId: string;
        associationDetailsId: string;
    };
}

export interface IAddAssociationDetailsTask extends IAssociationTask {
    data: {
        associationDetails: IAssociationDetails;
    };
}

export interface IRemoveAssociationDetailsTask extends IAssociationTask {
    data: {
        associationDetailsId: string;
    };
}

export interface IMappingModifiedForAssociationDetailsTask extends IAssociationTask {
    data: {
        associationDetails: IAssociationDetails;
    };
}

export interface ISourceNodeUpdatedTask extends IAssociationTask {
    data: {
        diff: Object,
        nodeType: string;
        nodeId: string;
    };
}

export interface INodeRelatorsUpdatedTask extends IAssociationTask {
    data: {
        nodeId: string;
        nodeType: string;
        updateSourceRelatorsTasks: Array<IUpdateSourceRelatorsTask>
    };
}


export const ASSOCIATION_TASKS_COLLECTION_NAME: string = 'associationTasks';
