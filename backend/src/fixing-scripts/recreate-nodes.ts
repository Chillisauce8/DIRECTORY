// @ts-ignore
import { Db, ObjectId } from 'mongodb';
import { MongoCrudClient } from '../db';
import { coreServiceLocator } from '../serviceLocator';

const mongoCrudClient = new MongoCrudClient();
const dataCrudService = coreServiceLocator.get('dataCrudService');


const collectionNames = ['roles', 'users', 'userSecurity', 'grids',
];

export async function recreateNodes(req) {
    for (const collectionName of collectionNames) {
        const nodes = await dataCrudService.queryAllAvailableNodes(req, collectionName,
            {query: {_doc: {$exists: true}, _fields: {_doc: 1}}}, {readFromCache: false, updateCache: false});

        console.log('collectionName', collectionName);
        console.log('Nodes count', nodes.length);

        let i = 0;

        for (const oldNode of nodes) {
            console.log(++i);

            const existingNewNode = await mongoCrudClient.queryOne(
                collectionName, {_id: new ObjectId(oldNode._doc)});

            if (existingNewNode) {
                await mongoCrudClient.deleteNode(collectionName, {_doc: oldNode._doc});
                continue;
            }

            const fullOdlNode = await mongoCrudClient.queryOne(
                collectionName, {_doc: oldNode._doc});

            const newNode = {
                ...fullOdlNode,
                "_id": new ObjectId(fullOdlNode._doc),
            }

            delete newNode._doc;

            const result = await mongoCrudClient.insertNode(collectionName, newNode);

            await mongoCrudClient.deleteNode(collectionName, {_doc: oldNode._doc});
        }
    }
}







