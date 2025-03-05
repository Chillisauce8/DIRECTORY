export const NodeChangesSyncExecutorGroupName = 'NodeChangesSyncExecutor';


export abstract class NodeChangesSyncExecutor {

    async process(req: Request, nodeData: any, prevNodeData: any, diff?): Promise<any> {
        if (this.isActualNode(nodeData, prevNodeData)) {
            if (this.needAsyncCheck()) {
                const checkResult = await this.asyncCheck(req, nodeData, prevNodeData);

                if (!checkResult) {
                    return;
                }
            }

            if (this.isActualChangesForPreprocess(nodeData, prevNodeData)) {
                await this.preprocess(req, nodeData, prevNodeData);
            }

            if (this.isActualChanges(nodeData, prevNodeData, diff)) {
                await this.execute(nodeData, prevNodeData, req);
            }
        }
    }

    protected abstract isActualNode(nodeData: any, prevNodeData: any): boolean;

    protected abstract isActualChanges(nodeData: any, prevNodeData: any, diff?: any): boolean;

    protected abstract execute(nodeData: any, prevNodeData: any, req: Request): Promise<any>;

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
}
