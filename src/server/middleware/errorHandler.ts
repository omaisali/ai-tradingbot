import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ErrorWithStatus extends Error {
  status?: number;
}

export function errorHandler(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error ${status}: ${message}`, {
    error: err,
    path: req.path,
    method: req.method
  });

  res.status(status).json({
    error: {
      message,
      status
    }
  });
}