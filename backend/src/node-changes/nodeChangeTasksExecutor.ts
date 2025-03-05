import { NodeChangeTaskCrud } from './nodeChangeTaskCrud';
import { NodeChangeTaskExecutor, NodeChangeTaskExecutorGroupName } from './nodeChangeTaskExecutor';
import { NodeChangeTaskExecutorInvoker } from './nodeChangeTaskExecutorInvoker';
import { INodeChangeTask } from './nodeChangeTask.interface';
import { DEFAULT_LOCK_TIME, processWithLock } from '../utils';
import { coreServiceLocator } from '../serviceLocator';
import { DateHelper } from 'x-utils';
import { LoggingHelper } from '../utils';


export class NodeChangeTasksExecutor {

    private privateSettings = coreServiceLocator.get('privateSettings');
    private readonly LOCK_ERROR_TEXT = 'ERROR: Exceeded 10 attempts to lock the resource';

    constructor(private nodeChangeTaskExecutorInvoker: NodeChangeTaskExecutorInvoker,
                private nodeChangeTaskCrud: NodeChangeTaskCrud,
                private dateHelper: DateHelper,
                private loggingHelper: LoggingHelper) {
        //
    }

    async execute(req: Request) {
        this.nodeChangeTaskExecutorInvoker.turnToDeferMode(req);

        try {
          await processWithLock('nodeChangeTasksExecution2', DEFAULT_LOCK_TIME,
            async (lockInstance) => {

              const nodeChangeTasks = await this.nodeChangeTaskCrud.readTasksToExecute(req);

              if (nodeChangeTasks.length) {
                console.log('Node change tasks execution started, tasks count ', nodeChangeTasks.length);

                const extendLockTime = this._calculateExtendLockTime(req, nodeChangeTasks);

                 if (this.privateSettings.CACHE.type && this.privateSettings.CACHE.type === 'redis' &&
                       nodeChangeTasks.length && extendLockTime) {
                     lockInstance.extend(DEFAULT_LOCK_TIME + extendLockTime);
                 }

                await this._executeNodeChangeTasks(req, nodeChangeTasks);

                console.log('Node change tasks execution done');

                const recentTasks = await this.nodeChangeTaskCrud.getTasksCount(req);

                if (recentTasks) {
                  this.nodeChangeTaskExecutorInvoker.invokeAsync(req);
                }
              }
            });
        } catch (error) {
          const message = `ERROR: ${this.loggingHelper.getErrorMessage(error)}`;

          if (message.startsWith(this.LOCK_ERROR_TEXT)) {
            return;
          }

        } finally {
          this.nodeChangeTaskExecutorInvoker.turnToImmediateMode(req);
        }
    }

    private _calculateExtendLockTime(req: Request, tasks: any[]): number {
      let extendLockTime = 0;

      for (const task of tasks) {
        const executor = this.getExecutorByType(req, task.type);

        if (!executor) {
          continue;
        }

        const taskExtendLockTime = this.extendLockTime(executor);

        if (!taskExtendLockTime) {
          continue;
        }

        extendLockTime += taskExtendLockTime;
      }

      return extendLockTime;
    }

    private async _executeNodeChangeTasks(req: Request, tasks: Array<any>) {
        for (let task of tasks) {
          const executor = this.getExecutorByType(req, task.type);

          if (!executor) {
            await this.updateTaskExecutionDetails(req, task, executor, 'error');
            continue;
          }

          try {
            const skipTaskExecution = await this.skipTaskExecution(req, executor, task);

            if (skipTaskExecution) {
              await this.updateTaskExecutionDetails(req, task, executor, 'skip');
              continue;
            }

            // await executor.execute(req, task);

            await executor.processTask(req, task);

            await this.nodeChangeTaskCrud.removeTask(req, task);
          } catch (ex) {
            await this.updateTaskExecutionDetails(req, task, executor, 'error');
            console.error(this.loggingHelper.getErrorMessage(ex));
          }
        }
    }

    private async updateTaskExecutionDetails(req: Request, task: INodeChangeTask,
                                             executor: NodeChangeTaskExecutor,
                                             reason: 'skip' | 'error'): Promise<any> {
        task.executeDate = this.getTaskExecuteDate(task, executor, reason);
        task.executionCount = this.getTaskExecutionCount(task, executor, reason);
        task.skipCount = this.getTaskSkipCount(task, reason);

        await this.nodeChangeTaskCrud.updateTask(req, task);
    }

    private getTaskExecuteDate(task: INodeChangeTask, executor: NodeChangeTaskExecutor,
                               reason: 'skip' | 'error'): string {
        if (reason === 'error') {
            return this.getNextTaskExecutionDateOnError(executor, task);
        } else if (reason === 'skip') {
            return this.getNextTaskExecutionDateOnSkip(executor, task);
        }
    }

    private getTaskExecutionCount(task: INodeChangeTask, executor: NodeChangeTaskExecutor,
                                  reason: 'skip' | 'error'): number {
        if (reason === 'error') {
            return (task.executionCount || 0) + 1;
        }

        if (executor?.hasOwnProperty('skipExecutionCountIncreasing')) {
            try {
                const result = executor.skipExecutionCountIncreasing();

                if (result) {
                    return task.executionCount;
                }
            } catch (ex) {
                // TODO: log error to DB
                return 0;
            }
        }

        return (task.executionCount || 0) + 1;
    }

    private getTaskSkipCount(task: INodeChangeTask, reason: 'skip' | 'error'): number {
        if (reason === 'error') {
            return (task.skipCount || 0);
        }

        return (task.skipCount || 0) + 1;
    }

    private getExecutorByType(req: Request, type: string) {
        const nodeChangeTasksExecutors = coreServiceLocator.getServicesGroup(NodeChangeTaskExecutorGroupName);

        return nodeChangeTasksExecutors.find(item => item.getType() === type);
    }

    private extendLockTime(executor): number {
        if (executor?.hasOwnProperty('extendLockTime')) {
            try {
                return executor.extendLockTime();
            } catch (ex) {
                // TODO: log error to DB
            }
        }

        return 0;
    }

    private skipTaskExecution(req: Request, executor, task) {
        if (executor?.hasOwnProperty('skipTaskExecution')) {
            try {
                return executor.skipTaskExecution(req, task);
            } catch (ex) {
                // TODO: log error to DB
            }
        }

        return false;
    }

    private getNextTaskExecutionDateOnError(executor, task) {
        if (executor?.hasOwnProperty('getNextTaskExecutionDateOnError')) {
            try {
                return executor.getNextTaskExecutionDateOnError(task);
            } catch (ex) {
                // TODO: log error to DB
            }
        }

        return this.getDefaultNextExecutionDate(task);
    }

    private getNextTaskExecutionDateOnSkip(executor, task) {
        if (executor?.hasOwnProperty('getNextTaskExecutionDateOnSkip')) {
            try {
                return executor.getNextTaskExecutionDateOnSkip(task);
            } catch (ex) {
                // TODO: log error to DB
            }
        }

        return this.getDefaultNextExecutionDate(task);
    }

    private getDefaultNextExecutionDate(task: INodeChangeTask) {
        let newExecutionDate = new Date();

        if (task.executionCount && task.executionCount > 3) {
            newExecutionDate = this.dateHelper.addHoursToDate(newExecutionDate, 1);
        } else {
            newExecutionDate = this.dateHelper.addMinutesToDate(newExecutionDate, 10);
        }

        return this.dateHelper.saveDateTimeFormat(newExecutionDate);
    }
}
