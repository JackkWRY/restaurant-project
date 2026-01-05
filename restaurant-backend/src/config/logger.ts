/**
 * @file Winston Logger Configuration
 * @description Centralized logging setup with file rotation and console output
 * 
 * This file provides:
 * - Winston logger instance
 * - Daily log file rotation
 * - Separate error and combined logs
 * - Environment-specific log levels
 * - Colored console output for development
 * 
 * Log files:
 * - logs/error-YYYY-MM-DD.log: Error level only
 * - logs/combined-YYYY-MM-DD.log: All levels
 * 
 * Rotation:
 * - Max size: 20MB per file
 * - Max age: 14 days
 * - Format: JSON for production, colored for development
 * 
 * @module config/logger
 * @requires winston
 * @requires winston-daily-rotate-file
 * @see {@link ../middlewares/requestLogger.ts} for HTTP request logging
 */

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for console (development)
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  // Add metadata if exists
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
  ),
  defaultMeta: { service: "restaurant-backend" },
  transports: [
    // Error log file
    new DailyRotateFile({
      filename: path.join("logs", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d",
      format: json(),
    }),

    // Combined log file
    new DailyRotateFile({
      filename: path.join("logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: json(),
    }),
  ],
});

// Console transport for development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), consoleFormat),
    })
  );
}

export default logger;
