import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger.js';
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

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      sendError(res, 'Server configuration error');
      return;
    }

    const decoded = jwt.verify(token, secret) as {
      userId: number;
      username: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendUnauthorized(res, "Token expired");
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      sendUnauthorized(res, "Invalid token");
      return;
    }

    logger.error('Token verification error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendUnauthorized(res, 'Invalid token');
    return;
  }
};

/**
 * Middleware to require authentication
 */
export const requireAuth = verifyToken;

/**
 * Middleware to require specific roles
 * @param roles - Array of allowed roles (e.g., ['ADMIN', 'STAFF'])
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // First verify token
    verifyToken(req, res, () => {
      if (!req.user) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      if (!roles.includes(req.user.role)) {
        sendForbidden(res, "Insufficient permissions");
        return;
      }

      next();
    });
  };
};
