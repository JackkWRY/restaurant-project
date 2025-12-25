import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma.js';
import logger from '../config/logger.js';
import { loginSchema, refreshSchema, logoutSchema } from '../schemas/authSchema.js';

type LoginInput = z.infer<typeof loginSchema>;
type RefreshInput = z.infer<typeof refreshSchema>;
type LogoutInput = z.infer<typeof logoutSchema>;

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    
    if (!secret || !refreshSecret) {
      logger.error('JWT_SECRET or REFRESH_TOKEN_SECRET is not defined');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const payload = { userId: user.id, username: user.username, role: user.role };

    // Access Token (15 minutes)
    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

    // Refresh Token (7 days)
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    logger.info('User logged in', { userId: user.id, username: user.username });

    res.json({
      status: 'success',
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
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshInput;

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    const accessSecret = process.env.JWT_SECRET;

    if (!refreshSecret || !accessSecret) {
      logger.error('JWT secrets not configured');
      res.status(500).json({ error: 'Server configuration error' });
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
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username, role: decoded.role },
      accessSecret,
      { expiresIn: '15m' }
    );

    logger.info('Token refreshed', { userId: decoded.userId });

    res.json({
      status: 'success',
      accessToken: newAccessToken
    });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }
    logger.error('Refresh token error', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as LogoutInput;

    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    logger.info('User logged out');

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: 'Logout failed' });
  }
};