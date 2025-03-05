import {ObjectId} from 'mongodb';
import {AssociationsHelper} from './associationsHelper';
import type {IAssociation, IAssociationDetails, IRelatorMapping} from './associationsHelper';
import {MongoCrudClient} from '../mongo/client';


export class AssociationCrud {
    private associationDetailsCollectionName: string = 'associationDetails';
    private associationsCollectionName: string = 'associations';

    constructor(private assocHelper: AssociationsHelper,
                private mongoCrudClient: MongoCrudClient) {}

    public async getAssocDetailsById(id: string): Promise<IAssociationDetails> {
        let query = {_id: new ObjectId(id)};
        return this.mongoCrudClient.queryOne(this.associationDetailsCollectionName, query);
    }

    public async queryAssocDetails(query: any): Promise<Array<IAssociationDetails>> {
        return this.mongoCrudClient.queryNodes(this.associationDetailsCollectionName, query);
    }

    public async getAssociationsByAssocDetailsId(associationDetailsId: string): Promise<Array<any>> {
        return this.mongoCrudClient.queryNodes(this.associationsCollectionName, {associationDetailsId});
    }

    public async queryAssociations(query): Promise<Array<IAssociation>> {
        return this.mongoCrudClient.queryNodes(this.associationsCollectionName, query);
    }

    public async getAssociationById(associationId: string): Promise<any> {
        return this.mongoCrudClient.queryOne(this.associationsCollectionName, {
            '_id': new ObjectId(associationId)
        });
    }

    public async createAssocDetail(assocDetail: IAssociationDetails): Promise<IAssociationDetails> {
        return this.mongoCrudClient.insertNode(this.associationDetailsCollectionName, assocDetail);
    }

    public async updateAssociationDetail(id: string, data: any) {
        const query = {'_id': new ObjectId(id)};
        let assocDetail = await this.mongoCrudClient.queryOne(this.associationDetailsCollectionName, query);

        assocDetail = {...assocDetail, ...data};

        return this.mongoCrudClient.updateNode(this.associationDetailsCollectionName, query, assocDetail);
    }

    public async createAssociation(associationDetailsId: string, sourceId: string, targetId: string) {
        return this.mongoCrudClient.insertNode(this.associationsCollectionName,
            {associationDetailsId, sourceId, targetId});
    }

    public async updateAssociation(id: string, data: any) {
        const query = {'_id': new ObjectId(id)};
        let assoc = await this.mongoCrudClient.queryOne(this.associationsCollectionName, query);

        assoc = {...assoc, ...data};

        return this.mongoCrudClient.updateNode(this.associationsCollectionName, query, assoc);
    }

    public async updateAssocDetailMapping(id: string, mappings: any) {
        const query = {'_id': new ObjectId(id)};
        const assocDetails = await this.mongoCrudClient.queryOne(this.associationDetailsCollectionName, query);

        assocDetails['mappings'] = mappings;

        return this.mongoCrudClient.updateNode(this.associationDetailsCollectionName, query, assocDetails);
    }

    public async removeAssocDetail(id: string) {
        const query = {'_id': new ObjectId(id)};
        return this.mongoCrudClient.deleteNode(this.associationDetailsCollectionName, query);
    }

    public async removeAssociationsByAssocDetailsId(associationDetailsId: string) {
        const query = {associationDetailsId};
        return this.mongoCrudClient.deleteNodes(this.associationsCollectionName, query);
    }

    public async clearAssociations() {
        return this.mongoCrudClient.deleteNodes(this.associationsCollectionName, {});
    }

    public async removeAssociation(associationId: string) {
        const query = {'_id': new ObjectId(associationId)};
        return this.mongoCrudClient.deleteNode(this.associationsCollectionName, query);
    }

    public async getAssociatedValues(assocDetail: IAssociationDetails, sourceId: string) {
        if (!assocDetail.mappings || !Object.keys(assocDetail.mappings).length) {
            return {};
        }

        const query = {'_id': new ObjectId(sourceId)};
        let sourceNode = await this.mongoCrudClient.queryOne(assocDetail.sourceType, query);

        if (!sourceNode) {
            return {};
        }

        const result = assocDetail.mappings.reduce((previousValue: object, mappingItem: IRelatorMapping) => {
            const fromProperty: string = (mappingItem.fromProperty || mappingItem.from) as string;
            const toProperty: string = (mappingItem.toProperty || mappingItem.to || mappingItem.from) as string;
            previousValue[toProperty] = this.assocHelper.getSourceNodePropertyByPath(sourceNode,
                fromProperty || mappingItem['from']);

            return previousValue;
        }, {});

        result['title'] = this.assocHelper.getSourceNodePropertyByPath(sourceNode, 'title');

        return result;
    }

    public async hasAssociationsFromSource(sourceId: string): Promise<boolean> {
        let association = await this.mongoCrudClient.queryOne(this.associationsCollectionName, {
            'sourceId': sourceId
        });

        return !!association;
    }
}

let mongoCrud = new MongoCrudClient();

const associationCrud = new AssociationCrud(new AssociationsHelper(),
    mongoCrud);

export {associationCrud as associationCrud};

