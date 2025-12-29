/**
 * Application Configuration
 * Centralized configuration for all hard-coded values
 */

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// Server
export const PORT = Number(process.env.PORT) || 3001;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// JWT Configuration
export const JWT_CONFIG = {
  accessTokenSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  refreshTokenExpiryMs: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const;

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  maxRequests: Number(process.env.RATE_LIMIT_MAX) || 300,
  message: 'Too many requests from this IP, please try again later.',
} as const;

// Pagination
export const PAGINATION_CONFIG = {
  defaultLimit: Number(process.env.PAGINATION_DEFAULT_LIMIT) || 10,
  maxLimit: Number(process.env.PAGINATION_MAX_LIMIT) || 100,
} as const;

// Logging
export const LOG_CONFIG = {
  level: IS_PRODUCTION ? 'info' : 'debug',
  maxFiles: '14d',
  maxSize: '20m',
  datePattern: 'YYYY-MM-DD',
} as const;

// CORS
export const CORS_CONFIG = {
  origins: [CLIENT_URL, 'http://localhost:3000'],
  credentials: true,
};

// Socket.IO
export const SOCKET_CONFIG = {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

// Cloudinary (if needed)
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
} as const;

// Database
export const DATABASE_URL = process.env.DATABASE_URL;

// Validation
export const validateConfig = () => {
  const required = {
    DATABASE_URL,
    JWT_ACCESS_SECRET: JWT_CONFIG.accessTokenSecret,
    JWT_REFRESH_SECRET: JWT_CONFIG.refreshTokenSecret,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
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
