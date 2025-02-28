/**
 * POST /api/v1/auth/logout
 * Invalidate user's refresh tokens
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { ValidationError } from '../../../utils/error-handler';
import { RefreshToken } from '../../../types/auth';

/**
 * Handle user logout by invalidating refresh tokens
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Check if refresh token is provided
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new ValidationError('Refresh token is required');
  }
  
  // Get refresh token collection
  const tokenService = new CollectionService<RefreshToken>('refreshTokens');
  
  // Find the token
  const token = await tokenService.findOne({ token: refreshToken });
  
  // If token exists, revoke it by setting revokedAt
  if (token) {
    await tokenService.updateById(token._id, {
      revokedAt: new Date()
    } as Partial<RefreshToken>);
  }
  
  // Return success even if token wasn't found for security reasons
  res.json(createSuccessResponse({ success: true }, 'Logged out successfully'));
});
