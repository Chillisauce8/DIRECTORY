import type {INodeChangeTask} from './nodeChangeTask.interface';


export const NodeChangeTaskCreatorGroupName = 'NodeChangeTaskCreator';

export abstract class NodeChangeTaskCreator {

    async process(req: Request, nodeData: any, prevNodeData: any, diff?): Promise<INodeChangeTask[]> {
        if (this.isActualNode(nodeData, prevNodeData)) {
            if (this.needAsyncCheck()) {
                const checkResult = await this.asyncCheck(req, nodeData, prevNodeData);

                if (!checkResult) {
                    return [];
                }
            }

            if (this.isActualChangesForPreprocess(nodeData, prevNodeData)) {
                await this.preprocess(req, nodeData, prevNodeData);
            }

            if (this.isActualChanges(nodeData, prevNodeData, diff)) {
                const tasks = await this.prepareTasks(nodeData, prevNodeData, req);
                tasks.forEach(task => task.priority = this.getTaskPriority());
                return tasks;
            }
        }

        return [];
    }

    protected abstract isActualNode(nodeData: any, prevNodeData: any): boolean;

    protected abstract isActualChanges(nodeData: any, prevNodeData: any, diff?: any): boolean;

    protected abstract prepareTasks(nodeData: any, prevNodeData: any, req?: Request):
        Promise<Array<INodeChangeTask>>;

    protected isActualChangesForPreprocess(nodeData: any, prevNodeData: any): boolean {
        return false;
    }

    protected async preprocess(req: Request, nodeData: any, prevNodeData: any): Promise<any> {
      return;
    }

    protected needAsyncCheck(): boolean {
        return false;
    }

    protected async asyncCheck(req: Request, nodeData: any, prevNodeData: any): Promise<boolean> {
        return false;
    }

    protected getTaskPriority(): number {
        return 1;
    }
}
