import cors from 'cors';
import express from 'express';
import { errorHandler } from './errorHandler';
import { requestLogger } from './requestLogger';

export function setupMiddleware(app: express.Application): void {
  // Enable CORS
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());

  // Request logging
  app.use(requestLogger);

  // Error handling - should be last
  app.use(errorHandler);
}