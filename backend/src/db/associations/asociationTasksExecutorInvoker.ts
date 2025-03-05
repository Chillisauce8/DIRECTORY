import { BaseTasksExecutorInvoker } from '../../utils/baseTasksExecutorInvoker';


export class AssociationTasksExecutorInvoker extends BaseTasksExecutorInvoker {

    protected getInvokeUrl(): string {
        return '/api/scheduler/executeAssociationTasks';
    }
}
