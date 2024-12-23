import { Request, Response } from 'express';
import { getDatabase } from '../services/database';

export async function getMarketData(req: Request, res: Response) {
  const { symbol, startTime, endTime } = req.query;
  const db = getDatabase();

  try {
    const result = db.exec(`
      SELECT * FROM market_data 
      WHERE symbol = ? 
      AND timestamp >= ? 
      AND timestamp <= ?
      ORDER BY timestamp DESC
    `, [symbol, startTime, endTime]);

    res.json(result[0]?.values || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}

export async function getMarketSummary(req: Request, res: Response) {
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
    `, [symbol]);

    res.json(result[0]?.values[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market summary' });
  }
}