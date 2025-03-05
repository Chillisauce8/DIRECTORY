import * as _ from 'lodash';
import {MongoDBConnector} from '../mongo/dbConnector';
import {nodeSystemDataHelper} from './nodeSystemDataHelper';
import {Db} from 'mongodb';

const fs = require('fs');


export type CollectionName = string;
export type Query = Record<string, any>;


export class MongoCrudClient {

  public async queryNodes(collectionName: CollectionName, query?: Query, pagination: Object|undefined=undefined): Promise<any[]> {
    if (!query) {
      query = {};
    }

    let clonedQuery = _.clone(query);

    let skip = (pagination && pagination['skip']) ? +pagination['skip'] : null;
    let limit = (pagination && pagination['limit']) ? +pagination['limit'] : null;
    let sort = pagination && pagination['sort'];

    let fields = clonedQuery['_fields'] || {};
    delete clonedQuery['_fields'];
    delete clonedQuery['_type'];

    const db = await MongoDBConnector.getDBConnection();

    let cursor = this._getCollection(db, collectionName, clonedQuery)
      .find(clonedQuery)
      .project(fields);

    if (skip) {
      cursor = cursor.skip(skip);
    }

    if (sort) {
      cursor = cursor.sort(sort);
    }

    if (limit) {
      cursor = cursor.limit(limit);
    }

    return cursor.toArray();
  }

  public async queryOne(collectionName: CollectionName, query: Query): Promise<any> {
    let clonedQuery = _.clone(query);

    let fieldsParam = clonedQuery['_fields'] ? {projection: clonedQuery['_fields']} : {};

    delete clonedQuery['_fields'];
    delete clonedQuery['_type'];

    const db = await MongoDBConnector.getDBConnection();

    return this._getCollection(db, collectionName, clonedQuery)
      .findOne(clonedQuery, fieldsParam);
  }

  public async queryAggregate(collectionName: CollectionName, query: Query | Query[]) {
    const db = await MongoDBConnector.getDBConnection();
    const aggregateQueryArray: Query[] = _.isArray(query) ? query as Query[] : [query];

    return this._getCollection(db, collectionName, aggregateQueryArray)
      .aggregate(aggregateQueryArray);
  }

  public async queryNodeCount(collectionName: CollectionName, query?: Query) {
    if (!query) {
      query = {};
    }

    let clonedQuery = _.clone(query);

    delete clonedQuery['_type'];
    delete clonedQuery['_fields'];

    const db = await MongoDBConnector.getDBConnection();

    return this._getCollection(db, collectionName, clonedQuery)
      .countDocuments(clonedQuery);
  }

  public async insertNode(collectionName: CollectionName, node: any): Promise<any> {
    const db = await MongoDBConnector.getDBConnection();

    nodeSystemDataHelper.deleteUndefinedProperties(node);

    return this._getCollection(db, collectionName, {})
      .insertOne(node)
      .then(() => node);
  }

  public async insertNodeArray(collectionName: CollectionName, nodeList: any[]): Promise<any> {
    const db =  await MongoDBConnector.getDBConnection();

    return this._getCollection(db, collectionName, {})
      .insertMany(nodeList)
      .then(() => nodeList);
  }

  public async updateNode(collectionName: CollectionName, query: Query, node: any) : Promise<any> {
    const db = await MongoDBConnector.getDBConnection();

    nodeSystemDataHelper.deleteUndefinedProperties(node);

    return this._getCollection(db, collectionName, query)
      .replaceOne(query, node, {})
      .then(() => node);
  }

  public async setForManyNodes(collectionName: CollectionName, query: Query, data: any) : Promise<any> {
    const db = await MongoDBConnector.getDBConnection();

    nodeSystemDataHelper.deleteUndefinedProperties(data);

    return this._getCollection(db, collectionName, query)
      .updateMany(query, {$set: data}, {})
      .then(() => true);
  }

  public async deleteNode(collectionName: CollectionName, query: Query) : Promise<any> {
    const db = await MongoDBConnector.getDBConnection();

    return this._getCollection(db, collectionName, query)
      .findOneAndDelete(query)
      .then(r => r?.ok === 1);
  }

  public async deleteNodes(collectionName: CollectionName, query: Query) : Promise<any> {
    const db = await MongoDBConnector.getDBConnection();

    return this._getCollection(db, collectionName, query)
      .deleteMany(query)
      .then(() => true);
  }

  public async hasCollection(collectionName: CollectionName) {
    const db = await MongoDBConnector.getDBConnection();
    return db.listCollections({ name: collectionName }).hasNext();
  }

  public async createCollection(collectionName: CollectionName, additionalParams: any = {}) {
    const db = await MongoDBConnector.getDBConnection();

    return db.createCollection(collectionName, additionalParams)
      .then(() => true);
  }

  public async deleteCollection(collectionName: CollectionName) {
    let hasCollection = await this.hasCollection(collectionName);

    if (!hasCollection) {
      return true;
    }

    const db = await MongoDBConnector.getDBConnection();

    return db.collection(collectionName)
      .drop();
  }

  public async renameCollection(collectionName: CollectionName, newCollectionName: CollectionName) {
    const db = await MongoDBConnector.getDBConnection();

    const hasCollection = await this.hasCollection(collectionName);

    if (!hasCollection) {
      return true;
    }

    return db.collection(collectionName).rename(newCollectionName);
  }

  public async updateCollectionValidator(collectionName: CollectionName, validator: any, commandAdditionalParams?: any) {
    const db = await MongoDBConnector.getDBConnection();

    let command = commandAdditionalParams ? commandAdditionalParams : {};

    command = {collMod: collectionName, validator, ...command};

    return db.command(command)
      .then(() => true);
  }

  public async getCollectionList() {
    const db = await MongoDBConnector.getDBConnection();

    return db.listCollections({}, {nameOnly: true})
      .toArray();
  }

  public async getOrCreateBucket(bucketName: string) {
    return MongoDBConnector.getOrCreateBucket(bucketName);
  }

  public async uploadFile(bucketName: string, fileName: string) {
    const bucket = await this.getOrCreateBucket(bucketName);

    await new Promise((resolve, reject) => {
      fs.createReadStream(fileName)
        .pipe(bucket.openUploadStream(fileName, {chunkSizeBytes: 255 * 1024, metadata: {/* todo */}}))
        .on('finish', () => resolve(null))
        .on('error', (error) => reject(error));
    });

    fs.unlinkSync(fileName);
  }

  private _getCollection(db: Db, collectionName: CollectionName, query: Query) {
    if (!_.isString(collectionName)) {
      console.error('Bad collection name for query ' + JSON.stringify(query));
      throw new Error('Bad collection name');
    }

    return db.collection(collectionName);
  }
}

