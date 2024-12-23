import { Trade } from '../models/Trade';
import type { TradeDocument } from '../types/trade';
import { logger } from '../../utils/logger';

class TradeRepository {
  async add(data: Omit<TradeDocument, '_id'>): Promise<TradeDocument> {
    try {
      return await Trade.create(data);
    } catch (error) {
      logger.error('Failed to add trade:', error);
      throw error;
    }
  }

  async getRecentTrades(limit: number = 10): Promise<TradeDocument[]> {
    try {
      return await Trade.find()
        .sort({ timestamp: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Failed to get recent trades:', error);
      throw error;
    }
  }
}

export const tradeRepository = new TradeRepository();