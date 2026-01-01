/**
 * Application Configuration
 * Centralized configuration using validated environment variables
 */

import { env } from './env.js';

// Environment
export const NODE_ENV = env.NODE_ENV;
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// Server
export const PORT = env.PORT;
export const CLIENT_URL = env.CLIENT_URL;

// JWT Configuration
export const JWT_CONFIG = {
  accessTokenSecret: env.JWT_SECRET,
  refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
  accessTokenExpiry: env.JWT_ACCESS_EXPIRY,
  refreshTokenExpiry: env.JWT_REFRESH_EXPIRY,
  refreshTokenExpiryMs: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const;

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  maxRequests: env.RATE_LIMIT_MAX || 300,
  message: 'Too many requests from this IP, please try again later.',
} as const;

// Pagination
export const PAGINATION_CONFIG = {
  defaultLimit: env.PAGINATION_DEFAULT_LIMIT || 10,
  maxLimit: env.PAGINATION_MAX_LIMIT || 100,
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
