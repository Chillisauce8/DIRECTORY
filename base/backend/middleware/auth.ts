/**
 * Authentication middleware
 * Verifies JWT tokens and adds user information to the request
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { UnauthorizedError } from '../utils/error-handler';
import { TokenPayload } from '../types/auth';

// Extend Express Request to include user information
declare module 'express' {
  interface Request {
    user?: TokenPayload;
    isAuthenticated: boolean;
  }
}

/**
 * Required authentication middleware
 * Validates JWT tokens and rejects requests without valid authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return next(new UnauthorizedError('Authentication token is missing'));
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }

  // Add user information to the request
  req.user = decoded;
  req.isAuthenticated = true;
  
  next();
}

/**
 * Optional authentication middleware
 * Validates JWT tokens if present but allows unauthenticated requests to continue
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  // Initialize defaults
  req.isAuthenticated = false;
  
  const token = extractTokenFromHeader(req.headers.authorization);
  
  // If no token, continue as unauthenticated
  if (!token) {
    return next();
  }

  const decoded = verifyToken(token);
  
  // If token is valid, add user info
  if (decoded) {
    req.user = decoded;
    req.isAuthenticated = true;
  }
  
  next();
}

/**
 * Role-based authorization middleware
 * Restricts access based on user roles
 * 
 * @param roles - Array of authorized roles
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First ensure the user is authenticated
    if (!req.isAuthenticated || !req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError(`Required role: ${roles.join(' or ')}`));
    }

    next();
  };
}

/**
 * Admin-only middleware
 * Restricts access to admin users only
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if the user is accessing their own resources
 * Used for user-specific operations where users should only access their own data
 * 
 * @param userIdExtractor - Function to extract the target user ID from the request
 */
export function requireSelfOrAdmin(
  userIdExtractor: (req: Request) => string = (req) => req.params.id
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First ensure the user is authenticated
    if (!req.isAuthenticated || !req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const targetUserId = userIdExtractor(req);
    
    // Allow if user is admin or accessing their own resource
    if (req.user.role === 'admin' || req.user.userId === targetUserId) {
      return next();
    }

    return next(new UnauthorizedError('You can only access your own resources'));
  };
}

export default {
  requireAuth,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSelfOrAdmin
};
