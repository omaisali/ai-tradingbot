import { Router } from 'express';
import { marketDataManager } from '../services/market/manager';
import { logger } from '../../utils/logger';

const router = Router();

router.get('/status', async (req, res, next) => {
  try {
    const status = await marketDataManager.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('Failed to get market status:', error);
    next(error);
  }
});

export const marketRoutes = router;