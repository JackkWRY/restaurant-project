/**
 * @file Auth Schema Tests
 * @description Unit tests for authentication Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import { loginSchema, refreshSchema, logoutSchema } from '../../../api/schemas/authSchema.js';

describe('AuthSchema', () => {
  describe('loginSchema', () => {
    it('should validate valid credentials', () => {
      const result = loginSchema.safeParse({
        username: 'admin',
        password: 'password123'
      });
      expect(result.success).toBe(true);
    });

    it('should require username', () => {
      const result = loginSchema.safeParse({ password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('should require password', () => {
      const result = loginSchema.safeParse({ username: 'admin' });
      expect(result.success).toBe(false);
    });

    it('should reject empty username', () => {
      const result = loginSchema.safeParse({ username: '', password: 'password123' });
      expect(result.success).toBe(false);
    });
  });

  describe('refreshSchema', () => {
    it('should validate valid refresh token', () => {
      const result = refreshSchema.safeParse({ refreshToken: 'valid-token' });
      expect(result.success).toBe(true);
    });

    it('should require refreshToken', () => {
      const result = refreshSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty refreshToken', () => {
      const result = refreshSchema.safeParse({ refreshToken: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('logoutSchema', () => {
    it('should validate valid refresh token', () => {
      const result = logoutSchema.safeParse({ refreshToken: 'valid-token' });
      expect(result.success).toBe(true);
    });

    it('should require refreshToken', () => {
      const result = logoutSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
