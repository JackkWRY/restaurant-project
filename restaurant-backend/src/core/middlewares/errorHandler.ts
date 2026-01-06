/**
 * @file Error Handler Middleware
 * @description Global error handling and async error wrapper
 * 
 * This middleware handles:
 * - Global error catching for all routes
 * - Differentiated logging (errors vs warnings)
 * - Consistent error response format
 * - Async route handler error wrapping
 * 
 * Error handling flow:
 * 1. Async errors caught by asyncHandler wrapper
 * 2. Errors passed to errorHandler via next(error)
 * 3. AppError instances logged and returned with status code
 * 4. Unknown errors logged as 500 Internal Server Error
 * 5. Client receives consistent JSON error response
 * 
 * @module middlewares/errorHandler
 * @requires errors/AppError
 * @requires config/logger
 * @requires utils/apiResponse
 * 
 * @see {@link ../errors/AppError.ts} for custom error classes
 * @see {@link ../utils/apiResponse.ts} for response formatting
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import logger from '../config/logger.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in the application and sends appropriate responses.
 * Differentiates between known AppError instances and unexpected errors.
 * 
 * Error flow:
 * - AppError (4xx): Logged as warning, sent with original status code
 * - AppError (5xx): Logged as error with stack trace
 * - Unknown errors: Logged as error, sent as 500 Internal Server Error
 * 
 * @param error - Error object (AppError or generic Error)
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 * @returns void
 * 
 * @example
 * // Register as last middleware in app.ts
 * app.use(errorHandler);
 * 
 * @example
 * // Errors automatically caught from controllers
 * throw new NotFoundError('User');
 * // -> Logged and sent as 404 response
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error with appropriate level based on severity
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      // Server errors - log with full stack trace
      logger.error('Application error', {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
    } else {
      // Client errors - log as warning without stack trace
      logger.warn('Client error', {
        message: error.message,
        statusCode: error.statusCode,
        path: req.path,
        method: req.method
      });
    }

    sendError(res, error.message, error.statusCode);
    return;
  }

  // Unknown/Unexpected errors - always log with stack trace
  logger.error('Unexpected error', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // Don't expose internal error details to client
  sendError(res, 'Internal server error', 500);
};

/**
 * Async Error Wrapper
 * 
 * Wraps async route handlers to automatically catch rejected promises
 * and pass them to the error handler middleware.
 * 
 * Without this wrapper, async errors would cause unhandled promise rejections.
 * 
 * @param fn - Async route handler function
 * @returns Wrapped function that catches async errors
 * 
 * @example
 * // Wrap async controller functions
 * export const getUsers = asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json(users);
 * });
 * 
 * @example
 * // Errors automatically passed to errorHandler
 * export const getUser = asyncHandler(async (req, res) => {
 *   const user = await userService.getById(req.params.id);
 *   if (!user) throw new NotFoundError('User');
 *   res.json(user);
 * });
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Catch any rejected promises and pass to error handler
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
