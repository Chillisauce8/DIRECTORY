import {BaseTasksExecutorInvoker} from '../db';


export class NodeChangeTaskExecutorInvoker extends BaseTasksExecutorInvoker {

    protected getInvokeUrl(): string {
        return '/api/scheduler/executeNodeChangeTasks';
    }
}
