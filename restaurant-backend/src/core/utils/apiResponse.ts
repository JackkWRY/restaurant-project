/**
 * @file API Response Utility
 * @description Standardized HTTP response helpers for consistent API responses
 * 
 * This utility provides:
 * - Type-safe response interfaces
 * - Consistent success/error response format with error codes
 * - HTTP status code helpers (200, 201, 204, 400, 401, 403, 404, 500)
 * - Validation error formatting
 * - i18n support via error codes
 * 
 * Response format:
 * - Success: { status: 'success', data?, message?, code? }
 * - Error: { status: 'error', message, code, errors? }
 * 
 * @module utils/apiResponse
 * @see {@link ../constants/errorCodes.ts} for error code constants
 * @see {@link ../middlewares/errorHandler.ts} for error handling
 * @see {@link ../controllers} for usage in controllers
 */

import type { Response } from 'express';
import type { ErrorCode, SuccessCode } from '../constants/errorCodes.js';

/**
 * Standard API Response Types
 */

export interface SuccessResponse<T = any> {
  status: 'success';
  data?: T;
  message?: string;
  code?: SuccessCode | string;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  code: ErrorCode | string;
  errors?: Array<{ field: string; message: string }>;
  details?: Record<string, any>;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Send a successful response
 * @param res - Express response object
 * @param data - Response data (optional)
 * @param message - Success message (optional)
 * @param statusCode - HTTP status code (default: 200)
 */
export function sendSuccess<T = any>(
  res: Response,
  data?: T,
  messageOrCode?: string | SuccessCode,
  statusCode: number = 200
): void {
  const response: SuccessResponse<T> = {
    status: 'success',
    ...(data !== undefined && { data }),
    ...(messageOrCode && { 
      message: messageOrCode,
      code: messageOrCode 
    }),
  };
  res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param errors - Validation errors (optional)
 */
export function sendError(
  res: Response,
  errorCodeOrMessage: ErrorCode | string,
  statusCode: number = 500,
  details?: Record<string, any>
): void {
  const response: ErrorResponse = {
    status: 'error',
    message: errorCodeOrMessage,
    code: errorCodeOrMessage,
    ...(details && { details }),
  };
  res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 * @param res - Express response object
 * @param data - Created resource data
 * @param message - Success message (optional)
 */
export function sendCreated<T = any>(
  res: Response,
  data: T,
  message?: string
): void {
  sendSuccess(res, data, message, 201);
}

/**
 * Send a no content response (204)
 * @param res - Express response object
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}

/**
 * Send a not found error (404)
 * @param res - Express response object
 * @param errorCode - Error code (default: 'Resource not found')
 */
export function sendNotFound(
  res: Response,
  errorCode: ErrorCode | string = 'Resource not found'
): void {
  sendError(res, errorCode, 404);
}

/**
 * Send a bad request error (400)
 * @param res - Express response object
 * @param errorCode - Error code
 * @param errors - Validation errors (optional)
 */
export function sendBadRequest(
  res: Response,
  errorCode: ErrorCode | string,
  errors?: Array<{ field: string; message: string }>
): void {
  const response: ErrorResponse = {
    status: 'error',
    message: errorCode,
    code: errorCode,
    ...(errors && { errors }),
  };
  res.status(400).json(response);
}

/**
 * Send an unauthorized error (401)
 * @param res - Express response object
 * @param errorCode - Error code (default: 'Unauthorized')
 */
export function sendUnauthorized(
  res: Response,
  errorCode: ErrorCode | string = 'Unauthorized'
): void {
  sendError(res, errorCode, 401);
}

/**
 * Send a forbidden error (403)
 * @param res - Express response object
 * @param errorCode - Error code (default: 'Forbidden')
 */
export function sendForbidden(
  res: Response,
  errorCode: ErrorCode | string = 'Forbidden'
): void {
  sendError(res, errorCode, 403);
}
