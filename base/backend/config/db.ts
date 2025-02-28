/**
 * MongoDB connection configuration using native MongoDB driver
 * Provides functions for connecting to MongoDB and managing the client instance
 */

import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';
import env from './env';

// Connection options for MongoDB client
const mongoOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: env.MONGO_POOL_SIZE,
  connectTimeoutMS: env.MONGO_CONNECT_TIMEOUT_MS,
};

// Store the MongoDB client instance
let client: MongoClient | null = null;

/**
 * Connect to MongoDB and return the client instance
 * Uses a singleton pattern to ensure only one connection is created
 */
export async function getMongoClient(): Promise<MongoClient> {
  try {
    // Return existing client if it's already connected
    if (client && client.topology?.isConnected()) {
      return client;
    }

    // Create a new MongoDB client
    client = new MongoClient(env.MONGO_URI, mongoOptions);
    
    // Connect to MongoDB
    await client.connect();
    
    // Verify connection with a ping
    await client.db("admin").command({ ping: 1 });
    
    console.log("Successfully connected to MongoDB");
    
    // Handle application shutdown
    setupConnectionCleanup(client);
    
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error(`Could not connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get the database instance
 */
export async function getDatabase() {
  const client = await getMongoClient();
  return client.db(env.MONGO_DB_NAME);
}

/**
 * Close the MongoDB connection when the application shuts down
 */
function setupConnectionCleanup(mongoClient: MongoClient): void {
  // Handle graceful shutdown
  const cleanup = async () => {
    if (mongoClient) {
      console.log('Closing MongoDB connection...');
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  };

  // Listen for application termination signals
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGHUP', cleanup);
}

export default {
  getMongoClient,
  getDatabase,
};
