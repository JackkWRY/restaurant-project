/**
 * @file Request Logger Middleware
 * @description HTTP request/response logging middleware
 * 
 * This middleware handles:
 * - Request logging with response time
 * - Status code-based log levels
 * - IP address and user agent tracking
 * - Performance monitoring
 * 
 * Privacy considerations:
 * - Logs IP addresses for security monitoring
 * - Does not log request/response bodies (may contain PII)
 * - User agent logged for debugging purposes
 * - Sensitive headers (Authorization) not logged
 * 
 * @module middlewares/requestLogger
 * @requires config/logger
 * 
 * @see {@link ../config/logger.ts} for Winston logger configuration
 */

import type { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

/**
 * Logs HTTP requests with response time and status
 * 
 * Attaches a listener to the response 'finish' event to log after response is sent.
 * Uses different log levels based on response status code.
 * 
 * Log levels:
 * - 5xx errors: logger.error (server errors)
 * - 4xx errors: logger.warn (client errors)
 * - 2xx/3xx: logger.info (successful requests)
 * 
 * Privacy: Does not log request/response bodies to prevent PII leakage.
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 * @returns void
 * 
 * @example
 * // Register early in middleware chain (app.ts)
 * app.use(requestLogger);
 * app.use(express.json());
 * // ... other middleware
 * 
 * @example
 * // Log output format
 * // INFO: GET /api/menus 200 45ms
 * // WARN: POST /api/orders 400 12ms
 * // ERROR: GET /api/analytics 500 234ms
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log when response finishes (after all data sent to client)
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    const logData = {
      method,
      url: originalUrl,
      status: statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    // Log level based on status code for easy filtering
    if (statusCode >= 500) {
      // Server errors - requires immediate attention
      logger.error(`${method} ${originalUrl} ${statusCode} ${duration}ms`, logData);
    } else if (statusCode >= 400) {
      // Client errors - may indicate API misuse or validation issues
      logger.warn(`${method} ${originalUrl} ${statusCode} ${duration}ms`, logData);
    } else {
      // Successful requests - normal operation
      logger.info(`${method} ${originalUrl} ${statusCode} ${duration}ms`, logData);
    }
  });
  
  next();
};
