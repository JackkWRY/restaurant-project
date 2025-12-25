import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
      res.status(401).json({
        status: "error",
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined in environment variables");
      res.status(500).json({
        status: "error",
        message: "Server configuration error",
      });
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
      res.status(401).json({
        status: "error",
        message: "Token expired",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
      return;
    }

    console.error("Token verification error:", error);
    res.status(401).json({
      status: "error",
      message: "Authentication failed",
    });
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
        res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          status: "error",
          message: "Insufficient permissions",
        });
        return;
      }

      next();
    });
  };
};
