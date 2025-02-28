/**
 * Authentication utilities
 * Provides functions for JWT token generation, verification, and password handling
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { TokenPayload, UserPayload } from '../types/auth';
import env from '../config/env';

// Number of rounds for bcrypt (higher is more secure but slower)
const SALT_ROUNDS = 10;

/**
 * Generate an access token for authenticated users
 * 
 * @param user - User data to include in the token
 * @returns The signed JWT token string
 */
export function generateAccessToken(user: UserPayload): string {
  const payload: TokenPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRATION,
  });
}

/**
 * Generate a refresh token
 * 
 * @param userId - User ID to associate with the refresh token
 * @returns A randomly generated token string
 */
export function generateRefreshToken(): string {
  // Create a secure random token
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - The token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    // Verify the token and cast the result to our type
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Extract token from Authorization header
 * 
 * @param authHeader - The Authorization header value
 * @returns The token string or null if not found/invalid
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Remove 'Bearer ' prefix and return the token
  return authHeader.substring(7);
}

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
}

/**
 * Verify a password against its hash
 * 
 * @param password - Plain text password to check
 * @param hash - Stored password hash to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // Log the error internally but return false to the caller
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Calculate seconds until a given JWT token expires
 * 
 * @param token - The JWT token
 * @returns Seconds until expiration or 0 if invalid/expired
 */
export function getTokenExpirationTime(token: string): number {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    
    if (!decoded || !decoded.exp) {
      return 0;
    }

    // Calculate seconds until expiration
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    return expiresIn > 0 ? expiresIn : 0;
  } catch {
    return 0;
  }
}
