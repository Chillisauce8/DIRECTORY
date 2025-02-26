/**
 * Generic collection service
 * Provides reusable operations for any MongoDB collection
 */

import { 
  Collection, 
  Document, 
  ObjectId, 
  Filter,
  FindOptions,
  UpdateFilter,
  InsertOneResult,
  InsertManyResult,
  UpdateResult,
  DeleteResult,
  WithId,
  OptionalUnlessRequiredId
} from 'mongodb';

import { DatabaseService } from './db';
import { DatabaseError, NotFoundError } from '../utils/error-handler';
import { QueryOptions, MongoDBQuery, isCursorPagination } from '../types/query';
import { buildMongoQuery } from '../utils/query-parser';
import { 
  toObjectId, 
  isValidObjectId, 
  convertIdsInFilter,
  objectIdToString 
} from '../utils/object-id';
import { PaginationMeta } from '../types/api-response';

/**
 * Generic collection service that provides CRUD operations for MongoDB collections
 * Can be extended for collection-specific operations
 */
export class CollectionService<T extends Document = Document> {
  private collectionName: string;

  /**
   * Create a collection service instance
   * 
   * @param collectionName - Name of the MongoDB collection
   */
  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Get the MongoDB collection instance
   * 
   * @returns The MongoDB collection
   */
  protected async getCollection(): Promise<Collection<T>> {
    return DatabaseService.getCollection<T>(this.collectionName);
  }

  /**
   * Find documents with advanced filtering, sorting, and pagination
   * 
   * @param queryOptions - Options for filtering, sorting, and pagination
   * @returns Documents array and pagination metadata
   */
  async findMany(queryOptions: QueryOptions = {}): Promise<{
    data: Array<WithId<T>>;
    meta: PaginationMeta;
  }> {
    try {
      const collection = await this.getCollection();
      const mongoQuery = buildMongoQuery(queryOptions);
      
      // Special handling for cursor-based pagination
      if (
        queryOptions.pagination && 
        isCursorPagination(queryOptions.pagination) && 
        queryOptions.pagination.after
      ) {
        // If we have a cursor, add _id condition to the filter
        const cursorId = queryOptions.pagination.after;
        
        if (isValidObjectId(cursorId)) {
          const cursor = toObjectId(cursorId);
          
          // Add _id < cursor to filter for descending order
          // or _id > cursor for ascending order
          const sortDir = Object.values(mongoQuery.sort)[0] ?? -1;
          const compare = sortDir === -1 ? { $lt: cursor } : { $gt: cursor };
          
          mongoQuery.filter = {
            ...mongoQuery.filter,
            _id: compare
          };
        }
      }
      
      // Count total matching documents (without pagination)
      const totalCount = await collection.countDocuments(mongoQuery.filter);
      
      // Find documents with all options
      const cursor = collection.find(mongoQuery.filter, {
        sort: mongoQuery.sort,
        skip: mongoQuery.skip,
        limit: mongoQuery.limit,
        projection: mongoQuery.projection
      });
      
      // Convert cursor to array
      const data = await cursor.toArray();
      
      // Determine if there are more pages
      const hasNextPage = 
        mongoQuery.skip + data.length < totalCount || 
        data.length === mongoQuery.limit;
      
      // Calculate total pages
      const pageCount = Math.ceil(totalCount / mongoQuery.limit);
      
      // Current page number
      const currentPage = mongoQuery.skip / mongoQuery.limit + 1;
      
      // Build metadata for response
      const meta: PaginationMeta = {
        totalCount,
        limit: mongoQuery.limit,
        page: currentPage,
        pageCount,
        hasNextPage,
        hasPrevPage: currentPage > 1
      };
      
      return { data, meta };
    } catch (error) {
      console.error(`Error finding documents in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to retrieve ${this.collectionName}`);
    }
  }

  /**
   * Find a single document by its ObjectId
   * 
   * @param id - Document ObjectId or string
   * @param projection - Fields to include or exclude
   * @returns The found document or null
   */
  async findById(
    id: string | ObjectId, 
    projection: Document = {}
  ): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? toObjectId(id) : id;
      
