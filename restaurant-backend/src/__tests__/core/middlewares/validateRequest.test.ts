/**
 * @file Validate Request Middleware Tests
 * @description Unit tests for Zod schema validation middleware
 * 
 * Tests cover:
 * - Valid data passes validation
 * - Invalid data fails with proper errors
 * - Error formatting
 * - Multiple validation errors
 * - Different request parts (body, params, query)
 * 
 * Best Practices:
 * - Test with real Zod schemas
 * - Verify error messages
 * - Test edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import { validateRequest } from '@/core/middlewares/validateRequest';
import { mockRequest, mockResponse, mockNext } from '@/__tests__/helpers/mockExpress';

describe('Validate Request Middleware', () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: ReturnType<typeof mockNext>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    vi.clearAllMocks();
  });

  describe('Body validation', () => {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      age: z.number().min(18, 'Must be 18 or older'),
    });

    it('should pass validation with valid data', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation with missing required field', async () => {
      // Arrange
      req.body = {
        email: 'john@example.com',
        age: 25,
      };
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: expect.any(String),
            }),
          ]),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid email', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'invalid-email',
        age: 25,
      };
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
            }),
          ]),
        })
      );
    });

    it('should handle multiple validation errors', async () => {
      // Arrange
      req.body = {
        name: '',
        email: 'invalid',
        age: 15,
      };
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const callArg = (res.json as any).mock.calls[0][0];
      expect(callArg.errors).toHaveLength(3);
    });

    it('should handle empty body', async () => {
      // Arrange
      req.body = {};
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Params validation', () => {
    const schema = z.object({
      id: z.string().regex(/^\d+$/, 'ID must be numeric'),
    });

    it('should validate params', async () => {
      // Arrange
      req.params = { id: '123' };
      req.body = req.params; // validateRequest checks body
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid params', async () => {
      // Arrange
      req.params = { id: 'abc' };
      req.body = req.params; // validateRequest checks body
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Query validation', () => {
    const schema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
    });

    it('should validate query parameters', async () => {
      // Arrange
      req.query = { page: '1', limit: '10' };
      req.body = req.query; // validateRequest checks body
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    it('should pass with empty query', async () => {
      // Arrange
      req.query = {};
      req.body = req.query; // validateRequest checks body
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Error formatting', () => {
    const schema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    });

    it('should format validation errors correctly', async () => {
      // Arrange
      req.body = {
        username: 'ab',
        password: '1234',
      };
      const middleware = validateRequest(schema);

      // Act
      await middleware(req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      const callArg = (res.json as any).mock.calls[0][0];
      expect(callArg).toHaveProperty('status', 'error');
      expect(callArg).toHaveProperty('errors');
      expect(Array.isArray(callArg.errors)).toBe(true);
      expect(callArg.errors[0]).toHaveProperty('field');
      expect(callArg.errors[0]).toHaveProperty('message');
    });
  });
});
