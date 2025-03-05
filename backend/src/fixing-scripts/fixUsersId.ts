import { coreServiceLocator } from '../serviceLocator';
import { MongoCrudClient } from '../db';


const dataCrudService = coreServiceLocator.get('dataCrudService');


export async function fixUserSecurity(req) {
    const users = await dataCrudService.queryAllAvailableNodes(req, 'users', {});

    let i = 0;

    for (const user of users) {
        console.log(++i);

        const userSecurityNode = await dataCrudService.querySingleNode(req, 'userSecurity',
            {query: {
                    userId: user._oldDoc
            }});

        if (userSecurityNode) {
            userSecurityNode.userId = user._doc;

            await dataCrudService.updateNode(req, 'userSecurity', userSecurityNode);
        }
    }
}

export async function fixSupplierContactsUsersId(req) {
    const mongoCrudClient = new MongoCrudClient();

    const query = {
        "lastUpdated.date": {$gt: "2023-06-27"}
    };

    const supplierContacts = await dataCrudService.queryAllAvailableNodes(req, 'supplierContacts', {query});

    console.log('Total supplierContacts', supplierContacts.length);

    let i = 0;

    for (const supplierContact of supplierContacts) {
        console.log(++i);

        if (supplierContact.userId === supplierContact._doc) {
            continue;
        }

        const currentUserId = supplierContact.userId;

        let userNode;

        try {
            userNode = await dataCrudService.readNode(req, 'users', {nodeId: currentUserId});
        } catch (ex) {
            console.log(currentUserId, '- user not found');
            continue;
        }

        userNode._oldDoc = userNode._doc;
        userNode._doc = supplierContact._doc;

        await mongoCrudClient.updateNode('users', {_id: userNode._id}, userNode);

        supplierContact.userId = supplierContact._doc;

        await dataCrudService.updateNode(req, 'supplierContacts', supplierContact,
            {ignoreStateRestore: true, ignoreLastUpdatedInfo: true, ignoreRelators: true,
                ignoreEventSending: true,
                updateCache: false,
                ignoreDiff: true});
    }
}