      return await collection.findOne({ _id: objectId } as Filter<T>, { projection });
    } catch (error) {
      console.error(`Error finding document by ID in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to retrieve document from ${this.collectionName}`);
    }
  }

  /**
   * Find a single document by an arbitrary filter
   * 
   * @param filter - MongoDB filter
   * @param projection - Fields to include or exclude
   * @returns The found document or null
   */
  async findOne(
    filter: Filter<T>, 
    projection: Document = {}
  ): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      const safeFilter = convertIdsInFilter(filter as Record<string, any>);
      
      return await collection.findOne(safeFilter as Filter<T>, { projection });
    } catch (error) {
      console.error(`Error finding document in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to retrieve document from ${this.collectionName}`);
    }
  }

  /**
   * Count documents matching a filter
   * 
   * @param filter - MongoDB filter
   * @returns Count of matching documents
   */
  async count(filter: Filter<T> = {}): Promise<number> {
    try {
      const collection = await this.getCollection();
      const safeFilter = convertIdsInFilter(filter as Record<string, any>);
      
      return await collection.countDocuments(safeFilter as Filter<T>);
    } catch (error) {
      console.error(`Error counting documents in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to count documents in ${this.collectionName}`);
    }
  }

  /**
   * Create a new document
   * 
   * @param data - Document data to insert
   * @returns Created document with _id
   */
  async create(data: OptionalUnlessRequiredId<T>): Promise<WithId<T>> {
    try {
      const collection = await this.getCollection();
      
      // Add timestamps
      const timestampedData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(timestampedData as OptionalUnlessRequiredId<T>);
      
      if (!result.acknowledged) {
        throw new DatabaseError(`Failed to insert document into ${this.collectionName}`);
      }
      
      // Return the complete document with _id
      const created = { 
        _id: result.insertedId,
        ...timestampedData
      } as unknown as WithId<T>;
      
      return created;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to create document in ${this.collectionName}`);
    }
  }

  /**
   * Create multiple documents
   * 
   * @param dataArray - Array of document data to insert
   * @returns Result of the bulk insertion
   */
  async createMany(
    dataArray: OptionalUnlessRequiredId<T>[]
  ): Promise<InsertManyResult<T>> {
    try {
      const collection = await this.getCollection();
      
      // Add timestamps to all documents
      const timestampedData = dataArray.map(data => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      return await collection.insertMany(
        timestampedData as OptionalUnlessRequiredId<T>[]
      );
    } catch (error) {
      console.error(`Error creating multiple documents in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to create multiple documents in ${this.collectionName}`);
    }
  }

  /**
   * Update a document by its ID
   * 
   * @param id - Document ObjectId or string
   * @param updateData - Data to update with
   * @param options - Update options (upsert, etc.)
   * @returns Updated document
   */
  async updateById(
    id: string | ObjectId,
    updateData: Partial<T>,
    { upsert = false } = {}
  ): Promise<WithId<T>> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? toObjectId(id) : id;
      
      // Never allow changing the _id field
      if (updateData._id) {
        delete (updateData as any)._id;
      }
      
      // Add an updated timestamp
      const timestampedUpdate = {
        ...updateData,
        updatedAt: new Date()
      };
      
      // Create the update with $set to only modify specified fields
      const update = { $set: timestampedUpdate };
      
      const result = await collection.findOneAndUpdate(
        { _id: objectId } as Filter<T>,
        update as unknown as UpdateFilter<T>,
        { 
          returnDocument: 'after', // Return the updated document
          upsert 
        }
      );
      
      if (!result.value) {
        throw new NotFoundError(`Document with ID ${objectIdToString(objectId)} not found in ${this.collectionName}`);
      }
      
      return result.value;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to update document in ${this.collectionName}`);
    }
  }

  /**
   * Replace an entire document by its ID
   * 
   * @param id - Document ObjectId or string
   * @param replaceData - Complete document data
   * @param options - Replace options (upsert, etc.)
   * @returns Replaced document
   */
  async replaceById(
    id: string | ObjectId,
    replaceData: Partial<T>,
    { upsert = false } = {}
  ): Promise<WithId<T>> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? toObjectId(id) : id;
      
      // Never allow changing the _id field
      if (replaceData._id) {
        delete (replaceData as any)._id;
      }
      
      // Add timestamps
      const timestampedData = {
        ...replaceData,
        updatedAt: new Date(),
        // Preserve creation date if this is a replace operation
        createdAt: (replaceData as any).createdAt || new Date()
      };
      
      const result = await collection.findOneAndReplace(
        { _id: objectId } as Filter<T>,
        timestampedData as unknown as WithId<T>,
        { 
          returnDocument: 'after',
          upsert
        }
      );
      
      if (!result.value) {
        throw new NotFoundError(`Document with ID ${objectIdToString(objectId)} not found in ${this.collectionName}`);
      }
      
      return result.value;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error(`Error replacing document in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to replace document in ${this.collectionName}`);
    }
  }

  /**
   * Delete a document by its ID
   * 
   * @param id - Document ObjectId or string
   * @returns Boolean indicating if document was deleted
   */
  async deleteById(id: string | ObjectId): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? toObjectId(id) : id;
      
      const result = await collection.deleteOne({ _id: objectId } as Filter<T>);
      
      return result.deletedCount === 1;
    } catch (error) {
      console.error(`Error deleting document in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to delete document from ${this.collectionName}`);
    }
  }

  /**
   * Delete multiple documents matching a filter
   * 
   * @param filter - MongoDB filter
   * @returns Result of the bulk deletion
   */
  async deleteMany(filter: Filter<T>): Promise<DeleteResult> {
    try {
      const collection = await this.getCollection();
      const safeFilter = convertIdsInFilter(filter as Record<string, any>);
      
      return await collection.deleteMany(safeFilter as Filter<T>);
    } catch (error) {
      console.error(`Error deleting documents in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to delete documents from ${this.collectionName}`);
    }
  }

  /**
   * Update multiple documents matching a filter
   * 
   * @param filter - MongoDB filter
   * @param updateData - Data to update with
   * @returns Result of the bulk update
   */
  async updateMany(
    filter: Filter<T>,
    updateData: Partial<T>
  ): Promise<UpdateResult> {
    try {
      const collection = await this.getCollection();
      const safeFilter = convertIdsInFilter(filter as Record<string, any>);
      
      // Never allow changing the _id field
      if (updateData._id) {
        delete (updateData as any)._id;
      }
      
      // Add an updated timestamp
      const timestampedUpdate = {
        ...updateData,
        updatedAt: new Date()
      };
      
      // Create the update with $set to only modify specified fields
      const update = { $set: timestampedUpdate };
      
      return await collection.updateMany(
        safeFilter as Filter<T>, 
        update as unknown as UpdateFilter<T>
      );
    } catch (error) {
      console.error(`Error updating documents in ${this.collectionName}:`, error);
      throw new DatabaseError(`Failed to update documents in ${this.collectionName}`);
    }
  }
}

export default CollectionService;
