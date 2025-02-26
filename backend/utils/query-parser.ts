/**
 * Query parsing utilities
 * Converts HTTP query parameters to MongoDB query options
 */

import { Document, Sort } from 'mongodb';
import { 
  Filter, 
  RawQueryParams, 
  SortOptions,
  QueryOptions,
  MongoDBQuery,
  PaginationOptions,
  FilterOperatorValue,
  FieldSelectionOptions
} from '../types/query';
import { BadRequestError } from './error-handler';
import { isValidObjectId, toObjectId } from './object-id';

// Default query parameters
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse query string parameters into structured query options
 * 
 * @param queryParams - Raw query parameters from HTTP request
 * @returns Structured query options
 */
export function parseQueryParams(queryParams: Record<string, string | string[]>): QueryOptions {
  const result: QueryOptions = {};

  // Normalize params (handle both single strings and arrays)
  const normalizedParams = normalizeQueryParams(queryParams);

  // Extract and parse different parts of the query
  result.filter = parseFilterParams(normalizedParams);
  result.sort = parseSortParams(normalizedParams.sort);
  result.pagination = parsePaginationParams(normalizedParams);
  result.fields = parseFieldParams(normalizedParams.fields);

  return result;
}

/**
 * Normalize query parameters to handle both string and array formats
 * 
 * @param queryParams - Raw query parameters from HTTP request
 * @returns Normalized query parameters with consistent types
 */
function normalizeQueryParams(queryParams: Record<string, string | string[]>): RawQueryParams {
  const result: Record<string, string> = {};

  // Convert arrays to single values and handle filter parameters specially
  Object.entries(queryParams).forEach(([key, value]) => {
    // Handle filter parameters
    if (key.startsWith('filter[') && key.endsWith(']')) {
      const fieldName = key.substring(7, key.length - 1);
      const fieldValue = Array.isArray(value) ? value[0] : value;
      
      if (!result.filter) {
        result.filter = {};
      }
      
      if (typeof result.filter === 'object') {
        // @ts-ignore - We know this is a Record<string, string> at runtime
        result.filter[fieldName] = fieldValue;
      }
    } else {
      // Handle normal parameters
      result[key] = Array.isArray(value) ? value[0] : value;
    }
  });

  return result as RawQueryParams;
}

/**
 * Parse filter parameters from query string
 * 
 * @param params - Raw query parameters with filter data
 * @returns Structured filter object for MongoDB queries
 */
function parseFilterParams(params: RawQueryParams): Filter | undefined {
  if (!params.filter || typeof params.filter !== 'object') {
    return undefined;
  }

  const filter: Filter = {};

  // Process each filter field
  Object.entries(params.filter).forEach(([field, value]) => {
    // Handle special operators in filter values
    if (typeof value === 'string' && value.includes('$')) {
      try {
        // Try to parse value as JSON if it looks like an operator object
        const operatorObj = JSON.parse(value);
        if (typeof operatorObj === 'object') {
          filter[field] = operatorObj;
          return;
        }
      } catch {
        // Not valid JSON, continue with normal processing
      }
    }
    
    // Handle ObjectId fields
    if (field === '_id' || field.endsWith('Id')) {
      if (isValidObjectId(value)) {
        filter[field] = toObjectId(value.toString());
        return;
      }
    }
    
    // Handle boolean values
    if (value === 'true' || value === 'false') {
      filter[field] = value === 'true';
      return;
    }
    
    // Handle numeric values
    if (/^-?\d+(\.\d+)?$/.test(value as string)) {
      filter[field] = Number(value);
      return;
    }
    
    // Default: treat as string
    filter[field] = value;
  });

  return filter;
}

/**
 * Parse sorting parameters from query string
 * 
 * @param sortParam - Sort parameter (e.g., 'field' or '-field' for descending)
 * @returns MongoDB sort options
 */
function parseSortParams(sortParam?: string): SortOptions | undefined {
  if (!sortParam) {
    return undefined;
  }

  const sortOptions: SortOptions = {};
  
  // Handle comma-separated sort fields: "name,-age,+created"
  const sortFields = sortParam.split(',');
  
  sortFields.forEach((field) => {
    if (field.startsWith('-')) {
      // Descending order
      sortOptions[field.substring(1)] = -1;
    } else if (field.startsWith('+')) {
      // Ascending order (explicit)
      sortOptions[field.substring(1)] = 1;
    } else {
      // Ascending order (implicit)
      sortOptions[field] = 1;
    }
  });

  return sortOptions;
}

