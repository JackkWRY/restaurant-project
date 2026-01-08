/**
 * @file Time Constants
 * @description Named constants for time-related values
 * 
 * This module provides:
 * - Millisecond constants for time calculations
 * - Named constants instead of magic numbers
 * - Self-documenting time values
 * 
 * Benefits:
 * - Improved code readability
 * - Easier to maintain
 * - Consistent time calculations
 * - No magic numbers
 * 
 * @module config/constants
 * @see {@link ./index.ts} for usage in configuration
 */

/**
 * Time constants in milliseconds
 * 
 * Use these constants instead of calculating milliseconds inline.
 * This makes code more readable and maintainable.
 * 
 * @example
 * // Bad
 * const timeout = 60 * 1000; // What is this?
 * 
 * // Good
 * const timeout = TIME_CONSTANTS.ONE_MINUTE_MS;
 */
export const TIME_CONSTANTS = {
  /** One second in milliseconds */
  ONE_SECOND_MS: 1000,
  
  /** One minute in milliseconds (60 seconds) */
  ONE_MINUTE_MS: 60 * 1000,
  
  /** One hour in milliseconds (60 minutes) */
  ONE_HOUR_MS: 60 * 60 * 1000,
  
  /** One day in milliseconds (24 hours) */
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  
  /** One week in milliseconds (7 days) */
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Rate limiting default values
 * 
 * Default configuration for rate limiting middleware.
 * These values can be overridden by environment variables.
 */
export const RATE_LIMIT_DEFAULTS = {
  /** Default rate limit window in minutes */
  WINDOW_MINUTES: 15,
  
  /** Default maximum requests per window */
  MAX_REQUESTS: 300,
} as const;

/**
 * Pagination default values
 * 
 * Default configuration for pagination.
 * These values can be overridden by environment variables.
 */
export const PAGINATION_DEFAULTS = {
  /** Default number of items per page */
  DEFAULT_LIMIT: 10,
  
  /** Maximum number of items per page */
  MAX_LIMIT: 100,
} as const;
