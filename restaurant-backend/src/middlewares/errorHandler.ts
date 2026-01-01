import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import logger from '../config/logger.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and sends appropriate responses
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error('Application error', {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
    } else {
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

  // Unknown/Unexpected errors
  logger.error('Unexpected error', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  sendError(res, 'Internal server error', 500);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
