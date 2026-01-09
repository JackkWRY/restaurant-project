/**
 * @file Auth Controller Tests
 * @description Unit tests for authentication HTTP request handlers
 * 
 * Tests cover:
 * - login() - user authentication with JWT generation
 * - refresh() - access token refresh
 * - logout() - token revocation
 * 
 * Best Practices:
 * - Mock Prisma, bcrypt, and JWT
 * - Test authentication flows
 * - Test security (password validation, token verification)
 * - Test error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  login,
  refresh,
  logout
} from '../../../api/controllers/authController.js';
import prisma from '../../../database/client/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

// Mock Prisma client
vi.mock('../../../database/client/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
    TokenExpiredError: class TokenExpiredError extends Error {},
    JsonWebTokenError: class JsonWebTokenError extends Error {},
  },
}));

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'admin',
          password: 'password123'
        }
      });
      const res = mockResponse();
      const mockUser = {
        id: 1,
        username: 'admin',
        password: '$2a$10$hashedpassword',
        role: 'ADMIN'
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('mock-access-token' as any);
      vi.mocked(jwt.sign).mockReturnValueOnce('mock-access-token' as any);
      vi.mocked(jwt.sign).mockReturnValueOnce('mock-refresh-token' as any);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      // Act
      await login(req as Request, res as Response);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'admin' }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          user: {
            id: 1,
            username: 'admin',
            role: 'ADMIN'
          }
        })
      });
    });

    it('should return 401 when user not found', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'nonexistent',
          password: 'password123'
        }
      });
      const res = mockResponse();

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Act
      await login(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        code: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      });
    });

    it('should return 401 when password is invalid', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'admin',
          password: 'wrongpassword'
        }
      });
      const res = mockResponse();
      const mockUser = {
        id: 1,
        username: 'admin',
        password: '$2a$10$hashedpassword',
        role: 'ADMIN'
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act
      await login(req as Request, res as Response);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        code: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      });
    });

    it('should store refresh token in database', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'admin',
          password: 'password123'
        }
      });
      const res = mockResponse();
      const mockUser = {
        id: 1,
        username: 'admin',
        password: '$2a$10$hashedpassword',
        role: 'ADMIN'
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValueOnce('mock-access-token' as any);
      vi.mocked(jwt.sign).mockReturnValueOnce('mock-refresh-token' as any);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      // Act
      await login(req as Request, res as Response);

      // Assert
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token: 'mock-refresh-token',
          userId: 1,
          expiresAt: expect.any(Date)
        }
      });
    });
  });

  describe('refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          refreshToken: 'valid-refresh-token'
        }
      });
      const res = mockResponse();
      const mockDecoded = {
        userId: 1,
        username: 'admin',
        role: 'ADMIN'
      };

      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue({
        id: 1,
        token: 'valid-refresh-token',
        userId: 1,
        expiresAt: new Date(Date.now() + 86400000)
      } as any);
      vi.mocked(jwt.sign).mockReturnValue('new-access-token' as any);

      // Act
      await refresh(req as Request, res as Response);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: 'valid-refresh-token',
          userId: 1,
          expiresAt: { gte: expect.any(Date) }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          accessToken: 'new-access-token'
        }
      });
    });

    it('should return 401 when refresh token not found in database', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          refreshToken: 'invalid-token'
        }
      });
      const res = mockResponse();
      const mockDecoded = {
        userId: 1,
        username: 'admin',
        role: 'ADMIN'
      };

      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

      // Act
      await refresh(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid or expired refresh token',
        code: 'Invalid or expired refresh token',
      });
    });

    it('should return 401 when refresh token is expired', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          refreshToken: 'expired-token'
        }
      });
      const res = mockResponse();

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      // Act
      await refresh(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Refresh token expired',
        code: 'Refresh token expired',
      });
    });

    it('should return 401 when refresh token is invalid', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          refreshToken: 'malformed-token'
        }
      });
      const res = mockResponse();

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      // Act
      await refresh(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid refresh token',
        code: 'Invalid refresh token',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully and delete refresh token', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          refreshToken: 'token-to-delete'
        }
      });
      const res = mockResponse();

      vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 } as any);

      // Act
      await logout(req as Request, res as Response);

      // Assert
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'token-to-delete' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'SUCCESS_AUTH_001',
        code: 'SUCCESS_AUTH_001',
      });
    });

    it('should handle logout even if token not found', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          refreshToken: 'nonexistent-token'
        }
      });
      const res = mockResponse();

      vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 0 } as any);

      // Act
      await logout(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'SUCCESS_AUTH_001',
        code: 'SUCCESS_AUTH_001',
      });
    });
  });
});
