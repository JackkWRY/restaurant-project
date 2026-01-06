/**
 * @file Sanitize Middleware
 * @description Input sanitization middleware to prevent XSS attacks
 * 
 * This middleware handles:
 * - HTML tag removal from user input
 * - XSS attack prevention
 * - Script injection prevention
 * - Sanitization of object fields
 * - Sanitization of array items
 * 
 * Security considerations:
 * - Removes all HTML tags to prevent XSS
 * - Sanitizes before validation to ensure clean data
 * - Prevents script injection in user-generated content
 * - Protects against stored XSS attacks
 * - Maintains data integrity while removing malicious content
 * 
 * @module middlewares/sanitizeMiddleware
 * @requires utils/sanitize
 * 
 * @see {@link ../utils/sanitize.ts} for sanitization functions
 * @see {@link ../schemas} for validation schemas (applied after sanitization)
 */

import type { Request, Response, NextFunction } from 'express';
import { sanitizeObject, sanitizeArray } from '../utils/sanitize.js';

/**
 * Middleware to sanitize request body fields
 * 
 * Removes HTML tags and XSS attempts from specified fields in the request body.
 * Should be applied before validation middleware to ensure clean data.
 * 
 * Security: Prevents stored XSS attacks by sanitizing user input before storage.
 * 
 * @param fields - Array of field names to sanitize
 * @returns Express middleware function
 * @throws None - Sanitization never throws, only modifies data
 * 
 * @example
 * // Sanitize menu name and description
 * router.post('/menus', 
 *   sanitizeBody(['nameTH', 'nameEN', 'description']),
 *   validateRequest(createMenuSchema),
 *   createMenu
 * );
 * 
 * @example
 * // Sanitize category name
 * router.post('/categories',
 *   sanitizeBody(['name']),
 *   validateRequest(createCategorySchema),
 *   createCategory
 * );
 */
export function sanitizeBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      // Sanitize specified fields to remove HTML and prevent XSS
      req.body = sanitizeObject(req.body, fields);
    }
    next();
  };
}

/**
 * Middleware to sanitize array items in request body
 * 
 * Useful for endpoints that accept arrays of objects (e.g., order items).
 * Sanitizes specified fields in each array item.
 * 
 * Security: Prevents XSS in array data like order notes or item descriptions.
 * 
 * @param arrayField - Name of the array field in request body
 * @param fields - Array of field names to sanitize in each item
 * @returns Express middleware function
 * @throws None - Sanitization never throws, only modifies data
 * 
 * @example
 * // Sanitize notes in order items
 * router.post('/orders',
 *   sanitizeBodyArray('items', ['note']),
 *   validateRequest(createOrderSchema),
 *   createOrder
 * );
 * 
 * @example
 * // Sanitize multiple fields in array
 * router.post('/bulk-menus',
 *   sanitizeBodyArray('menus', ['nameTH', 'nameEN', 'description']),
 *   validateRequest(bulkCreateSchema),
 *   bulkCreateMenus
 * );
 */
export function sanitizeBodyArray(arrayField: string, fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && Array.isArray(req.body[arrayField])) {
      // Sanitize each item in the array
      req.body[arrayField] = sanitizeArray(req.body[arrayField], fields);
    }
    next();
  };
}
