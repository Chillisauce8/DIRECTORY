/**
 * POST /api/v1/auth/login
 * Authenticate user and issue tokens
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { UnauthorizedError, ValidationError } from '../../../utils/error-handler';
import { 
  verifyPassword, 
  generateAccessToken, 
  generateRefreshToken,
  getTokenExpirationTime 
} from '../../../utils/auth';
import { 
  LoginRequest,
  LoginResponse,
  UserPayload,
  SafeUser,
  RefreshToken,
  User
} from '../../../types/auth';
import { toObjectId } from '../../../utils/object-id';

/**
 * Handle user login and token generation
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Validate request body
  const { email, password } = req.body as LoginRequest;
  
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Get user collection
  const userService = new CollectionService<User>('users');
  
  // Find user by email
  const user = await userService.findOne({ email: email.toLowerCase() });
  
  // Check if user exists and is active
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  // Verify password
  const passwordValid = await verifyPassword(password, user.password);
  if (!passwordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  // Create user payload for token
  const userPayload: UserPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role
  };
  
  // Generate tokens
  const accessToken = generateAccessToken(userPayload);
  const refreshTokenString = generateRefreshToken();
  
  // Get expiration time for access token
  const expiresIn = getTokenExpirationTime(accessToken);
  
  // Store refresh token in database
  const refreshTokenService = new CollectionService<RefreshToken>('refreshTokens');
  await refreshTokenService.create({
    token: refreshTokenString,
    userId: user._id.toString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  
  // Update user's lastLogin
  await userService.updateById(user._id, {
    lastLogin: new Date()
  } as Partial<User>);
  
  // Create safe user object (without password)
  const safeUser: SafeUser = {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: new Date()
  };
  
  // Create login response
  const loginResponse: LoginResponse = {
    accessToken,
    refreshToken: refreshTokenString,
    expiresIn,
    user: safeUser
  };
  
  // Return tokens and user data
  res.json(createSuccessResponse(loginResponse, 'Login successful'));
});
