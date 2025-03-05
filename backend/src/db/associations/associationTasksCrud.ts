import {MongoCrudClient} from '../mongo/client';
import { ASSOCIATION_TASKS_COLLECTION_NAME } from './associationTask.interface';
import type { IAssociationTask } from './associationTask.interface';


export class AssociationTasksCrud {
    private associationTasksCollectionName: string = ASSOCIATION_TASKS_COLLECTION_NAME;

    constructor(private mongoCrudClient: MongoCrudClient) {}

    public async readTasks(): Promise<Array<IAssociationTask>> {
        return this.mongoCrudClient.queryNodes(this.associationTasksCollectionName, {}, {limit: 100});
    }

    public async searchTasks(query): Promise<Array<IAssociationTask>> {
        return this.mongoCrudClient.queryNodes(this.associationTasksCollectionName, query,
            {limit: 100});
    }

    public async createTask(task: IAssociationTask) {
        const taskCopy = {...task};
        delete taskCopy.dateTime;
        const existingTasks = await this.searchTasks(taskCopy);

        if (existingTasks.length > 0) {
            return;
        }

        return this.mongoCrudClient.insertNode(this.associationTasksCollectionName, task);
    }

    public async createTasks(taskList: Array<IAssociationTask>) {
        if (!taskList || !taskList.length) {
            return Promise.resolve([]);
        }

        return this.mongoCrudClient.insertNodeArray(this.associationTasksCollectionName, taskList);
    }

    public async removeTask(task: IAssociationTask) {
        return this.removeTaskById(task._id);
    }

    public async removeTaskById(id: any) {
        return this.mongoCrudClient.deleteNode(this.associationTasksCollectionName, {_id: id});
    }

    public async removeAll() {
        return this.mongoCrudClient.deleteNodes(this.associationTasksCollectionName, {});
    }
}
