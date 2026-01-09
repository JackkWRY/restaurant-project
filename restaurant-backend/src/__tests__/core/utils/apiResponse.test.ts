/**
 * @file API Response Utility Tests
 * @description Unit tests for standardized HTTP response helpers
 * 
 * Tests cover:
 * - sendSuccess() with various data types and status codes
 * - sendError() with validation errors
 * - Helper functions (sendCreated, sendNotFound, etc.)
 * - Response format consistency
 * - Type safety
 * 
 * Best Practices:
 * - AAA pattern (Arrange, Act, Assert)
 * - Descriptive test names
 * - Mock Express response objects
 * - Test edge cases
 * - Verify response structure
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sendSuccess,
  sendError,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
} from '@/core/utils/apiResponse';
import { mockResponse } from '@/__tests__/helpers/mockExpress';

describe('API Response Utilities', () => {
  let res: ReturnType<typeof mockResponse>;

  beforeEach(() => {
    res = mockResponse();
    vi.clearAllMocks();
  });

  describe('sendSuccess', () => {
    it('should send success response with data', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };

      // Act
      sendSuccess(res as any, data);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
      });
    });

    it('should send success response with data and message', () => {
      // Arrange
      const data = { id: 1 };
      const message = 'Operation successful';

      // Act
      sendSuccess(res as any, data, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        message,
        code: message,
      });
    });

    it('should send success response with custom status code', () => {
      // Arrange
      const data = { id: 1 };
      const statusCode = 201;

      // Act
      sendSuccess(res as any, data, undefined, statusCode);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
      });
    });

    it('should send success response without data', () => {
      // Act
      sendSuccess(res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
      });
    });

    it('should send success response with message only', () => {
      // Arrange
      const message = 'Success message';

      // Act
      sendSuccess(res as any, undefined, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message,
        code: message,
      });
    });

    it('should handle array data', () => {
      // Arrange
      const data = [{ id: 1 }, { id: 2 }];

      // Act
      sendSuccess(res as any, data);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
      });
    });

    it('should handle null data', () => {
      // Act
      sendSuccess(res as any, null);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with message', () => {
      // Arrange
      const message = 'Something went wrong';

      // Act
      sendError(res as any, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
      });
    });

    it('should send error response with custom status code', () => {
      // Arrange
      const message = 'Bad request';
      const statusCode = 400;

      // Act
      sendError(res as any, message, statusCode);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
      });
    });

    it('should send error response with validation errors', () => {
      // Arrange
      const message = 'Validation failed';
      const statusCode = 400;
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];

      // Act
      sendError(res as any, message, statusCode, errors);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
        details: errors,
      });
    });

    it('should send error response without validation errors', () => {
      // Arrange
      const message = 'Error occurred';

      // Act
      sendError(res as any, message, 500);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
      });
    });
  });

  describe('sendCreated', () => {
    it('should send 201 Created response', () => {
      // Arrange
      const data = { id: 1, name: 'New Item' };

      // Act
      sendCreated(res as any, data);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
      });
    });

    it('should send 201 Created response with message', () => {
      // Arrange
      const data = { id: 1 };
      const message = 'Resource created successfully';

      // Act
      sendCreated(res as any, data, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data,
        message,
        code: message,
      });
    });
  });

  describe('sendNoContent', () => {
    it('should send 204 No Content response', () => {
      // Act
      sendNoContent(res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('sendNotFound', () => {
    it('should send 404 Not Found with default message', () => {
      // Act
      sendNotFound(res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Resource not found',
        code: 'Resource not found',
      });
    });

    it('should send 404 Not Found with custom message', () => {
      // Arrange
      const message = 'User not found';

      // Act
      sendNotFound(res as any, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
      });
    });
  });

  describe('sendBadRequest', () => {
    it('should send 400 Bad Request', () => {
      // Arrange
      const message = 'Invalid input';

      // Act
      sendBadRequest(res as any, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
      });
    });

    it('should send 400 Bad Request with validation errors', () => {
      // Arrange
      const message = 'Validation failed';
      const errors = [{ field: 'name', message: 'Required' }];

      // Act
      sendBadRequest(res as any, message, errors);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
        errors,
      });
    });
  });

  describe('sendUnauthorized', () => {
    it('should send 401 Unauthorized with default message', () => {
      // Act
      sendUnauthorized(res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized',
        code: 'Unauthorized',
      });
    });

    it('should send 401 Unauthorized with custom message', () => {
      // Arrange
      const message = 'Invalid token';

      // Act
      sendUnauthorized(res as any, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
      });
    });
  });

  describe('sendForbidden', () => {
    it('should send 403 Forbidden with default message', () => {
      // Act
      sendForbidden(res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forbidden',
        code: 'Forbidden',
      });
    });

    it('should send 403 Forbidden with custom message', () => {
      // Arrange
      const message = 'Access denied';

      // Act
      sendForbidden(res as any, message);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message,
        code: message,
      });
    });
  });

  describe('Response chaining', () => {
    it('should allow method chaining on response object', () => {
      // Arrange
      const data = { id: 1 };

      // Act
      sendSuccess(res as any, data);

      // Assert - verify both status and json were called
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });
});
