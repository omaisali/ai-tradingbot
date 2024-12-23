import { Router } from 'express';
import { DataCollectionManager } from '../services/dataCollection/manager';
import { getDatabase } from '../services/database';

const router = Router();
let collectionManager: DataCollectionManager | null = null;

router.post('/credentials', async (req, res) => {
  const { apiKey, secretKey } = req.body;
  
  try {
    collectionManager = new DataCollectionManager(apiKey, secretKey);
    const isValid = await collectionManager.validateCredentials();
    
    if (isValid) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

router.post('/collection/start', async (req, res) => {
  const { symbol, interval } = req.body;
  
  if (!collectionManager) {
    return res.status(400).json({ error: 'Configure credentials first' });
  }

  try {
    collectionManager.startCollection(symbol, interval);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start collection' });
  }
});

router.post('/collection/pause', (req, res) => {
  if (!collectionManager) {
    return res.status(400).json({ error: 'No active collection' });
  }

  collectionManager.pauseCollection();
  res.json({ success: true });
});

router.get('/data/summary', async (req, res) => {
  const { symbol } = req.query;
  const db = getDatabase();

  try {
    const result = db.exec(`
      SELECT 
        COUNT(*) as total_records,
        MIN(timestamp) as first_record,
        MAX(timestamp) as last_record,
        AVG(close) as average_price,
        SUM(volume) as total_volume
      FROM market_data
      WHERE symbol = ?
    `);

    res.json(result[0].values[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data summary' });
  }
});

export default router;