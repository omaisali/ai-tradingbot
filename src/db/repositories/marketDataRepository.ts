import { MarketData } from '../models/MarketData';
import type { MarketDataDocument } from '../types/marketData';
import { logger } from '../../utils/logger';

class MarketDataRepository {
  async add(data: Omit<MarketDataDocument, '_id'>): Promise<MarketDataDocument> {
    try {
      return await MarketData.create(data);
    } catch (error) {
      logger.error('Failed to add market data:', error);
      throw error;
    }
  }

  async addBatch(dataArray: Omit<MarketDataDocument, '_id'>[]): Promise<void> {
    try {
      await MarketData.insertMany(dataArray);
    } catch (error) {
      logger.error('Failed to add market data batch:', error);
      throw error;
    }
  }

  async getBySymbol(
    symbol: string,
    startTime?: number,
    endTime?: number
  ): Promise<MarketDataDocument[]> {
    try {
      const query: any = { symbol };
      
      if (startTime || endTime) {
        query.timestamp = {};
        if (startTime) query.timestamp.$gte = startTime;
        if (endTime) query.timestamp.$lte = endTime;
      }

      return await MarketData.find(query).sort({ timestamp: -1 });
    } catch (error) {
      logger.error('Failed to get market data:', error);
      throw error;
    }
  }
}

export const marketDataRepository = new MarketDataRepository();