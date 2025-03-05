
export interface INodeChangeTask {
    type: string;
    dateTime: string;
    nodeId: string;
    priority?: number;
    executeDate?: string;
    additionalData?: any;
    executionCount?: number;
    skipCount?: number;
    _id?: string;
}
