/**
 * GET /api/v1/[collection]/[id]
 * Get a specific resource by ID
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { parseQueryParams } from '../../../utils/query-parser';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { NotFoundError } from '../../../utils/error-handler';

/**
 * Get a document by its ID
 * Supports field selection
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collection = req.params.collection;
  const id = req.params.id;
  
  // Initialize collection service
  const collectionService = new CollectionService(collection);
  
  // Parse query for field selection
  const queryOptions = parseQueryParams(req.query);
  const projection = queryOptions.fields ? 
    queryOptions.fields.fields?.reduce((obj, field) => ({...obj, [field]: 1}), {}) : 
    {};
  
  // Find document by ID
  const document = await collectionService.findById(id, projection);
  
  // Throw 404 if not found
  if (!document) {
    throw new NotFoundError(`Item with id ${id} not found in ${collection}`);
  }
  
  // Return document
  res.json(createSuccessResponse(
    document,
    `Retrieved item from ${collection}`
  ));
});
