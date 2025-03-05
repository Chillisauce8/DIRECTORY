import {NodeChangeTaskExecutor} from '../nodeChangeTaskExecutor';
import type {INodeChangeTask} from '../nodeChangeTask.interface';
import {ApifyHelper, apifyHelperFactory} from '../../utils/apify-helper';
import {ListingsHelper} from '../../data-helpers/listings-helper';
import {coreServiceLocator} from '../../serviceLocator';


interface ListingPageDatasetItem {
    website: string;
    url: string;
    pageJSON: string;
}


export class ListingDataImportTaskExecutor extends NodeChangeTaskExecutor {
    constructor(private apifyHelper: ApifyHelper,
                private listingsHelper: ListingsHelper) {
        super();
    }


    getType(): string {
        return 'listingDataImport';
    }

    protected async processTask(req: Request, task: INodeChangeTask): Promise<any> {
        const datasetId = task.nodeId;

        const dataset = await this.apifyHelper.getDataset(datasetId);

        let totalItems =
            (await dataset.listItems({offset: 0, limit: 1, fields: ['url']})).total;

        const itemPerPage = 100;
        const totalPageCount = Math.ceil(totalItems / itemPerPage);

        for (let i = 0; i < totalPageCount; i++) {
            const pageContent =
                await dataset.listItems({offset: i * itemPerPage, limit: itemPerPage});

            for (const item of pageContent.items) {
                // @ts-ignore
                const {url, pageJSON, website} = item as ListingPageDatasetItem;

                await this.listingsHelper
                    .createOrUpdateListingData(req, {url, pageJSON, website, parseMethod: 'JSON->JSON'});
                console.log(`Listing data for ${url} has been imported (${i * itemPerPage + pageContent.items.indexOf(item) + 1}/${totalItems} of ${totalItems})`);
            }
        }
    }
}


export function listingDataImportTaskExecutorDescriptionFactory() {
    const privateSettings = coreServiceLocator.get('privateSettings');
    const listingsHelper = coreServiceLocator.get<ListingsHelper>('listingsHelper');

    return {
        serviceInstance: new ListingDataImportTaskExecutor(apifyHelperFactory(), listingsHelper),
        description: {
            name: 'ListingDataPageUpdateTaskExecutor',
            collection: {
                name: 'listingsData',
            }
        },
        apps: ['car'],
        environments: [privateSettings.ENVIRONMENTS_SETTINGS.DEVELOPMENT]
    };
}
