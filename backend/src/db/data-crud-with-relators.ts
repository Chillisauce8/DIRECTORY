import {
    associationActionsEmitter,
    UpdateAssociationsOnChangesSignalName,
    UpdateNodeForSourceRelatorsTasksSignalName
} from './data-crud-with-relators-events-executor';
import * as _ from 'lodash';
import {AssociationsHelper} from './associations/associationsHelper';
import type {ICrudWriteOptions, IQueryParams} from './data-crud.interface';
import {AssociationCrud} from './associations/associationCrud';
import {MongoCrudClient} from './mongo/client';
import {AssociationTasksCreator} from './associations/associationTasksCreator';
import {AssociationTasksExecutorInvoker} from './associations/asociationTasksExecutorInvoker';
import {HistoryState} from './history-state';
import { BaseDataCrud } from './base-data-crud';
import { DateHelper } from 'x-utils';
import type { CacheHelper } from '../cache/cacheHelper';


export class DataCrudWithRelators extends BaseDataCrud {

    constructor(client: MongoCrudClient,
                historyStateHelper: HistoryState,
                dateHelper: DateHelper,
                cacheHelper: CacheHelper,
                COMMON_NODES_CACHE_TIMEOUT_SECONDS: number,
                STANDARD_COLLECTIONS_DESCRIPTION: any,
                private associationsHelper: AssociationsHelper,
                private associationTasksCreator: AssociationTasksCreator,
                private associationCrud: AssociationCrud,
                private assocTasksExecutorInvoker: AssociationTasksExecutorInvoker) {
        super(client, historyStateHelper, dateHelper, cacheHelper,
            COMMON_NODES_CACHE_TIMEOUT_SECONDS, STANDARD_COLLECTIONS_DESCRIPTION);
    }

    override async deleteNode(req: Request, collectionName: string, queryParams: IQueryParams, options?: ICrudWriteOptions) {
        await super.deleteNode(req, collectionName, queryParams, options);
        await this.associationTasksCreator.makeTasksRemoveAssociationsForTarget(queryParams.nodeId as string);
        await this.associationTasksCreator.makeTasksRemoveAssociationsForSource(queryParams.nodeId as string);
        await this.assocTasksExecutorInvoker.invokeAsync();
    };

    override async prepareDataToSave(req: Request, collectionName: string,
                                      initialNode, nodeBody, options: ICrudWriteOptions) {
        nodeBody = await super.prepareDataToSave(req, collectionName, initialNode, nodeBody, options);

        const query = {
            targetType: collectionName
        };

        const associationDetails = await this.associationCrud.queryAssocDetails(query);

        let initialNodePartWithRelators = this.getNodePartWithRelators(initialNode, associationDetails);
        let currentNodePartWithRelators = this.getNodePartWithRelators(nodeBody, associationDetails);

        let initialRelators = this.associationsHelper.getRelatorsLikeFromData(initialNodePartWithRelators);
        let relatorsDetails = this.associationsHelper.getRelatorsLikeFromData(currentNodePartWithRelators);

        initialRelators = this.filterRelatorDetails(initialRelators, associationDetails);
        relatorsDetails = this.filterRelatorDetails(relatorsDetails, associationDetails);

        const updateSourceRelatorsTasks = this.associationsHelper.makeTaskListForNodeRelators(
            initialRelators, relatorsDetails);

        if (updateSourceRelatorsTasks.length) {
            await associationActionsEmitter.emit(UpdateNodeForSourceRelatorsTasksSignalName,
                req, nodeBody, updateSourceRelatorsTasks, associationDetails);
        }

        return nodeBody;
    }

    override async onDiffProcessed(req: Request, collectionName: string,
                                    nodeId: string, diffResult, isUpdated, options?: ICrudWriteOptions) {
        if (!isUpdated || (options && options.ignoreRelators)) {
            return
        }

        associationActionsEmitter.emit(UpdateAssociationsOnChangesSignalName,
            req, collectionName, nodeId, diffResult);
    }

    override async onNodeSaved(req: Request, nodeId, options?: ICrudWriteOptions) {
        if (options && options.ignoreRelators) {
            return
        }

        await this.assocTasksExecutorInvoker.invokeAsync();
    }

    private getNodePartWithRelators(nodeData, associationDetails) {
        let nodeStartKeysWithRelators = _.chain(associationDetails)
            .map('targetPath')
            .map(item => {
                return item.split('.')[0]
            })
            .uniq()
            .value();

        let result;
        if (nodeData) {
            result = _.pickBy(nodeData, (value, key) => {
                return _.includes(nodeStartKeysWithRelators, key) ;
            });
        }

        return result;
    }

    private filterRelatorDetails(relatorsDetails, associationDetails) {
        return relatorsDetails.filter(relatorsDetailsItem => {
            let associationDetailForRelator = _.find(associationDetails, associationDetailsItem => {
                return associationDetailsItem.targetPath === relatorsDetailsItem.path;
            });

            if (!associationDetailForRelator || !associationDetailForRelator.mappings || !associationDetailForRelator.mappings.length) {
                return false;
            }

            return true;
        });
    };
}
