/**
 * POST /api/v1/[collection]
 * Create a new resource
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { ValidationError } from '../../../utils/error-handler';

/**
 * Create a new document in the collection
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collection = req.params.collection;
  
  // Check if request body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ValidationError('Request body is required');
  }

  // Initialize collection service
  const collectionService = new CollectionService(collection);
  
  // Create document
  const created = await collectionService.create(req.body);
  
  // Return response with 201 Created status code
  res.status(201).json(createSuccessResponse(
    created,
    `Created new item in ${collection}`
  ));
});
