/**
 * POST /api/v1/[collection]/bulk
 * Create multiple resources at once
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { ValidationError } from '../../../utils/error-handler';

/**
 * Create multiple documents in a collection
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collection = req.params.collection;
  
  // Validate request body is an array
  if (!Array.isArray(req.body)) {
    throw new ValidationError('Request body must be an array');
  }
  
  // Validate array is not empty
  if (req.body.length === 0) {
    throw new ValidationError('Array cannot be empty');
  }

  // Initialize collection service
  const collectionService = new CollectionService(collection);
  
  // Create multiple documents
  const result = await collectionService.createMany(req.body);
  
  // Return success response with the number of documents created
  res.status(201).json(createSuccessResponse({
    insertedCount: result.insertedCount,
    insertedIds: result.insertedIds
  }, `Created ${result.insertedCount} items in ${collection}`));
});
