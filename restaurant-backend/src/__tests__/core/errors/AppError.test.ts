/**
 * @file AppError Tests
 * @description Unit tests for custom error classes
 * 
 * Tests cover:
 * - AppError base class
 * - ValidationError (400)
 * - UnauthorizedError (401)
 * - ForbiddenError (403)
 * - NotFoundError (404)
 * - ConflictError (409)
 * - InternalServerError (500)
 * 
 * Best Practices:
 * - Test error properties (message, statusCode, stack)
 * - Verify error inheritance
 * - Test error throwability
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from '@/core/errors/AppError';

describe('AppError Classes', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      // Arrange & Act
      const error = new AppError(500, 'Test error');

      // Assert
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should have stack trace', () => {
      // Arrange & Act
      const error = new AppError(500, 'Test error');

      // Assert
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should be throwable', () => {
      // Assert
      expect(() => {
        throw new AppError(500, 'Test error');
      }).toThrow('Test error');
    });

    it('should be instance of Error', () => {
      // Arrange & Act
      const error = new AppError(500, 'Test error');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should set isOperational to false when specified', () => {
      // Arrange & Act
      const error = new AppError(500, 'Test error', false);

      // Assert
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create 400 error', () => {
      // Arrange & Act
      const error = new ValidationError('Invalid input');

      // Assert
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of AppError', () => {
      // Arrange & Act
      const error = new ValidationError('Invalid input');

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create 401 error with default message', () => {
      // Arrange & Act
      const error = new UnauthorizedError();

      // Assert
      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
    });

    it('should create 401 error with custom message', () => {
      // Arrange & Act
      const error = new UnauthorizedError('Invalid token');

      // Assert
      expect(error.message).toBe('Invalid token');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create 403 error with default message', () => {
      // Arrange & Act
      const error = new ForbiddenError();

      // Assert
      expect(error.message).toBe('Forbidden - Insufficient permissions');
      expect(error.statusCode).toBe(403);
    });

    it('should create 403 error with custom message', () => {
      // Arrange & Act
      const error = new ForbiddenError('Insufficient permissions');

      // Assert
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error with resource name', () => {
      // Arrange & Act
      const error = new NotFoundError('User');

      // Assert
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });

    it('should work with different resource names', () => {
      // Arrange & Act
      const menuError = new NotFoundError('Menu');
      const orderError = new NotFoundError('Order');

      // Assert
      expect(menuError.message).toBe('Menu not found');
      expect(orderError.message).toBe('Order not found');
    });
  });

  describe('ConflictError', () => {
    it('should create 409 error', () => {
      // Arrange & Act
      const error = new ConflictError('Resource already exists');

      // Assert
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('InternalServerError', () => {
    it('should create 500 error with default message', () => {
      // Arrange & Act
      const error = new InternalServerError();

      // Assert
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
    });

    it('should create 500 error with custom message', () => {
      // Arrange & Act
      const error = new InternalServerError('Database connection failed');

      // Assert
      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
    });
  });
});
