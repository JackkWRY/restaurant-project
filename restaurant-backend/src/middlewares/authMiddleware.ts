/**
 * @file Authentication Middleware
 * @description JWT-based authentication and authorization middleware
 * 
 * This middleware handles:
 * - JWT token verification from Authorization header
 * - User authentication for protected routes
 * - Role-Based Access Control (RBAC)
 * - Token expiration and validation
 * 
 * Security considerations:
 * - Validates JWT signature using secret key
 * - Checks token expiration automatically
 * - Prevents unauthorized access to protected resources
 * - Implements RBAC for fine-grained permissions
 * - Sanitizes error messages to prevent information leakage
 * 
 * @module middlewares/authMiddleware
 * @requires jsonwebtoken
 * @requires config/logger
 * @requires utils/apiResponse
 * 
 * @see {@link ../controllers/authController.ts} for token generation
 * @see {@link ../config/index.ts} for JWT configuration
 */

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger.js';
import { JWT_CONFIG } from '../config/index.js';
import { sendUnauthorized, sendError, sendForbidden } from '../utils/apiResponse.js';

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

/**
 * Verify JWT token from Authorization header
 * 
 * Extracts and validates JWT token from the Authorization header.
 * Attaches decoded user information to the request object for downstream use.
 * 
 * Security: Validates token signature and expiration automatically.
 * 
 * @param req - Express request with Authorization header
 * @param res - Express response
 * @param next - Express next function
 * @returns void
 * @throws {UnauthorizedError} If token is missing, expired, or invalid
 * 
 * @example
 * // Protect a route with authentication
 * router.get('/profile', verifyToken, getUserProfile);
 * 
 * @example
 * // Access user info in controller
 * const userId = req.user?.userId;
 */
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendUnauthorized(res, "No token provided");
      return;
    }

    // Extract token by removing 'Bearer ' prefix (7 characters)
    const token = authHeader.substring(7);

    // Verify JWT signature and expiration
    // Throws error if token is invalid or expired
    const decoded = jwt.verify(token, JWT_CONFIG.accessTokenSecret) as {
      userId: number;
      username: string;
      role: string;
    };

    // Attach user info to request for downstream middleware/controllers
    req.user = decoded;
    next();
  } catch (error) {
    // Handle specific JWT errors for better client feedback
    if (error instanceof jwt.TokenExpiredError) {
      // Token is valid but expired - client should refresh
      sendUnauthorized(res, "Token expired");
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      // Token is malformed or signature is invalid
      sendUnauthorized(res, "Invalid token");
      return;
    }

    // Unexpected error during verification
    logger.error('Token verification error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendUnauthorized(res, 'Invalid token');
    return;
  }
};

/**
 * Middleware to require authentication
 * 
 * Alias for verifyToken for semantic clarity in route definitions.
 * 
 * @example
 * router.get('/orders', requireAuth, getOrders);
 */
export const requireAuth = verifyToken;

/**
 * Middleware to require specific roles
 * 
 * Implements Role-Based Access Control (RBAC) by checking if the authenticated
 * user's role matches one of the allowed roles.
 * 
 * Security: Always verifies authentication first before checking roles.
 * 
 * @param roles - Array of allowed roles (e.g., ['ADMIN', 'STAFF'])
 * @returns Express middleware function
 * @throws {UnauthorizedError} If user is not authenticated
 * @throws {ForbiddenError} If user's role is not in allowed roles
 * 
 * @example
 * // Only admins can access
 * router.delete('/menus/:id', requireRole(['ADMIN']), deleteMenu);
 * 
 * @example
 * // Both admin and staff can access
 * router.post('/orders', requireRole(['ADMIN', 'STAFF']), createOrder);
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // First verify token to ensure user is authenticated
    verifyToken(req, res, () => {
      if (!req.user) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      // Check if user's role is in the allowed roles list
      // This implements Role-Based Access Control (RBAC)
      if (!roles.includes(req.user.role)) {
        sendForbidden(res, "Insufficient permissions");
        return;
      }

      next();
    });
  };
};
