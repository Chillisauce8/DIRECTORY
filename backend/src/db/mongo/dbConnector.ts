import {MongoClient, GridFSBucket, Db} from 'mongodb';

let settings = require('../../../privateSettings');


class MongoDBConnector {
  private db: Db;
  private client: MongoClient;
  private connectionPromise: Promise<MongoClient>;

  public async getDBConnection() {
    return Promise.resolve(this.db);
  }

  public closeMongoConnection() {
    if (this.client) {
      this.client.close(true);
    }
  }

  public closeAll() {
    this.closeMongoConnection();
  }

  public async connect() {
    let attempts = settings.MONGO.connectAttempts;

    while(attempts--) {
      try {
        await this.connectDirect();

        if (this.client) {
          return this.client;
        }
      } catch(e) {
        if (this.client) {
          this.client.close(true);
        }

        this.client = null;
        this.db = null;
        this.connectionPromise = null;

        console.log(e);
      }
    }
  }

  public async getOrCreateBucket(bucketName: string) {
    const db = await this.getDBConnection();
    return new GridFSBucket(db, {bucketName});
  }

  private async connectDirect() {
    if (this.db) {
      return Promise.resolve(null);
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.getDirectConnectionPromise()
      .then(client => {
        this.client = client;
        this.db = this.client.db(settings.MONGO.db.dbName);

        return client;
      });

    return this.connectionPromise;
  }

  private async getDirectConnectionPromise(): Promise<MongoClient> {
    const connectionString = `mongodb+srv://${settings.MONGO.db.username}:${settings.MONGO.db.password}@` +
      `${settings.MONGO.mongoHost}/?retryWrites=true&w=majority&appName=${settings.MONGO.appName}`;

    try {
      const client = await MongoClient.connect(connectionString);

      if (!client) {
        throw 'Mongo connection error (direct connection): no client';
      }

      console.log('Mongo connected! (direct connection)');

      return client;
    } catch (e) {
      throw Error('Mongo connection error (direct connection): ' + (e?.message ?? e));
    }
  }
}



let mongoDBConnectorInstance: MongoDBConnector;

if ((<any>global).mongoDBConnectorInstance) {
  mongoDBConnectorInstance = (<any>global).mongoDBConnectorInstance;
} else {
  mongoDBConnectorInstance = new MongoDBConnector();
  (<any>global).mongoDBConnectorInstance = mongoDBConnectorInstance;
}

export {mongoDBConnectorInstance as MongoDBConnector};


let cleanup = function(ex) {
  if (ex) {
    if (ex.message) {
      console.log(ex.message);
    } else {
      console.log(ex);
    }

    if (ex.stack) {
      console.log(ex.stack);
    }
  }

  mongoDBConnectorInstance.closeAll();

  console.log("Server processing done");
  process.exit();
};

process.on('exit', cleanup);

// catches ctrl+c event
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', cleanup);
process.on('SIGUSR2', cleanup);

// catches uncaught exceptions
process.on('uncaughtException', cleanup);
process.on('uncaughtException', cleanup);