/**
 * Parse pagination parameters from query string
 * 
 * @param params - Raw query parameters
 * @returns Pagination options (page-based or cursor-based)
 */
function parsePaginationParams(params: RawQueryParams): PaginationOptions {
  const pagination: PaginationOptions = {
    limit: Number(params.limit) || DEFAULT_LIMIT
  };

  // Cap the limit to prevent excessive queries
  if (pagination.limit > MAX_LIMIT) {
    pagination.limit = MAX_LIMIT;
  }

  // Cursor-based pagination takes precedence if 'after' is specified
  if (params.after) {
    return {
      ...pagination,
      after: params.after
    };
  }

  // Otherwise use page-based pagination
  return {
    ...pagination,
    page: Number(params.page) || 1
  };
}

/**
 * Parse fields parameter for projection
 * 
 * @param fieldsParam - Fields parameter (e.g., 'name,age' or '-password')
 * @returns Field selection options
 */
function parseFieldParams(fieldsParam?: string): FieldSelectionOptions | undefined {
  if (!fieldsParam) {
    return undefined;
  }

  const fields: string[] = [];
  const excludeFields: string[] = [];

  // Split the fields string by commas
  const fieldList = fieldsParam.split(',').map(f => f.trim()).filter(Boolean);

  // Separate include and exclude fields
  fieldList.forEach(field => {
    if (field.startsWith('-')) {
      excludeFields.push(field.substring(1));
    } else {
      fields.push(field);
    }
  });

  // Return object with the appropriate arrays
  return {
    ...(fields.length > 0 && { fields }),
    ...(excludeFields.length > 0 && { excludeFields })
  };
}

/**
 * Convert query options to MongoDB query format
 * 
 * @param options - Structured query options
 * @returns MongoDB query parameters
 */
export function buildMongoQuery(options: QueryOptions): MongoDBQuery {
  // Default query structure
  const mongoQuery: MongoDBQuery = {
    filter: {},
    sort: {},
    skip: 0,
    limit: DEFAULT_LIMIT
  };

  // Apply filter if provided
  if (options.filter) {
    mongoQuery.filter = options.filter;
  }

  // Apply sort if provided
  if (options.sort) {
    mongoQuery.sort = options.sort as Sort;
  } else {
    // Default sort by _id for consistent ordering
    mongoQuery.sort = { _id: -1 };
  }

  // Apply pagination
  if (options.pagination) {
    mongoQuery.limit = options.pagination.limit || DEFAULT_LIMIT;
    
    // Handle page-based pagination
    if ('page' in options.pagination && options.pagination.page) {
      mongoQuery.skip = (options.pagination.page - 1) * mongoQuery.limit;
    }
    
    // Note: Cursor-based pagination requires special handling in the service layer
  }

  // Apply field projection
  if (options.fields) {
    mongoQuery.projection = buildProjection(options.fields);
  }

  return mongoQuery;
}

/**
 * Build MongoDB projection object from field selection options
 * 
 * @param fieldOptions - Field selection options
 * @returns MongoDB projection object
 */
function buildProjection(fieldOptions: FieldSelectionOptions): Document {
  const projection: Document = {};

  // Handle included fields (whitelist)
  if (fieldOptions.fields && fieldOptions.fields.length > 0) {
    fieldOptions.fields.forEach(field => {
      projection[field] = 1;
    });
  }

  // Handle excluded fields (blacklist)
  // Note: MongoDB doesn't allow mixing inclusion and exclusion,
  // except for _id which can be specifically excluded
  if (fieldOptions.excludeFields && fieldOptions.excludeFields.length > 0) {
    // If we already have inclusions, we can only exclude _id
    if (fieldOptions.fields && fieldOptions.fields.length > 0) {
      if (fieldOptions.excludeFields.includes('_id')) {
        projection._id = 0;
      }
    } else {
      // Otherwise, we can exclude any fields
      fieldOptions.excludeFields.forEach(field => {
        projection[field] = 0;
      });
    }
  }

  return projection;
}
