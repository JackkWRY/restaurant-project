/**
 * @file Express Type Extensions
 * @description TypeScript declaration file for extending Express Request interface
 * 
 * This file provides:
 * - Custom user property on Express Request
 * - Type-safe access to authenticated user data
 * - Used by authMiddleware to attach user info
 * 
 * Property descriptions (Request.user):
 * - userId: Authenticated user's ID from JWT
 * - username: Authenticated user's username
 * - role: Authenticated user's role (ADMIN, STAFF, etc.)
 * 
 * Usage:
 * After authentication middleware runs, req.user contains decoded JWT payload.
 * Controllers can access req.user safely with TypeScript type checking.
 * 
 * @module types/express
 * @see {@link ../middlewares/authMiddleware.ts} for user attachment
 * @see {@link ../controllers} for usage in protected routes
 */

import { Request } from 'express';

declare global {
  namespace Express {
    /**
     * Extended Request interface with user property
     * 
     * Added by authMiddleware after successful JWT verification.
     * 
     * @example
     * // In controller after authMiddleware
     * const userId = req.user?.userId;
     * const userRole = req.user?.role;
     */
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
      };
    }
  }
}
