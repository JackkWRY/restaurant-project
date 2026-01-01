import type { Response } from 'express';

/**
 * Standard API Response Types
 */

export interface SuccessResponse<T = any> {
  status: 'success';
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Array<{ field: string; message: string }>;
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
  message?: string,
  statusCode: number = 200
): void {
  const response: SuccessResponse<T> = {
    status: 'success',
    ...(data !== undefined && { data }),
    ...(message && { message }),
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
  message: string,
  statusCode: number = 500,
  errors?: Array<{ field: string; message: string }>
): void {
  const response: ErrorResponse = {
    status: 'error',
    message,
    ...(errors && { errors }),
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
 * @param message - Error message (default: 'Resource not found')
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): void {
  sendError(res, message, 404);
}

/**
 * Send a bad request error (400)
 * @param res - Express response object
 * @param message - Error message
 * @param errors - Validation errors (optional)
 */
export function sendBadRequest(
  res: Response,
  message: string,
  errors?: Array<{ field: string; message: string }>
): void {
  sendError(res, message, 400, errors);
}

/**
 * Send an unauthorized error (401)
 * @param res - Express response object
 * @param message - Error message (default: 'Unauthorized')
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): void {
  sendError(res, message, 401);
}

/**
 * Send a forbidden error (403)
 * @param res - Express response object
 * @param message - Error message (default: 'Forbidden')
 */
export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): void {
  sendError(res, message, 403);
}
