/**
 * Error handling middleware
 * Catches errors and formats them into consistent API responses
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, formatError, normalizeStatusCode } from '../utils/error-handler';

/**
 * Not found middleware - handles 404 errors for undefined routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
}

/**
 * Error handler middleware - formats all errors into consistent responses
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Format the error using our utility
  const formattedError = formatError(err);
  
  // Get status code - default to 500 if not an AppError
  const statusCode = err instanceof AppError 
    ? err.statusCode 
    : normalizeStatusCode(formattedError.error.code === 'VALIDATION_ERROR' ? 422 : 500);
  
  // Log internal server errors
  if (statusCode >= 500) {
    console.error('Server error:', err);
  }
  
  // Send the formatted response
  res.status(statusCode).json(formattedError);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * 
 * @param fn - Async route handler function
 * @returns Wrapped handler that catches errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error middleware - handles validation errors from express-validator
 */
export function validationErrorHandler(req: Request, res: Response, next: NextFunction): void {
  // For use with express-validator
  // Example with express-validator:
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(422).json({
  //     success: false,
  //     error: {
  //       code: 'VALIDATION_ERROR',
  //       message: 'Validation failed',
  //       details: errors.array()
  //     }
  //   });
  // }
  next();
}

export default {
  notFoundHandler,
  errorHandler,
  asyncHandler,
  validationErrorHandler
};
