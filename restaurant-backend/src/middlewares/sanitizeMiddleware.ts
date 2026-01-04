import type { Request, Response, NextFunction } from 'express';
import { sanitizeObject, sanitizeArray } from '../utils/sanitize.js';

/**
 * Middleware to sanitize request body fields
 * Removes HTML tags and XSS attempts from specified fields
 * 
 * @param fields - Array of field names to sanitize
 * @returns Express middleware function
 * 
 * @example
 * router.post('/menus', 
 *   sanitizeBody(['nameTH', 'nameEN', 'description']),
 *   validateRequest(createMenuSchema),
 *   createMenu
 * );
 */
export function sanitizeBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, fields);
    }
    next();
  };
}

/**
 * Middleware to sanitize array items in request body
 * Useful for endpoints that accept arrays (e.g., order items)
 * 
 * @param arrayField - Name of the array field in request body
 * @param fields - Array of field names to sanitize in each item
 * @returns Express middleware function
 * 
 * @example
 * router.post('/orders',
 *   sanitizeBodyArray('items', ['note']),
 *   validateRequest(createOrderSchema),
 *   createOrder
 * );
 */
export function sanitizeBodyArray(arrayField: string, fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && Array.isArray(req.body[arrayField])) {
      req.body[arrayField] = sanitizeArray(req.body[arrayField], fields);
    }
    next();
  };
}
