import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/errors/AppError';
import { env } from '@/config/env';

export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
    });
  }

  if (env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
