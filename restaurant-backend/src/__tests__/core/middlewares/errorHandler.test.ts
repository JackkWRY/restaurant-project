/**
 * @file Error Handler Middleware Tests
 * @description Unit tests for global error handling middleware
 *
 * Tests cover:
 * - AppError handling (4xx, 5xx)
 * - Unknown error handling
 * - Validation error formatting
 * - asyncHandler wrapper
 * - Error logging
 * - Development vs production mode
 *
 * Best Practices:
 * - Mock Express req/res/next
 * - Test error transformation
 * - Verify response format
 * - Test async error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { errorHandler, asyncHandler } from "@/core/middlewares/errorHandler";
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} from "@/core/errors/AppError";
import {
  mockRequest,
  mockResponse,
  mockNext,
} from "@/__tests__/helpers/mockExpress";

describe("Error Handler Middleware", () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: ReturnType<typeof mockNext>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    vi.clearAllMocks();
  });

  describe("errorHandler", () => {
    it("should handle AppError with correct status code", () => {
      // Arrange
      const error = new ValidationError("Invalid input");

      // Act
      errorHandler(error, req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid input",
        code: "Invalid input",
      });
    });

    it("should handle NotFoundError (404)", () => {
      // Arrange
      const error = new NotFoundError("User");

      // Act
      errorHandler(error, req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "User not found",
        code: "User not found",
      });
    });

    it("should handle UnauthorizedError (401)", () => {
      // Arrange
      const error = new UnauthorizedError("Invalid token");

      // Act
      errorHandler(error, req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid token",
        code: "Invalid token",
      });
    });

    it("should handle InternalServerError (500)", () => {
      // Arrange
      const error = new InternalServerError("Database error");

      // Act
      errorHandler(error, req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Database error",
        code: "Database error",
      });
    });

    it("should handle unknown errors as 500", () => {
      // Arrange
      const error = new Error("Unknown error");

      // Act
      errorHandler(error, req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
        code: "Internal server error",
      });
    });

    it("should handle errors without message", () => {
      // Arrange
      const error = new Error();

      // Act
      errorHandler(error, req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
        code: 'Internal server error',
      });
    });

    it("should handle non-Error objects", () => {
      // Arrange
      const error = "String error";

      // Act
      errorHandler(error as any, req as any, res as any, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
        code: 'Internal server error',
      });
    });

    it("should not include stack trace by default", () => {
      // Arrange
      const error = new AppError(500, "Test error");

      // Act
      errorHandler(error, req as any, res as any, next);

      // Assert
      const callArg = (res.json as any).mock.calls[0][0];
      expect(callArg).toEqual({
        status: "error",
        message: "Test error",
        code: "Test error",
      });
      expect(callArg).not.toHaveProperty("stack");
    });

    it("should not include stack trace in production mode", () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      const error = new AppError(500, "Test error");

      // Act
      errorHandler(error, req as any, res as any, next);

      // Assert
      const callArg = (res.json as any).mock.calls[0][0];
      expect(callArg).not.toHaveProperty("stack");

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("asyncHandler", () => {
    it("should handle successful async operations", async () => {
      // Arrange
      const handler = vi.fn().mockResolvedValue(undefined);
      const wrappedHandler = asyncHandler(handler);

      // Act
      await wrappedHandler(req as any, res as any, next);

      // Assert
      expect(handler).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it("should catch async errors and pass to next", async () => {
      // Arrange
      const error = new Error("Async error");
      const handler = vi.fn().mockRejectedValue(error);
      const wrappedHandler = asyncHandler(handler);

      // Act
      await wrappedHandler(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it("should catch AppError and pass to next", async () => {
      // Arrange
      const error = new ValidationError("Invalid data");
      const handler = vi.fn().mockRejectedValue(error);
      const wrappedHandler = asyncHandler(handler);

      // Act
      await wrappedHandler(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it("should handle synchronous errors thrown in handler", async () => {
      // Arrange
      const error = new Error("Sync error");
      const handler = async () => {
        throw error;
      };
      const wrappedHandler = asyncHandler(handler);

      // Act
      await wrappedHandler(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it("should preserve handler context", async () => {
      // Arrange
      let capturedReq: any;
      let capturedRes: any;
      let capturedNext: any;

      const handler = vi.fn().mockImplementation((r, s, n) => {
        capturedReq = r;
        capturedRes = s;
        capturedNext = n;
      });
      const wrappedHandler = asyncHandler(handler);

      // Act
      await wrappedHandler(req as any, res as any, next);

      // Assert
      expect(capturedReq).toBe(req);
      expect(capturedRes).toBe(res);
      expect(capturedNext).toBe(next);
    });
  });
});
