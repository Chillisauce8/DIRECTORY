/**
 * DELETE /api/v1/[collection]/[id]
 * Delete a specific resource
 */

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createSuccessResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';
import { NotFoundError } from '../../../utils/error-handler';

/**
 * Delete a document by its ID
 */
export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collection = req.params.collection;
  const id = req.params.id;
  
  // Initialize collection service
  const collectionService = new CollectionService(collection);
  
  // Delete document
  const result = await collectionService.deleteById(id);
  
  // Check if document was found and deleted
  if (!result) {
    throw new NotFoundError(`Item with id ${id} not found in ${collection}`);
  }
  
  // Return success with 204 No Content
  res.status(204).end();
});
