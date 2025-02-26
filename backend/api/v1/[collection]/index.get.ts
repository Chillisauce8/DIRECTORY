/**
 * GET /api/v1/[collection]
 * List resources with filtering, pagination and sorting
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { parseQueryParams } from '../../../utils/query-parser';
import { createListResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';

/**
 * List documents from a collection
 * Supports filtering, pagination, sorting, and field selection
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collection = req.params.collection;
  
  // Initialize collection service
  const collectionService = new CollectionService(collection);
  
  // Parse query parameters
  const queryOptions = parseQueryParams(req.query);
  
  // Get documents with pagination metadata
  const { data, meta } = await collectionService.findMany(queryOptions);
  
  // Return formatted response
  res.json(createListResponse(
    data,
    meta,
    `Retrieved ${data.length} items from ${collection}`
  ));
});
