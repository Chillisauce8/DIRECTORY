/**
 * Error handling utilities
 * Provides custom error classes and handling functions for consistent error responses
 */

import { ErrorResponse, createErrorResponse } from '../types/api-response';

// Base application error class
export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;

    // Properly capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error for invalid input data
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

// Error for authentication failures
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: any) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

// Error for permission issues
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', details?: any) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

// Error for resource not found
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

// Error for conflicts (e.g., duplicate entries)
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

// Error for validation failures
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

// Error for database issues
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

// Error for server issues
export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, 'SERVER_ERROR', details);
  }
}

/**
 * Format an error into a standardized API error response
 * 
 * @param error - The error to format
 * @returns Formatted error response
 */
export function formatError(error: Error | AppError): ErrorResponse {
  // Handle our custom AppError type
  if (error instanceof AppError) {
    return createErrorResponse(
      error.code,
      error.message,
      error.details
    );
  }

  // Handle MongoDB errors with special codes
  if (error.name === 'MongoServerError') {
    const mongoError = error as any;
    
    // Handle duplicate key error
    if (mongoError.code === 11000) {
      return createErrorResponse(
        'DUPLICATE_KEY',
        'A duplicate key error occurred',
        { keyPattern: mongoError.keyPattern }
      );
    }
  }

  // For unknown errors, return a generic server error
  console.error('Unhandled error:', error);
  return createErrorResponse(
    'SERVER_ERROR',
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
  );
}

/**
 * Convert a string HTTP status code to a number
 * 
 * @param status - The status code as string or number
 * @returns The numeric status code
 */
export function normalizeStatusCode(status: string | number): number {
  const parsedStatus = typeof status === 'string' ? parseInt(status, 10) : status;
  
  // Ensure it's a valid HTTP status code (100-599)
  if (isNaN(parsedStatus) || parsedStatus < 100 || parsedStatus > 599) {
    return 500;
  }
  
  return parsedStatus;
}
