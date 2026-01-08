/**
 * @file Application Configuration
 * @description Centralized configuration using validated environment variables
 * 
 * This file provides:
 * - Validated environment variables via env.ts
 * - Typed configuration objects
 * - Default values for optional settings
 * - Environment-specific configurations
 * 
 * Configuration sections:
 * - Server: PORT, CLIENT_URL
 * - JWT: Access/refresh tokens, expiry times
 * - Rate Limiting: Request throttling
 * - Pagination: Default/max limits
 * - Logging: Log levels and rotation
 * - CORS: Cross-origin settings
 * - Socket.IO: WebSocket configuration
 * - Cloudinary: Image upload service
 * - Database: Connection URL
 * 
 * @module config/index
 * @requires config/env
 * @see {@link ./env.ts} for environment variable validation
 */

import { env } from './env.js';
import { TIME_CONSTANTS, RATE_LIMIT_DEFAULTS, PAGINATION_DEFAULTS } from './constants.js';

// Environment detection for conditional logic
export const NODE_ENV = env.NODE_ENV;
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// Server configuration
export const PORT = env.PORT;
export const CLIENT_URL = env.CLIENT_URL;

/**
 * JWT Configuration
 * 
 * Security: Access tokens are short-lived (default: 15m)
 * Refresh tokens are long-lived (default: 7d)
 */
export const JWT_CONFIG = {
  accessTokenSecret: env.JWT_SECRET,
  refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
  accessTokenExpiry: env.JWT_ACCESS_EXPIRY,
  refreshTokenExpiry: env.JWT_REFRESH_EXPIRY,
  // Milliseconds for cookie expiry calculation
  refreshTokenExpiryMs: TIME_CONSTANTS.ONE_WEEK_MS, // 7 days
} as const;

/**
 * Rate Limiting Configuration
 * 
 * Prevents abuse by limiting requests per IP address.
 * Default: 300 requests per 15 minutes
 */
export const RATE_LIMIT_CONFIG = {
  windowMs: env.RATE_LIMIT_WINDOW_MS || RATE_LIMIT_DEFAULTS.WINDOW_MINUTES * TIME_CONSTANTS.ONE_MINUTE_MS,
  maxRequests: env.RATE_LIMIT_MAX || RATE_LIMIT_DEFAULTS.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
} as const;

/**
 * Pagination Configuration
 * 
 * Default limits for list endpoints to prevent performance issues.
 */
export const PAGINATION_CONFIG = {
  defaultLimit: env.PAGINATION_DEFAULT_LIMIT || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
  maxLimit: env.PAGINATION_MAX_LIMIT || PAGINATION_DEFAULTS.MAX_LIMIT,
} as const;

// Logging
export const LOG_CONFIG = {
  level: env.LOG_LEVEL || (IS_PRODUCTION ? 'info' : 'debug'),
  maxFiles: '14d',
  maxSize: '20m',
  datePattern: 'YYYY-MM-DD',
} as const;

// CORS
export const CORS_CONFIG = {
  origins: env.CORS_ORIGIN ? [env.CORS_ORIGIN, CLIENT_URL] : [CLIENT_URL, 'http://localhost:3000'],
  credentials: true,
};

// Socket.IO
export const SOCKET_CONFIG = {
  cors: {
    origin: env.CORS_ORIGIN ? [env.CORS_ORIGIN, CLIENT_URL] : [CLIENT_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

// Cloudinary (if needed)
export const CLOUDINARY_CONFIG = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
} as const;

// Database
export const DATABASE_URL = env.DATABASE_URL;

/**
 * @deprecated Environment variables are now validated automatically on startup via env.ts
 * This function is kept for backward compatibility but does nothing
 */
export const validateConfig = () => {
  // Environment validation now happens automatically in env.ts
  // This function is kept for backward compatibility
};

export default {
  env: NODE_ENV,
  isProduction: IS_PRODUCTION,
  isDevelopment: IS_DEVELOPMENT,
  port: PORT,
  clientUrl: CLIENT_URL,
  jwt: JWT_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  pagination: PAGINATION_CONFIG,
  log: LOG_CONFIG,
  cors: CORS_CONFIG,
  socket: SOCKET_CONFIG,
  cloudinary: CLOUDINARY_CONFIG,
  databaseUrl: DATABASE_URL,
  validateConfig,
};
