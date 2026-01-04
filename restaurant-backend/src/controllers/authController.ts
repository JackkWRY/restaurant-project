import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma.js';
import logger from '../config/logger.js';
import { JWT_CONFIG } from '../config/index.js';
import { loginSchema, refreshSchema, logoutSchema } from '../schemas/authSchema.js';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/apiResponse.js';

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
 * 
 * @example
 * POST /api/login
 * Body: { "username": "admin", "password": "password123" }
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
      sendError(res, 'Server configuration error');
      return;
    }

    const payload = { userId: user.id, username: user.username, role: user.role };

    // Access Token
    const accessToken = jwt.sign(payload, secret, { expiresIn: JWT_CONFIG.accessTokenExpiry } as jwt.SignOptions);

    // Refresh Token
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: JWT_CONFIG.refreshTokenExpiry } as jwt.SignOptions);

    // Store refresh token in database
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
    sendError(res, 'Login failed');
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
      sendError(res, 'Server configuration error');
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
    sendError(res, 'Token refresh failed');
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

    sendSuccess(res, undefined, 'Logged out successfully');

  } catch (error) {
    logger.error('Logout error', { error: error instanceof Error ? error.message : 'Unknown error' });
    sendError(res, 'Logout failed');
  }
};