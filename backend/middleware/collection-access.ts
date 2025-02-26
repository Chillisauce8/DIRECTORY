/**
 * Collection access middleware
 * Controls access to collections based on user roles and permissions
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/error-handler';
import {
  CollectionPermissions,
  DEFAULT_ROLE_PERMISSIONS,
  UserRole
} from '../types/auth';

// Type of operation performed on a collection
type OperationType = 'read' | 'create' | 'update' | 'delete';

/**
 * Maps HTTP methods to operation types
 */
const HTTP_METHOD_TO_OPERATION: Record<string, OperationType> = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete'
};

/**
 * Get collection permissions for a specific role and collection
 * 
 * @param role - User role
 * @param collection - Collection name
 * @returns Collection permissions object
 */
function getCollectionPermissions(
  role: UserRole,
  collection: string
): CollectionPermissions {
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role];
  
  // Check for specific collection permissions
  if (rolePermissions[collection]) {
    return rolePermissions[collection];
  }
  
  // Fall back to wildcard permissions
  return rolePermissions['*'] || {
    read: false,
    create: false,
    update: false,
    delete: false
  };
}

/**
 * Check if a user has permission to perform an operation on a collection
 * 
 * @param role - User role
 * @param collection - Collection name
 * @param operation - Operation type
 * @returns Boolean indicating if the operation is allowed
 */
export function hasCollectionPermission(
  role: UserRole,
  collection: string,
  operation: OperationType
): boolean {
  const permissions = getCollectionPermissions(role, collection);
  return permissions[operation] === true;
}

/**
 * Extract collection name from request path
 * 
 * @param req - Express request object
 * @returns Collection name
 */
function extractCollectionFromRequest(req: Request): string {
  // Various strategies to extract collection name from request path
  
  // For path pattern /api/v1/:collection
  const pathParts = req.path.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    // Take the collection name from path, typically the last or second-to-last segment
    return pathParts[pathParts.length - (req.params.id ? 2 : 1)];
  }
  
  // For routes defined with collection parameter
  if (req.params.collection) {
    return req.params.collection;
  }
  
  // Default or fallback
  return 'unknown';
}

/**
 * Middleware to check if user has permission to access a collection
 * Determines collection name and operation from the request
 */
export function checkCollectionAccess(req: Request, res: Response, next: NextFunction): void {
  // Guest role if not authenticated
  const role: UserRole = req.user?.role || 'guest';
  
  // Extract collection name from URL
  const collection = extractCollectionFromRequest(req);
  
  // Map HTTP method to operation type
  const operation = HTTP_METHOD_TO_OPERATION[req.method] || 'read';
  
  // Check permission
  if (!hasCollectionPermission(role, collection, operation)) {
    return next(
      new ForbiddenError(
        `You don't have permission to ${operation} in the ${collection} collection`
      )
    );
  }
  
  next();
}

/**
 * Factory function to create middleware for a specific collection
 * 
 * @param collection - Collection name
 * @returns Middleware function
 */
export function collectionAccess(collection: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Guest role if not authenticated
    const role: UserRole = req.user?.role || 'guest';
    
    // Map HTTP method to operation type
    const operation = HTTP_METHOD_TO_OPERATION[req.method] || 'read';
    
    // Check permission
    if (!hasCollectionPermission(role, collection, operation)) {
      return next(
        new ForbiddenError(
          `You don't have permission to ${operation} in the ${collection} collection`
        )
      );
    }
    
    next();
  };
}

export default {
  checkCollectionAccess,
  collectionAccess,
  hasCollectionPermission
};
