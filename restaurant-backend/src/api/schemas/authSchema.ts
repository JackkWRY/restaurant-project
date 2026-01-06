/**
 * @file Authentication Validation Schemas
 * @description Zod validation schemas for authentication operations
 * 
 * This file provides:
 * - Login credentials validation
 * - Refresh token validation
 * - Logout token validation
 * 
 * Validation rules:
 * - username: Required, non-empty string
 * - password: Required, non-empty string
 * - refreshToken: Required, non-empty string
 * 
 * @module schemas/authSchema
 * @requires zod
 * @see {@link ../controllers/authController.ts} for usage
 */

import { z } from 'zod';

/**
 * Login Schema
 * 
 * Validates user login credentials.
 * 
 * @example
 * const credentials = loginSchema.parse({
 *   username: "admin",
 *   password: "password123"
 * });
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

/**
 * Refresh Token Schema
 * 
 * Validates refresh token for obtaining new access token.
 */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

/**
 * Logout Schema
 * 
 * Validates refresh token for logout/revocation.
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});