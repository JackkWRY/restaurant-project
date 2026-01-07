/**
 * @file Mock Express Objects
 * @description Mock Request, Response, and NextFunction for testing
 * 
 * Provides utilities to create mock Express objects for controller testing.
 * 
 * Usage:
 * ```typescript
 * import { mockRequest, mockResponse, mockNext } from '@/__tests__/helpers/mockExpress';
 * 
 * const req = mockRequest({ body: { name: 'test' } });
 * const res = mockResponse();
 * const next = mockNext();
 * 
 * await myController(req, res, next);
 * 
 * expect(res.status).toHaveBeenCalledWith(200);
 * expect(res.json).toHaveBeenCalledWith({ data: ... });
 * ```
 * 
 * Best Practices:
 * - Use type assertions for flexibility
 * - Mock only what you need
 * - Verify mock calls in assertions
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest';

/**
 * Create a mock Express Request object
 */
export function mockRequest(data: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    path: '/',
    ...data,
  };
}

/**
 * Create a mock Express Response object
 */
export function mockResponse(): Partial<Response> {
  const res: Partial<Response> = {};
  
  // Chainable methods
  res.status = vi.fn().mockReturnValue(res) as any;
  res.json = vi.fn().mockReturnValue(res) as any;
  res.send = vi.fn().mockReturnValue(res) as any;
  res.sendStatus = vi.fn().mockReturnValue(res) as any;
  res.set = vi.fn().mockReturnValue(res) as any;
  res.cookie = vi.fn().mockReturnValue(res) as any;
  res.clearCookie = vi.fn().mockReturnValue(res) as any;
  
  return res;
}

/**
 * Create a mock Express NextFunction
 */
export function mockNext(): NextFunction {
  return vi.fn() as NextFunction;
}
