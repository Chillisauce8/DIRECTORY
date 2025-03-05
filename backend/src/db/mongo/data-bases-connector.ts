import { MongoDBConnector } from './dbConnector';


export async function connectProjectsDatabase() {
  await MongoDBConnector.connect();
}
