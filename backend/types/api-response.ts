/**
 * Type definitions for API responses
 * Ensures consistent response structure across all API endpoints
 */

// Base API response interface that all responses extend
export interface ApiResponse {
  success: boolean;
  message?: string;
}

// Standard success response for single resource operations
export interface SuccessResponse<T = any> extends ApiResponse {
  success: true;
  data: T;
}

// Error response with details about what went wrong
export interface ErrorResponse extends ApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination metadata for list responses
export interface PaginationMeta {
  // Total count of items matching the query (before pagination)
  totalCount: number;
  // Number of items per page
  limit: number;
  // Current page number (1-indexed)
  page: number;
  // Total number of pages
  pageCount: number;
  // Has more pages flag
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Response for paginated list data
export interface ListResponse<T = any> extends SuccessResponse<T[]> {
  meta: PaginationMeta;
}

// Response for count operations
export interface CountResponse extends SuccessResponse<number> {
  count: number;
}

// Response for bulk operations
export interface BulkOperationResponse extends SuccessResponse {
  results: {
    success: number;
    failed: number;
    errors?: Record<string, string>;
  };
}

// Factory function to create a success response
export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

// Factory function to create a list response
export function createListResponse<T>(
  data: T[],
  meta: PaginationMeta,
  message?: string
): ListResponse<T> {
  return {
    success: true,
    data,
    meta,
    ...(message && { message })
  };
}

// Factory function to create an error response
export function createErrorResponse(
  code: string,
  message: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  };
}
