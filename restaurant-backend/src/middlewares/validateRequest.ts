import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateRequest = (schema: z.ZodType<any, any>) => async (req: Request, res: Response, next: NextFunction) => {
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
      console.error("Validation Error:", error);
      res.status(400).json({ status: 'error', message: 'Invalid request data' });
    }
  }
};