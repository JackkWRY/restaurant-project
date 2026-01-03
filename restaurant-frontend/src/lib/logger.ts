/**
 * Development Logger Utility
 * Provides logging functionality that only works in development mode
 * In production, all logs are suppressed for performance and security
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Internal log method
   * @param level - Log level (debug, info, warn, error)
   * @param message - Main message to log
   * @param args - Additional arguments to log
   */
  private log(level: LogLevel, message: string | unknown, ...args: unknown[]) {
    if (!this.isDevelopment) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    // Convert message to string if it's an error object
    const formattedMessage = message instanceof Error 
      ? message.message 
      : typeof message === 'string' 
      ? message 
      : String(message);

    switch (level) {
      case 'debug':
        console.log(prefix, formattedMessage, ...args);
        break;
      case 'info':
        console.info(prefix, formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(prefix, formattedMessage, ...args);
        break;
      case 'error':
        console.error(prefix, formattedMessage, ...args);
        break;
    }
  }

  /**
   * Log debug messages (development only)
   * Use for detailed debugging information
   */
  debug(message: string, ...args: unknown[]) {
    this.log('debug', message, ...args);
  }

  /**
   * Log informational messages (development only)
   * Use for general information
   */
  info(message: string, ...args: unknown[]) {
    this.log('info', message, ...args);
  }

  /**
   * Log warning messages (development only)
   * Use for warnings that don't stop execution
   */
  warn(message: string | unknown, ...args: unknown[]) {
    this.log('warn', message, ...args);
  }

  /**
   * Log error messages (development only)
   * Use for errors and exceptions
   */
  error(message: string | unknown, ...args: unknown[]) {
    this.log('error', message, ...args);
  }
}

/**
 * Singleton logger instance
 * Import and use this in your components
 * 
 * @example
 * import { logger } from '@/lib/logger';
 * 
 * logger.debug('User connected', { userId: 123 });
 * logger.warn('API slow response', { duration: 5000 });
 * logger.error('Failed to fetch data', error);
 */
export const logger = new Logger();
