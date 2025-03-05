import {NodeChangeTaskCreator} from '../nodeChangeTaskCreator';
import type {INodeChangeTask} from '../nodeChangeTask.interface';
import {DateHelper} from 'x-utils';
import * as _ from 'lodash';
import {coreServiceLocator} from '../../serviceLocator';



export class ListingDataPageUpdateTaskCreator extends NodeChangeTaskCreator {
    private dateHelper = new DateHelper();

    protected isActualNode(nodeData: any, prevNodeData: any): boolean {
        return nodeData._type === 'listingsData';
    }

    protected isActualChanges(nodeData: any, prevNodeData: any, diff?: any): boolean {
        if (!prevNodeData?.listingId && nodeData?.listingId) {
            return false;
        }

        if (!nodeData?.data?.page?.last) {
            return false;
        }

        if (_.isEqual(nodeData?.data?.page?.last, prevNodeData?.data?.page?.last)) {
            return false;
        }

        return true;
    }

    protected prepareTasks(nodeData: any, prevNodeData: any, req?: Request): Promise<Array<INodeChangeTask>> {
        const type = 'listingDataPageUpdate';

        return Promise.resolve([
            {
                type,
                nodeId: nodeData._doc,
                dateTime: this.dateHelper.saveDateTimeFormat(new Date()),
            }
        ]);
    }
}


export function listingDataPageUpdateTaskCreatorDescriptionFactory() {
    const privateSettings = coreServiceLocator.get('privateSettings');

    return {
        serviceInstance: new ListingDataPageUpdateTaskCreator(),
        description: {
            name: 'ListingDataPageUpdateTaskCreator',
            collection: {
                name: 'listingsData',
            },
        },
        apps: ['car'],
        environments: [privateSettings.ENVIRONMENTS_SETTINGS.DEVELOPMENT]
    };
}
