/**
 * GET /api/v1/[collection]/count
 * Count resources in collection
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { parseQueryParams } from '../../../utils/query-parser';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';

/**
 * Count documents in a collection based on filter
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collection = req.params.collection;
  
  // Initialize collection service
  const collectionService = new CollectionService(collection);
  
  // Parse query parameters to get filters
  const queryOptions = parseQueryParams(req.query);
  
  // Count documents
  const count = await collectionService.count(queryOptions.filter || {});
  
  // Return response
  res.json(createSuccessResponse({
    count,
    collection
  }, `Found ${count} items in ${collection}`));
});
