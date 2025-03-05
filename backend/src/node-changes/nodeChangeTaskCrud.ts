import * as BBPromise from 'bluebird';
import {DateHelper} from "x-utils";
import type {INodeChangeTask} from './nodeChangeTask.interface';
import {coreServiceLocator} from '../serviceLocator';
import type { IDataCrud } from '../db';
import {ObjectId} from 'mongodb';


export class NodeChangeTaskCrud {

    static readonly TASKS_COUNT_TO_EXECUTE = 5;

    private STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');

    constructor(private dataCrudService: IDataCrud,
                private dateHelper: DateHelper) {
        //
    }

    public async getTasksCount(req: Request): Promise<number> {
        const currentDateTime = this.dateHelper.saveDateTimeFormat(new Date());

        const query = {
            $or: [
                {executeDate: {$exists: false}},
                {executeDate: {$lte: currentDateTime}}
            ]
        };

        return this.dataCrudService.queryNodeCount(req,
            this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name,
            {query});
    }

    public async readTasks(req: Request): Promise<Array<INodeChangeTask>> {
        const currentDateTime = this.dateHelper.saveDateTimeFormat(new Date());

        const query = {
            $or: [
                {executeDate: {$exists: false}},
                {executeDate: {$lte: currentDateTime}}
            ]
        };

        return this.dataCrudService.queryNodes(req,
            this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name,
            {query});
    }

    public async readTasksToExecute(req: Request): Promise<Array<INodeChangeTask>> {
        const currentDateTime = this.dateHelper.saveDateTimeFormat(new Date());

        const query = {
            $or: [
                {executeDate: {$exists: false}},
                {executeDate: {$lte: currentDateTime}}
            ]
        };

        const pagination = {limit: NodeChangeTaskCrud.TASKS_COUNT_TO_EXECUTE, sort: {priority: 1, executeDate: 1}};

        return this.dataCrudService.queryNodes(
            req, this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name,
            {query, pagination});
    }

    public async createTask(req: Request, task: INodeChangeTask) {
        return this.dataCrudService.createNode(req,
            this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name, task);
    }

    public async createTasks(req: Request, taskList: Array<INodeChangeTask>) {
        if (!taskList || !taskList.length) {
            return BBPromise.resolve();
        }

        return this.dataCrudService.insertNodeArray(req,
            this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name, taskList);
    }

    public async removeTask(req: Request, task: INodeChangeTask) {
        return this.removeTaskById(req, task._id);
    }

    public async updateTask(req: Request, task: INodeChangeTask) {
        return this.dataCrudService.updateNode(req,
            this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name, task);
    }

    public async removeTaskById(req: Request, id: any) {
        return this.dataCrudService.deleteNode(req,
            this.STANDARD_COLLECTIONS_DESCRIPTION.nodeChangeTask.name,
            {query: {_id: new ObjectId(id)}});
    }
}

