/**
 * @file Validate Request Middleware
 * @description Zod schema validation middleware for request data
 * 
 * This middleware handles:
 * - Request body validation using Zod schemas
 * - Type-safe data validation
 * - Detailed error messages for validation failures
 * - Automatic type coercion and transformation
 * 
 * Validation flow:
 * 1. Receives Zod schema as parameter
 * 2. Validates request body against schema
 * 3. On success: Replaces req.body with validated/transformed data
 * 4. On failure: Returns 400 with detailed field-level errors
 * 5. Logs validation errors for monitoring
 * 
 * @module middlewares/validateRequest
 * @requires zod
 * @requires config/logger
 * 
 * @see {@link ../schemas} for validation schemas
 * @see {@link https://zod.dev} for Zod documentation
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import logger from '../config/logger.js';

/**
 * Validates request body against a Zod schema
 * 
 * Performs type-safe validation and transformation of request data.
 * Returns detailed field-level errors on validation failure.
 * 
 * Validation benefits:
 * - Type safety: Ensures data matches expected types
 * - Transformation: Automatically coerces and transforms data
 * - Detailed errors: Provides field-specific error messages
 * - Security: Prevents invalid data from reaching controllers
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 * @throws {ValidationError} Returns 400 with error details (doesn't throw)
 * 
 * @example
 * // Validate menu creation
 * router.post('/menus',
 *   sanitizeBody(['nameTH', 'nameEN']),
 *   validateRequest(createMenuSchema),
 *   createMenu
 * );
 * 
 * @example
 * // Validate order creation
 * router.post('/orders',
 *   validateRequest(createOrderSchema),
 *   createOrder
 * );
 * 
 * @example
 * // Error response format
 * {
 *   "status": "error",
 *   "errors": [
 *     { "field": "price", "message": "Expected number, received string" },
 *     { "field": "categoryId", "message": "Required" }
 *   ]
 * }
 */
export const validateRequest = (schema: ZodSchema<any, any>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) {
      // Validate and transform request body
      // parseAsync handles async transformations and refinements
      req.body = await schema.parseAsync(req.body);
    }
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors into user-friendly field-level messages
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      // Return 400 Bad Request with detailed validation errors
      res.status(400).json({ status: 'error', errors: formattedErrors });
    } else {
      // Unexpected validation error
      logger.warn('Validation error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method
      });
      return res.status(400).json({ status: 'error', message: 'Invalid request data' });
    }
  }
};