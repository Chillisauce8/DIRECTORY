import {AssociationsHelper} from './associationsHelper';
import type {IAssociation, IAssociationDetails} from './associationsHelper';
import {DefinitionCrud} from '../definition-crud';
import {AssociationCrud} from './associationCrud';
import {MongoCrudClient} from '../mongo/client';

import * as _ from 'lodash';
import { ObjectId } from 'mongodb';


export class AssociationTasksChecker {

    constructor(private definitionCrud: DefinitionCrud,
                private assocCrud: AssociationCrud,
                private assocHelper: AssociationsHelper,
                private mongoCrudClient: MongoCrudClient) {
        //
    }


    public async needAddAssociationDetails(req, assocDetails: IAssociationDetails): Promise<boolean> {
        if (!assocDetails.targetType) {
            return false;
        }

        let definition = await this.definitionCrud.getDefinitionByType(req, assocDetails.targetType);

        if (!definition) {
            return false;
        }

        let targetField = _.get(definition, assocDetails.originalPath);

        if (!targetField) {
            return false;
        }

        if (!targetField['_relator'] && !targetField.join) {
            return false;
        }

        return true;
    }

    public async needRemoveAssociationDetails(req, assocDetails: IAssociationDetails): Promise<boolean> {
        const definition = await this.definitionCrud.getDefinitionByType(req, assocDetails.targetType);

        if (!definition) {
            return true;
        }

        const targetField = _.get(definition, assocDetails.originalPath);

        if (!targetField) {
            return true;
        }

        const joinDefinition = _.get(targetField, '_relator') || _.get(targetField, 'join');

        const sync = _.get(joinDefinition, 'sync') || _.get(targetField, 'syncAll');

        if (sync === false) {
            return true;
        }

        if (joinDefinition.mappings && _.some(joinDefinition.mappings, item => item.sync !== false)) {
            return false;
        }

        return true;
    }

    public async needUpdateMappingTasksForAssociationDetails(req, assocDetails: IAssociationDetails): Promise<boolean> {
        let definition = await this.definitionCrud.getDefinitionByType(req, assocDetails.targetType);

        if (!definition) {
            return false;
        }

        let targetField = _.get(definition, assocDetails.originalPath);

        if (!targetField) {
            return false;
        }

        const mappings = _.get(targetField, '_relator.mappings') || _.get(targetField, 'join.mappings');

        if (!mappings && !assocDetails.mappings) {
            return false;
        }

        const schemaMappingsMap = _.chain(mappings)
            .keyBy(item => item['toProperty'] || item['to'] || item['from'])
            .mapValues(item => item['fromProperty'] || item['from'])
            .value();

        const assocDetailsMappingsMap = _.chain(assocDetails.mappings)
            .keyBy(item => item['toProperty'] || item['to'] || item['from'])
            .mapValues(item => item['fromProperty'] || item['from'])
            .value();

        if (_.isEqual(schemaMappingsMap, assocDetailsMappingsMap)) {
            return false;
        }

        return true;
    }

    public async needAddAssociation(req, associationDetailsId: string, sourceId: string, targetId: string): Promise<boolean> {
        let associationDetails = await this.assocCrud.getAssocDetailsById(associationDetailsId);

        if (!associationDetails || !associationDetails.mappings) {
            return false;
        }

        let targetNode = await this.mongoCrudClient.queryOne(associationDetails.targetType,
          {'_id': new ObjectId(targetId)});

        if (!targetNode) {
            return false;
        }

        let relators = this.assocHelper.getRelatorsLikeFromData(targetNode);
        let targetRelator = _.find(relators, (relator: any) => {
            return relator.path === associationDetails.targetPath && relator.value.id === sourceId;
        });

        if (!targetRelator) {
            return false;
        }

        let sourceNode = await this.mongoCrudClient.queryOne(associationDetails.sourceType,
          {'_id': new ObjectId(sourceId)});

        if (!sourceNode) {
            return false;
        }

        let existingAssociation = await this.assocCrud.queryAssociations({sourceId, targetId, associationDetailsId});

        if (existingAssociation.length) {
            return false;
        }

        return true;
    }

    public async needRemoveAssociation(req, association: IAssociation): Promise<boolean> {
        let associationDetails = await this.assocCrud.getAssocDetailsById(association.associationDetailsId);

        if (!associationDetails) {
            return true;
        }

        let sourceNode = await this.mongoCrudClient.queryOne(associationDetails.sourceType,
            {'_id': new ObjectId(association.sourceId)});

        if (!sourceNode) {
            return true;
        }

        let targetNode = await this.mongoCrudClient.queryOne(associationDetails.targetType,
          {'_id': new ObjectId(association.targetId)});

        if (!targetNode) {
            return true;
        }

        let relators = this.assocHelper.getRelatorsLikeFromData(targetNode);
        let targetRelator = _.find(relators, (relator: any) => {
            return relator.path === associationDetails.targetPath && relator.value.id === association.sourceId;
        });

        if (targetRelator) {
            return false;
        }

        return true;
    }
}
