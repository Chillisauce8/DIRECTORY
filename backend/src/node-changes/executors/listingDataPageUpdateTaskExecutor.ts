import {NodeChangeTaskExecutor} from '../nodeChangeTaskExecutor';
import type {INodeChangeTask} from '../nodeChangeTask.interface';
import {coreServiceLocator} from '../../serviceLocator';
import {ListingsHelper} from '../../data-helpers/listings-helper';


export class ListingDataPageUpdateTaskExecutor extends NodeChangeTaskExecutor {
    constructor(private listingsHelper: ListingsHelper) {
        super();
    }

    getType(): string {
        return 'listingDataPageUpdate';
    }

    protected async processTask(req: Request, task: INodeChangeTask): Promise<any> {
        const listingsData = await this.listingsHelper.getListingData(req, task.nodeId);

        const {domain: website, url} = listingsData;
        const pageJSON = listingsData?.data?.page?.last?.data;

        if (!pageJSON) {
            return;
        }

        const listing = await this.listingsHelper
            .createOrUpdateListingContentFromPageJSON(req, {website, url, pageJSON});

        if (!listingsData.listingId) {
            const listingId = listing?._doc;

            await this.listingsHelper.updateListingDataNode(req, {...listingsData, listingId});
        }
    }
}


export function listingDataPageUpdateTaskExecutorDescriptionFactory() {
    const privateSettings = coreServiceLocator.get('privateSettings');
    const listingsHelper = coreServiceLocator.get<ListingsHelper>('listingsHelper');

    return {
        serviceInstance: new ListingDataPageUpdateTaskExecutor(listingsHelper),
        description: {
            name: 'ListingDataPageUpdateTaskExecutor',
            collection: {
                name: 'listingsData',
            },
        },
        apps: ['car'],
        environments: [privateSettings.ENVIRONMENTS_SETTINGS.DEVELOPMENT]
    };
}
