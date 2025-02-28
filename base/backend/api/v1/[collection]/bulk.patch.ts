/**
 * PATCH /api/v1/[collection]/bulk
 * Update multiple resources at once
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { ValidationError } from '../../../utils/error-handler';

/**
 * Update multiple documents in a collection
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collection = req.params.collection;
  
  // Validate request body
  if (!req.body || typeof req.body !== 'object') {
    throw new ValidationError('Invalid request body');
  }
  
  // Validate required fields
  if (!req.body.filter || !req.body.update) {
    throw new ValidationError('Request must include "filter" and "update" fields');
  }

  // Initialize collection service
  const collectionService = new CollectionService(collection);
  
  // Update multiple documents based on filter
  const result = await collectionService.updateMany(
    req.body.filter,
    req.body.update
  );
  
  // Return success response with the number of documents updated
  res.json(createSuccessResponse({
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  }, `Updated ${result.modifiedCount} of ${result.matchedCount} matching items in ${collection}`));
});
