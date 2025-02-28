/**
 * PUT /api/v1/[collection]/[id]
 * Replace a resource completely
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { ValidationError } from '../../../utils/error-handler';

/**
 * Replace a document with new data
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collection = req.params.collection;
  const id = req.params.id;
  
  // Check if request body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ValidationError('Request body is required');
  }

  // Initialize collection service
  const collectionService = new CollectionService(collection);
  
  // Replace document
  const replaced = await collectionService.replaceById(id, req.body);
  
  // Return updated document
  res.json(createSuccessResponse(
    replaced,
    `Replaced item in ${collection}`
  ));
});
