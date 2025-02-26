/**
 * MongoDB database service
 * Provides utilities for working with MongoDB database and collections
 */

import { 
  Db, 
  Collection, 
  MongoClient,
  ServerApiVersion,
  MongoClientOptions 
} from 'mongodb';
import { DatabaseError } from '../utils/error-handler';
import { getMongoClient, getDatabase } from '../config/db';
import env from '../config/env';

// Cache for database collections to avoid retrieving them repeatedly
const collectionsCache = new Map<string, Collection>();

/**
 * Database service for MongoDB interactions
 */
export class DatabaseService {
  /**
   * Get the MongoDB database instance
   * 
   * @returns MongoDB database instance
   */
  public static async getDb(): Promise<Db> {
    try {
      return await getDatabase();
    } catch (error) {
      console.error('Failed to get database:', error);
      throw new DatabaseError('Could not connect to the database');
    }
  }

  /**
   * Get a collection with type safety
   * 
   * @param name - Collection name
   * @returns MongoDB collection with the specified type
   */
  public static async getCollection<T = any>(name: string): Promise<Collection<T>> {
    try {
      // Check if collection is in cache
      if (collectionsCache.has(name)) {
        return collectionsCache.get(name) as Collection<T>;
      }

      // Get database instance
      const db = await this.getDb();
      
      // Get and cache the collection
      const collection = db.collection<T>(name);
      collectionsCache.set(name, collection);
      
      return collection;
    } catch (error) {
      console.error(`Failed to get collection ${name}:`, error);
      throw new DatabaseError(`Could not access collection: ${name}`);
    }
  }

  /**
   * Check if a collection exists
   * 
   * @param name - Collection name to check
   * @returns Boolean indicating if collection exists
   */
  public static async collectionExists(name: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      const collections = await db.listCollections({ name }).toArray();
      return collections.length > 0;
    } catch (error) {
      console.error(`Failed to check if collection ${name} exists:`, error);
      throw new DatabaseError(`Could not verify collection: ${name}`);
    }
  }

  /**
   * Create a new collection if it doesn't exist
   * 
   * @param name - Collection name to create
   * @returns The created or existing collection
   */
  public static async createCollection<T = any>(name: string): Promise<Collection<T>> {
    try {
      const db = await this.getDb();
      const exists = await this.collectionExists(name);
      
      if (!exists) {
        await db.createCollection(name);
        console.log(`Collection '${name}' created`);
      }
      
      return await this.getCollection<T>(name);
    } catch (error) {
      console.error(`Failed to create collection ${name}:`, error);
      throw new DatabaseError(`Could not create collection: ${name}`);
    }
  }

  /**
   * Drop a collection if it exists
   * 
   * @param name - Collection name to drop
   * @returns Boolean indicating success
   */
  public static async dropCollection(name: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      const exists = await this.collectionExists(name);
      
      if (exists) {
        await db.dropCollection(name);
        // Remove from cache if present
        collectionsCache.delete(name);
        console.log(`Collection '${name}' dropped`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to drop collection ${name}:`, error);
      throw new DatabaseError(`Could not drop collection: ${name}`);
    }
  }

  /**
   * Get MongoDB client stats for monitoring
   * 
   * @returns Client connection information
   */
  public static async getStats(): Promise<any> {
    try {
      const client = await getMongoClient();
      const db = await this.getDb();
      
      // Get basic database stats
      const dbStats = await db.stats();
      
      // Get connection pool information if available
      const poolStats = client.topology?.s?.pool?.options?.maxPoolSize 
        ? {
            maxPoolSize: client.topology?.s?.pool?.options?.maxPoolSize,
            minPoolSize: client.topology?.s?.pool?.options?.minPoolSize,
            currentPoolSize: client.topology?.s?.pool?.size
          }
        : 'Connection pool stats not available';
      
      return {
        dbStats,
        poolStats,
        isConnected: client.topology?.isConnected?.() || false,
        databaseName: env.MONGO_DB_NAME
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw new DatabaseError('Could not retrieve database statistics');
    }
  }

  /**
   * Manually close the MongoDB connection
   * Useful for testing or graceful shutdown
   */
  public static async closeConnection(): Promise<void> {
    try {
      const client = await getMongoClient();
      await client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Failed to close MongoDB connection:', error);
      throw new DatabaseError('Could not close database connection');
    }
  }
}

export default DatabaseService;
