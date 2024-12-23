import { Router } from 'express';
import { marketDataManager } from '../services/marketData/manager';
import { verifyMarketData } from '../../utils/verifyMarketData';
import { logger } from '../utils/logger';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const status = await verifyMarketData();
    res.json(status);
  } catch (error) {
    logger.error('Failed to get market data status:', error);
    res.status(500).json({ error: 'Failed to get market data status' });
  }
});

router.post('/collect/start', async (req, res) => {
  try {
    await marketDataManager.initialize();
    res.json({ message: 'Collection started' });
  } catch (error) {
    logger.error('Failed to start collection:', error);
    res.status(500).json({ error: 'Failed to start collection' });
  }
});

router.post('/collect/stop', (req, res) => {
  try {
    marketDataManager.stopCollection();
    res.json({ message: 'Collection stopped' });
  } catch (error) {
    logger.error('Failed to stop collection:', error);
    res.status(500).json({ error: 'Failed to stop collection' });
  }
});

export default router;
