import express from 'express';
import { corsMiddleware } from '../middleware/cors';
import { errorHandler } from '../middleware/error';
import { setupRoutes } from '../routes';
import { logger } from '../utils/logger';

export function createApp() {
  const app = express();

  // Middleware
  app.use(corsMiddleware);
  app.use(express.json());

  // Routes
  setupRoutes(app);

  // Error handling
  app.use(errorHandler);

  return app;
}