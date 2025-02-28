/**
 * Type definitions for authentication and authorization
 * Defines user, token, and permission structures
 */

// User role type
export type UserRole = 'admin' | 'user' | 'guest';

// Base user interface
export interface User {
  _id: string;
  email: string;
  password: string; // Hashed password
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// User data without sensitive fields (for responses)
export type SafeUser = Omit<User, 'password'>;

// User data for token generation
export interface UserPayload {
  _id: string;
  email: string;
  role: UserRole;
}

// JWT token structure
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

// Refresh token
export interface RefreshToken {
  _id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date;
  replacedByToken?: string;
}

// Login request type
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response type
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Seconds until token expiration
  user: SafeUser;
}

// Token refresh request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Collection-level permissions
export interface CollectionPermissions {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// Role-based permissions map
export type RolePermissions = Record<string, CollectionPermissions>;

// Default permissions configuration by role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    // Admins have full access to all collections
    '*': { read: true, create: true, update: true, delete: true }
  },
  user: {
    // Users have limited access
    'users': { read: false, create: false, update: false, delete: false },
    '*': { read: true, create: true, update: true, delete: false }
  },
  guest: {
    // Guests have read-only access to public collections
    '*': { read: true, create: false, update: false, delete: false }
  }
};
