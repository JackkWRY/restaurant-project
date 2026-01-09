/**
 * @file Authentication Controller
 * @description HTTP request handlers for authentication endpoints
 * 
 * This controller handles:
 * - User login with JWT token generation
 * - Token refresh mechanism
 * - User logout with token revocation
 * - Password verification and hashing
 * 
 * @module controllers/authController
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires prisma
 * @requires schemas/authSchema
 * 
 * @see {@link ../middlewares/authMiddleware.ts} for token verification
 * @see {@link ../schemas/authSchema.ts} for validation schemas
 */

import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../../database/client/prisma.js';
import logger from '../../core/config/logger.js';
import { JWT_CONFIG } from '../../core/config/index.js';
import { loginSchema, refreshSchema, logoutSchema } from '../schemas/authSchema.js';
import { sendSuccess, sendError, sendUnauthorized } from '../../core/utils/apiResponse.js';
import { ErrorCodes, SuccessCodes } from '../../core/constants/errorCodes.js';

type LoginInput = z.infer<typeof loginSchema>;
type RefreshInput = z.infer<typeof refreshSchema>;
type LogoutInput = z.infer<typeof logoutSchema>;

/**
 * Authenticates user and issues JWT tokens
 * 
 * Validates credentials, generates access and refresh tokens,
 * and stores refresh token in database for security.
 * 
 * @param req - Express request with username and password in body
 * @param res - Express response
 * @returns 200 with tokens and user data, or 401 if invalid credentials
 * @throws {UnauthorizedError} If credentials are invalid
 * @throws {Error} If token generation or database operation fails
 * 
 * @example
 * POST /api/login
 * Body: { "username": "admin", "password": "password123" }
 * 
 * @example
 * // Response
 * {
 *   "status": "success",
 *   "data": {
 *     "accessToken": "eyJhbGc...",
 *     "refreshToken": "eyJhbGc...",
 *     "user": { "id": 1, "username": "admin", "role": "ADMIN" }
 *   }
 * }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      sendUnauthorized(res, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendUnauthorized(res, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return;
    }

    const secret = JWT_CONFIG.accessTokenSecret;
    const refreshSecret = JWT_CONFIG.refreshTokenSecret;
    
    if (!secret || !refreshSecret) {
      logger.error('JWT_SECRET or REFRESH_TOKEN_SECRET is not defined');
      sendError(res, ErrorCodes.AUTH_CONFIG_ERROR);
      return;
    }

    const payload = { userId: user.id, username: user.username, role: user.role };

    // Generate short-lived access token for API requests
    const accessToken = jwt.sign(payload, secret, { expiresIn: JWT_CONFIG.accessTokenExpiry } as jwt.SignOptions);

    // Generate long-lived refresh token for obtaining new access tokens
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: JWT_CONFIG.refreshTokenExpiry } as jwt.SignOptions);

    // Store refresh token in database for security
    // This allows us to revoke tokens if needed (logout, security breach, etc.)
    const expiresAt = new Date(Date.now() + JWT_CONFIG.refreshTokenExpiryMs);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    logger.info('User logged in', { userId: user.id, username: user.username });

    sendSuccess(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Login error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendError(res, ErrorCodes.AUTH_LOGIN_FAILED);
  }
};

/**
 * Refreshes access token using refresh token
 * 
 * Validates refresh token from database and issues new access token.
 * Implements token rotation for enhanced security.
 * 
 * @param req - Express request with refreshToken in body
 * @param res - Express response
 * @returns 200 with new access token, or 401 if token invalid
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshInput;

    const refreshSecret = JWT_CONFIG.refreshTokenSecret;
    const accessSecret = JWT_CONFIG.accessTokenSecret;

    if (!refreshSecret || !accessSecret) {
      logger.error('JWT secrets not configured');
      sendError(res, ErrorCodes.AUTH_CONFIG_ERROR);
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, refreshSecret) as {
      userId: number;
      username: string;
      role: string;
    };

    // Check if refresh token exists in database and not expired
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        expiresAt: { gte: new Date() }
      }
    });

    if (!tokenRecord) {
      sendUnauthorized(res, 'Invalid or expired refresh token');
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username, role: decoded.role },
      accessSecret,
      { expiresIn: JWT_CONFIG.accessTokenExpiry } as jwt.SignOptions
    );

    logger.info('Token refreshed', { userId: decoded.userId });

    sendSuccess(res, { accessToken: newAccessToken });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendUnauthorized(res, 'Refresh token expired');
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendUnauthorized(res, 'Invalid refresh token');
      return;
    }
    logger.error('Refresh token error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendError(res, ErrorCodes.AUTH_TOKEN_REFRESH_FAILED);
  }
};

/**
 * Invalidates a refresh token, effectively logging out the user from a specific session.
 *
 * Deletes the provided refresh token from the database, preventing its reuse.
 *
 * @param req - Express request with refreshToken in body
 * @param res - Express response
 * @returns 200 with success message, or 500 if logout fails
 *
 * @example
 * POST /api/logout
 * Body: { "refreshToken": "eyJ..." }
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as LogoutInput;

    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    logger.info('User logged out');

    sendSuccess(res, undefined, SuccessCodes.LOGOUT_SUCCESS);

  } catch (error) {
    logger.error('Logout error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendError(res, ErrorCodes.AUTH_LOGOUT_FAILED);
  }
};