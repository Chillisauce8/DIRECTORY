import {asyncForEach} from 'x-utils';

import { NodeChangeTaskCreator, NodeChangeTaskCreatorGroupName } from './nodeChangeTaskCreator';
import type {INodeChangeTask} from './nodeChangeTask.interface';
import {NodeChangeTaskCrud} from './nodeChangeTaskCrud';
import {NodeChangeTaskExecutorInvoker} from './nodeChangeTaskExecutorInvoker';
import {globalEmitter} from '../utils';
import { NodeChangesSyncExecutor, NodeChangesSyncExecutorGroupName } from './nodeChangesSyncExecutor';
import { coreServiceLocator } from '../serviceLocator';
import { CRUD_EVENTS } from '../db/base-data-crud';


export class NodeChangesObserver {
    constructor(
        private nodeChangeTaskExecutorInvoker: NodeChangeTaskExecutorInvoker,
        private nodeChangeTaskCrud: NodeChangeTaskCrud) {
        //
    }

    observeAndProcess() {
        globalEmitter.on(CRUD_EVENTS.nodeCreated, async (req: Request, initialData, currentData) => {
            await this._processChangesAsync(req, initialData, currentData);
        });

        globalEmitter.on(CRUD_EVENTS.nodeUpdated, async (req: Request, initialData, currentData, diff) => {
            await this._processChangesAsync(req, initialData, currentData, diff);
        });

        globalEmitter.on(CRUD_EVENTS.nodeDeleted, async (req: Request, initialData, currentData) => {
            await this._processChangesAsync(req, initialData, currentData);
        });

        globalEmitter.on(CRUD_EVENTS.nodeCreating, async (req: Request, initialData, currentData) => {
            await this._processChangesSync(req, initialData, currentData);
        });

        globalEmitter.on(CRUD_EVENTS.nodeUpdating, async (req: Request, initialData, currentData) => {
            await this._processChangesSync(req, initialData, currentData);
        });

        globalEmitter.on(CRUD_EVENTS.nodeDeleting, async (req: Request, initialData, currentData) => {
            await this._processChangesSync(req, initialData, currentData);
        });
    }

    private async _processChangesAsync(req: Request, initialData, currentData, diff?) {
        await this._processNodeChangeTaskCreators(req, initialData, currentData, diff);
    }

    private async _processChangesSync(req: Request, initialData, currentData, diff?) {
        await this._executeSyncProcessors(req, initialData, currentData, diff);
    }

    private async _processNodeChangeTaskCreators(req: Request, initialData, currentData, diff?) {
        const tasksToSave: INodeChangeTask[] = await this._prepareNodeChangeTasks(req, initialData, currentData, diff);

        if (tasksToSave.length) {
            await this._saveTasks(req, tasksToSave);
            this.nodeChangeTaskExecutorInvoker.invokeAsync(req);
        }
    }

    private async _executeSyncProcessors(req: Request, initialData, currentData, diff?) {
        const nodeChangesSyncExecutors = coreServiceLocator.getServicesGroup(NodeChangesSyncExecutorGroupName);

        await asyncForEach(nodeChangesSyncExecutors,
            async (executor: NodeChangesSyncExecutor) => {
                try {
                    return executor.process(req, currentData, initialData, diff);
                } catch (ex: any) {
                    // TODO: improve there
                    console.log(ex?.message);
                }
            });
    }

    private async _prepareNodeChangeTasks(req: Request, initialData, currentData, diff?) {
        let tasksToSave: Array<INodeChangeTask> = [];

        const nodeChangeTaskCreators = coreServiceLocator.getServicesGroup(NodeChangeTaskCreatorGroupName);

        await asyncForEach(nodeChangeTaskCreators,
            async (creator: NodeChangeTaskCreator) => {
                let tasks: Array<INodeChangeTask> = [];

                try {
                    tasks = await creator.process(req, currentData, initialData, diff);
                } catch (ex: any) {
                    // TODO: improve there
                    console.log(ex?.message);
                }

                if (tasks?.length) {
                    tasksToSave = [...tasksToSave, ...tasks];
                }
            });

        return tasksToSave;
    }

    private async _saveTasks(req: Request, tasks: Array<INodeChangeTask>) {
        return this.nodeChangeTaskCrud.createTasks(req, tasks);
    }
}

