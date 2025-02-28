/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { UnauthorizedError, ValidationError } from '../../../utils/error-handler';
import { 
  generateAccessToken, 
  generateRefreshToken,
  getTokenExpirationTime
} from '../../../utils/auth';
import { 
  RefreshTokenRequest,
  RefreshToken,
  User,
  UserPayload
} from '../../../types/auth';

/**
 * Handle token refresh
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Validate request body
  const { refreshToken: tokenString } = req.body as RefreshTokenRequest;
  
  if (!tokenString) {
    throw new ValidationError('Refresh token is required');
  }

  // Get refresh token collection
  const tokenService = new CollectionService<RefreshToken>('refreshTokens');
  
  // Find the token
  const token = await tokenService.findOne({ 
    token: tokenString,
    revokedAt: { $exists: false }  // Ensure token is not revoked
  });
  
  // Check if token exists and is valid
  if (!token) {
    throw new UnauthorizedError('Invalid refresh token');
  }
  
  // Check if token has expired
  if (token.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token has expired');
  }
  
  // Get user data
  const userService = new CollectionService<User>('users');
  const user = await userService.findById(token.userId);
  
  if (!user || !user.isActive) {
    throw new UnauthorizedError('User not found or inactive');
  }
  
  // Create user payload for token
  const userPayload: UserPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role
  };
  
  // Generate new tokens
  const newAccessToken = generateAccessToken(userPayload);
  const newRefreshToken = generateRefreshToken();
  
  // Get expiration time for access token
  const expiresIn = getTokenExpirationTime(newAccessToken);
  
  // Update old token as replaced
  await tokenService.updateById(token._id, {
    revokedAt: new Date(),
    replacedByToken: newRefreshToken
  } as Partial<RefreshToken>);
  
  // Store new refresh token
  await tokenService.create({
    token: newRefreshToken,
    userId: user._id.toString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  
  // Return new tokens
  res.json(createSuccessResponse({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn
  }, 'Token refreshed successfully'));
});
