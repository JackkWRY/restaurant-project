import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import logger from '../config/logger.js';

export const validateRequest = (schema: ZodSchema<any, any>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) {
      req.body = await schema.parseAsync(req.body);
    }
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      res.status(400).json({ status: 'error', errors: formattedErrors });
    } else {
      logger.warn('Validation error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method
      });
      return res.status(400).json({ status: 'error', message: 'Invalid request data' });
    }
  }
};