import {INodeChangeTask} from './nodeChangeTask.interface';


export const NodeChangeTaskExecutorGroupName = 'NodeChangeTaskExecutor';


export abstract class NodeChangeTaskExecutor {

    abstract getType(): string;

    protected abstract processTask(req: Request, task: INodeChangeTask): Promise<any>;

    async skipTaskExecution(req: Request, task: INodeChangeTask): Promise<boolean> {
        return false;
    }

    extendLockTime(): number {
        return 0;
    }

    skipExecutionCountIncreasing(): boolean {
        return false;
    }

    async execute(req: Request, task: INodeChangeTask): Promise<boolean> {
        if (task.type !== this.getType()) {
            return false;
        }

        await this.processTask(req, task);

        return true;
    }
}
