/**
 * @file Deprecation Warning Middleware
 * @description Middleware to log warnings for deprecated unversioned API endpoints
 * 
 * This middleware:
 * - Logs warnings when unversioned endpoints are accessed
 * - Adds deprecation headers to responses
 * - Helps track usage of deprecated endpoints
 * - Facilitates smooth migration to versioned APIs
 * 
 * Usage:
 * - Applied to deprecated /api/* routes
 * - Provides visibility into legacy endpoint usage
 * - Enables gradual migration strategy
 * 
 * @module middlewares/deprecationMiddleware
 * @requires express
 * @requires config/logger
 * 
 * @see {@link server.ts} for usage example
 */

import type { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

/**
 * Deprecation Warning Middleware
 * 
 * Logs warnings and adds headers when deprecated unversioned endpoints are accessed.
 * This helps track usage of legacy endpoints during the migration period.
 * 
 * Headers added:
 * - X-API-Deprecated: true
 * - X-API-Deprecation-Info: Migration instructions
 * - X-API-Sunset: Planned removal date (if configured)
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 * @returns void
 * 
 * @example
 * // Apply to deprecated routes
 * app.use('/api', deprecationWarningMiddleware, v1Router);
 */
export const deprecationWarningMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log deprecation warning
  logger.warn('Deprecated API endpoint accessed', {
    path: req.path,
    fullUrl: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    message: 'Please migrate to /api/v1/* endpoints',
    timestamp: new Date().toISOString(),
  });

  // Add deprecation headers to response
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader(
    'X-API-Deprecation-Info',
    'This endpoint is deprecated. Please use /api/v1/* endpoints instead.'
  );
  res.setHeader(
    'X-API-Migration-Guide',
    'Replace /api/* with /api/v1/* in your API calls'
  );

  // Optional: Add sunset date (when the endpoint will be removed)
  // Uncomment and set date when deprecation timeline is decided
  // res.setHeader('X-API-Sunset', '2026-07-01T00:00:00Z');

  next();
};
