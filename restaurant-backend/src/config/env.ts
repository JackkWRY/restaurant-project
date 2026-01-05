/**
 * @file Environment Variables Configuration
 * @description Validates and exports type-safe environment variables using Zod
 * 
 * This file provides:
 * - Runtime validation of environment variables
 * - Type-safe access to configuration
 * - Default values for optional variables
 * - Automatic application exit on validation failure
 * 
 * Environment variables:
 * - NODE_ENV: Application environment (development/production/test)
 * - PORT: Server port (default: 3001)
 * - DATABASE_URL: PostgreSQL connection string (required)
 * - JWT_SECRET: Access token secret (min 32 chars, required)
 * - REFRESH_TOKEN_SECRET: Refresh token secret (min 32 chars, required)
 * - CLIENT_URL: Frontend URL for CORS (default: http://localhost:3000)
 * - CLOUDINARY_*: Image upload service credentials
 * 
 * @module config/env
 * @requires zod
 * @see {@link ./index.ts} for configuration usage
 */

import { z } from 'zod';
import logger from './logger.js';

/**
 * Environment Variables Schema
 * Validates all required and optional environment variables
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server Configuration
  PORT: z.preprocess(
    (val) => (val ? Number(val) : 3001),
    z.number().positive().int()
  ),
  CLIENT_URL: z.string().url().optional().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().optional().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().optional().default('7d'),

  // CORS Configuration
  CORS_ORIGIN: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().optional()
  ),
  RATE_LIMIT_MAX: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().optional()
  ),

  // Pagination
  PAGINATION_DEFAULT_LIMIT: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().optional()
  ),
  PAGINATION_MAX_LIMIT: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().positive().optional()
  ),

  // Cloudinary Configuration (Optional - only required if using image uploads)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
});

/**
 * Validated Environment Variables Type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Additional validation: If any Cloudinary variable is set, all must be set
    if (parsed.CLOUDINARY_CLOUD_NAME || parsed.CLOUDINARY_API_KEY || parsed.CLOUDINARY_API_SECRET) {
      if (!parsed.CLOUDINARY_CLOUD_NAME || !parsed.CLOUDINARY_API_KEY || !parsed.CLOUDINARY_API_SECRET) {
        throw new Error(
          'Incomplete Cloudinary configuration. All of CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set together.'
        );
      }
    }

    logger.info('Environment variables validated successfully', {
      nodeEnv: parsed.NODE_ENV,
      port: parsed.PORT,
      hasCloudinary: !!(parsed.CLOUDINARY_CLOUD_NAME && parsed.CLOUDINARY_API_KEY && parsed.CLOUDINARY_API_SECRET),
    });

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err) => {
        return `  - ${err.path.join('.')}: ${err.message}`;
      });

      logger.error('Environment validation failed:', {
        errors: error.issues,
      });

      console.error('\n❌ Environment Validation Error:\n');
      console.error(errorMessages.join('\n'));
      console.error('\nPlease check your .env file and ensure all required variables are set correctly.\n');
      
      process.exit(1);
    }
    
    throw error;
  }
}

/**
 * Validated and typed environment variables
 * Use this instead of process.env for type safety
 */
export const env = validateEnv();
