import { MarketData } from '../db/models';
import { subYears } from 'date-fns';
import { logger } from './logger';

interface MarketDataStatus {
  totalRecords: number;
  daysOfData: number;
  firstDate: Date;
  lastDate: Date;
  dataCompleteness: number;
  latestPrice: number;
  latestVolume: number;
  isComplete: boolean;
  isRecent: boolean;
  hasFullHistory: boolean;
}

export async function verifyMarketData(): Promise<MarketDataStatus | null> {
  try {
    const data = await MarketData.find({ symbol: 'BTCUSDT' })
      .sort({ timestamp: 1 })
      .lean()
      .exec();
    
    if (!data.length) {
      logger.warn('No market data found in database');
      return null;
    }

    const firstData = data[0];
    const lastData = data[data.length - 1];
    
    // Calculate time range
    const daysOfData = Math.floor((lastData.timestamp - firstData.timestamp) / (1000 * 60 * 60 * 24));
    
    // Calculate expected records (1 record per minute)
    const expectedRecords = daysOfData * 24 * 60;
    const dataCompleteness = Math.min((data.length / expectedRecords) * 100, 100);

    // Check if we have recent data (within last hour)
    const isRecent = Date.now() - lastData.timestamp < 60 * 60 * 1000;
    
    // Check if we have enough historical data (10 years)
    const tenYearsAgo = subYears(new Date(), 10).getTime();
    const hasFullHistory = firstData.timestamp <= tenYearsAgo;

    // Data is complete if we have recent data, full history, and good completeness
    const isComplete = isRecent && hasFullHistory && dataCompleteness > 95;

    return {
      totalRecords: data.length,
      daysOfData,
      firstDate: new Date(firstData.timestamp),
      lastDate: new Date(lastData.timestamp),
      dataCompleteness,
      latestPrice: lastData.price,
      latestVolume: lastData.volume,
      isComplete,
      isRecent,
      hasFullHistory
    };
  } catch (error) {
    logger.error('Failed to verify market data:', error);
    return null;
  }
}