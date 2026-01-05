/**
 * @file Application Configuration Constants
 * @description Central configuration constants for the application
 * 
 * This module provides:
 * - Currency symbol configuration
 * - Sound file paths for notifications
 * - Chart color palette for analytics
 * 
 * @module config/constants
 * 
 * @see {@link enums} for enum definitions
 */

/**
 * Application configuration constants
 * 
 * Contains:
 * - Currency symbol
 * - Sound file paths for notifications
 * - Chart color palette
 */
export const APP_CONFIG = {
  CURRENCY: "฿",
  SOUNDS: {
    NOTIFICATION: "/sounds/notification.mp3",
    BELL_1: "/sounds/bell_1.mp3",
    BELL_2: "/sounds/bell_2.mp3",
  },
  CHART_COLORS: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
};