import {
    IAssociationDetails
} from '../db';
import { coreServiceLocator } from '../serviceLocator';

import * as _ from 'lodash';


const dataCrudService = coreServiceLocator.get('dataCrudService');
const definitionCrud = coreServiceLocator.get('definitionCrud');
const associationTasksCreator = coreServiceLocator.get('associationTasksCreator');
const associationCrud = coreServiceLocator.get('associationCrud');
const associationsHelper = coreServiceLocator.get('associationsHelper');


let prepareTasksForNode = async function(req, nodeType, node, preparedAssociationDetailsList) {
    let relatorsDetails = associationsHelper.getRelatorsLikeFromData(node);

    if (!relatorsDetails.length) {
        return;
    }

    console.log("Started for " + node._doc + ", relators count: " + relatorsDetails.length);

    for (let i = 0; i < relatorsDetails.length; ++i) {
        let sourceId = relatorsDetails[i].value.id;
        let targetPath = relatorsDetails[i].path;

        let properAssociationDetails = _.find(preparedAssociationDetailsList, (item: IAssociationDetails) => {
            return item.targetType === nodeType && item.targetPath === targetPath;
        });

        if (!properAssociationDetails) {
            continue;
        }

        const query = {targetType: nodeType, targetPath, sourceType: properAssociationDetails.sourceType};

        let associationDetails = await dataCrudService.querySingleNode(req,
            'associationDetails', {query});

        if (!associationDetails) {
            console.log('No associationDetails for ' + JSON.stringify(query));
            associationDetails = await associationCrud.createAssocDetail(req, properAssociationDetails);
        }

        const associationDetailsId = _.isString(associationDetails._doc) ? associationDetails._doc :
            associationDetails._doc.toString();

        const existingAssociations = await associationCrud.queryAssociations(req, {
            "associationDetailsId": associationDetailsId,
            "sourceId": sourceId,
            "targetId": node._doc
        });

        if (!existingAssociations.length) {
            await associationCrud.createAssociation(req, associationDetailsId, sourceId, node._doc);
            console.log("New association created");

            await associationTasksCreator.makeTaskUpdateMappingForAssociations(req, associationDetailsId,
                sourceId, node._doc);

        } else if (existingAssociations.length > 1) {
            for (let i = existingAssociations.length - 1; i > 0; i--) {
                const existingAssociation = existingAssociations[i];
                await associationCrud.removeAssociation(req, existingAssociation['_doc']);
            }
        }
    }
};

let prepareTasksForNodeType = async function(req, nodeInfo) {
    console.log("Started for " + nodeInfo.type);

    let definition = await definitionCrud.getDefinitionByType(req, nodeInfo.type);

    let preparedAssociationDetailsList = associationsHelper.prepareAssociationDetailsForDefinition(definition)
        .filter(item => item.mappings);

    if (!preparedAssociationDetailsList.length) {
        return;
    }

    let nodes = await dataCrudService.queryAllAvailableNodes(req, nodeInfo.type, {
            query: {_fields: {_doc: 1}}, pagination: {skip: nodeInfo.skip}},
        {readFromCache: false, updateCache: false});

    console.log('Total nodes: ' + nodes.length);

    for (let i = 0; i < nodes.length; ++i) {

        console.log('Node ' + (i + nodeInfo.skip) + " / " +  i);

        let fullNode = await dataCrudService.readNode(req, nodeInfo.type, {
            nodeId: nodes[i]['_doc']});
        await prepareTasksForNode(req, nodeInfo.type, fullNode, preparedAssociationDetailsList);
    }
};

async function fixAssociationDetails(req) {
    let assocs = await dataCrudService.queryAllAvailableNodes(req, 'associations', {
            query: {associationDetailsId: {$type: 'objectId'}}},
        {readFromCache: false, updateCache: false});

    console.log(assocs.length);
    for (let i = 0; i < assocs.length; ++i) {
        console.log(i);
        await associationCrud.updateAssociation(req, assocs[i]._doc,
            {associationDetailsId: assocs[i].associationDetailsId.toString()});
    }
}

export async function restoreAssociations(req) {
    // await associationCrud.clearAssociations();

    const nodeTypesForRelators = [
        // {type: constant.collectionPublicNames.staff, skip: 0},
        // {type: constant.collectionPublicNames.supplierContact, skip: 0},
        // {type: 'locations', skip: 0},
        // {type: constant.collectionPublicNames.department, skip: 0},
        // {type: 'categories', skip: 0},
        // {type: constant.collectionPublicNames.kit, skip: 0},
        // {type: constant.collectionPublicNames.content, skip: 0},
        // {type: constant.collectionPublicNames.menu, skip: 0},
        {type: 'suppliers', skip: 0},
        // {type: constant.collectionPublicNames.supplierDocs, skip: 0},
        // {type: constant.collectionPublicNames.template, skip: 0},
        // {type: 'venues', skip: 0},
        // {type: 'products', skip: 901},
        // {type: constant.collectionPublicNames.event, skip: 0},
        // {type: constant.collectionPublicNames.tasks, skip: 0},
    ];

    for (let i = 0; i < nodeTypesForRelators.length; ++i) {
        try {
            // const associationDetails = await associationCrud.queryAssocDetails(req,{
            //     'targetType': nodeTypesForRelators[i].type
            // });
            //
            // for (let i = 0; i < associationDetails.length; ++i) {
            //     if (associationDetails[i].mappings) {
            //         await associationCrud.removeAssociationsByAssocDetailsId(req, associationDetails[i]['_doc']);
            //     }
            // }

            await prepareTasksForNodeType(req, nodeTypesForRelators[i]);
        } catch (ex) {
            console.log(ex);
        }
    }
}



