/**
 * Type definitions for query parameters
 * Provides type safety for filtering, sorting, pagination and field selection
 */

import { Document, Sort } from 'mongodb';

// MongoDB comparison operators
export type ComparisonOperator = 
  '$eq' | '$gt' | '$gte' | '$in' | '$lt' | '$lte' | '$ne' | '$nin' | '$regex';

// MongoDB logical operators
export type LogicalOperator = '$and' | '$not' | '$nor' | '$or';

// Supported operators for API filtering
export type SupportedOperator = ComparisonOperator | LogicalOperator;

// Type for a single filter value
export type FilterValue = string | number | boolean | Date | null | string[];

// Type for filter with operators
export type FilterOperatorValue = {
  [key in ComparisonOperator]?: FilterValue;
};

// Filter field can be a simple value or an operator object
export type FilterField = FilterValue | FilterOperatorValue;

// Complete filter structure
export interface Filter {
  [field: string]: FilterField;
}

// Pagination options with page number
export interface PageBasedPagination {
  page?: number;
  limit?: number;
}

// Pagination options with cursor
export interface CursorBasedPagination {
  after?: string;
  limit?: number;
}

// Combined pagination options
export type PaginationOptions = PageBasedPagination | CursorBasedPagination;

// Sorting options
export interface SortOptions {
  [field: string]: 1 | -1; // 1 for ascending, -1 for descending
}

// Field selection options
export interface FieldSelectionOptions {
  fields?: string[]; // Fields to include
  excludeFields?: string[]; // Fields to exclude
}

// All query options combined
export interface QueryOptions {
  filter?: Filter;
  sort?: SortOptions;
  pagination?: PaginationOptions;
  fields?: FieldSelectionOptions;
}

// Type for query parameters as they come from HTTP request
export interface RawQueryParams {
  filter?: Record<string, string>;
  sort?: string;
  page?: string;
  limit?: string;
  after?: string;
  fields?: string;
}

// Type for MongoDB query
export interface MongoDBQuery {
  filter: Document;
  sort: Sort;
  skip: number;
  limit: number;
  projection?: Document;
}

// Type guard to check if pagination is cursor-based
export function isCursorPagination(
  pagination: PaginationOptions
): pagination is CursorBasedPagination {
  return 'after' in pagination;
}

// Type guard to check if pagination is page-based
export function isPagePagination(
  pagination: PaginationOptions
): pagination is PageBasedPagination {
  return 'page' in pagination;
}
