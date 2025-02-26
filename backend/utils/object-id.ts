/**
 * MongoDB ObjectId utilities
 * Provides functions for validating and converting ObjectIds
 */

import { ObjectId } from 'mongodb';
import { BadRequestError } from './error-handler';

/**
 * Check if a string is a valid MongoDB ObjectId
 * 
 * @param id - The string to validate as ObjectId
 * @returns True if valid, false otherwise
 */
export function isValidObjectId(id: any): boolean {
  // Check if it's a string first
  if (typeof id !== 'string') {
    return false;
  }
  
  // Try to match the ObjectId pattern (24 hex characters)
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Convert a string to MongoDB ObjectId
 * 
 * @param id - The string to convert
 * @returns ObjectId instance
 * @throws BadRequestError if the id is invalid
 */
export function toObjectId(id: string): ObjectId {
  if (!isValidObjectId(id)) {
    throw new BadRequestError(`Invalid ID format: ${id}`);
  }
  
  try {
    return new ObjectId(id);
  } catch (error) {
    throw new BadRequestError(`Failed to convert to ObjectId: ${id}`);
  }
}

/**
 * Safely convert a string to MongoDB ObjectId without throwing an error
 * 
 * @param id - The string to convert
 * @returns ObjectId instance or null if invalid
 */
export function safeToObjectId(id: string): ObjectId | null {
  if (!isValidObjectId(id)) {
    return null;
  }
  
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Convert multiple string IDs to MongoDB ObjectIds
 * 
 * @param ids - Array of ID strings
 * @returns Array of ObjectId instances
 * @throws BadRequestError if any ID is invalid
 */
export function toObjectIds(ids: string[]): ObjectId[] {
  return ids.map(id => toObjectId(id));
}

/**
 * Generate a new MongoDB ObjectId
 * 
 * @returns New ObjectId instance
 */
export function generateObjectId(): ObjectId {
  return new ObjectId();
}

/**
 * Convert ObjectId to string
 * 
 * @param id - The ObjectId to convert
 * @returns String representation of the ObjectId
 */
export function objectIdToString(id: ObjectId | string): string {
  if (typeof id === 'string') {
    return id;
  }
  return id.toString();
}

/**
 * Replace string IDs with ObjectIds in a MongoDB filter object
 * 
 * @param filter - The filter object potentially containing string IDs
 * @returns Filter with '_id' fields converted to ObjectId
 */
export function convertIdsInFilter(filter: Record<string, any>): Record<string, any> {
  const result = { ...filter };
  
  // Convert simple _id field
  if (result._id && typeof result._id === 'string' && isValidObjectId(result._id)) {
    result._id = toObjectId(result._id);
  }
  
  // Handle _id with operators ($in, $eq, etc.)
  if (result._id && typeof result._id === 'object') {
    // Handle $in operator with array of IDs
    if (Array.isArray(result._id.$in)) {
      result._id.$in = result._id.$in
        .filter((id: any) => typeof id === 'string' && isValidObjectId(id))
        .map((id: string) => toObjectId(id));
    }
    
    // Handle $eq operator
    if (result._id.$eq && typeof result._id.$eq === 'string' && isValidObjectId(result._id.$eq)) {
      result._id.$eq = toObjectId(result._id.$eq);
    }
  }
  
  return result;
}
