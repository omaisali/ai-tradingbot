import { Router } from 'express';
import { marketRoutes } from './market';
import { logger } from '../../utils/logger';

export function setupRoutes(app: any) {
  const router = Router();

  // Health check route
  router.get('/health', (_, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  router.use('/api/market', marketRoutes);

  // Mount all routes
  app.use(router);

  // 404 handler
  app.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Not Found' });
  });
}