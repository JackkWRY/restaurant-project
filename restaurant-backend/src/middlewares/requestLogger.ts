import type { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    const logData = {
      method,
      url: originalUrl,
      status: statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    // Log level based on status code
    if (statusCode >= 500) {
      logger.error(`${method} ${originalUrl} ${statusCode} ${duration}ms`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`${method} ${originalUrl} ${statusCode} ${duration}ms`, logData);
    } else {
      logger.info(`${method} ${originalUrl} ${statusCode} ${duration}ms`, logData);
    }
  });
  
  next();
};
