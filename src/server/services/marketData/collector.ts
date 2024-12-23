import { subYears, addDays } from 'date-fns';
import { getClient } from '../../../services/market/client';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';
import { logger } from '../../utils/logger';
import type { MarketData } from '../../../db/types/marketData';
import type { CollectionProgress } from './types';

const BATCH_SIZE = 1000;
const RATE_LIMIT_DELAY = 500;

export class MarketDataCollector {
  private isCollecting = false;
  private shouldStop = false;

  async startCollection(
    symbol: string,
    onProgress: (progress: CollectionProgress) => void
  ): Promise<void> {
    if (this.isCollecting) {
      logger.warn('Collection already in progress');
      return;
    }

    this.isCollecting = true;
    this.shouldStop = false;

    try {
      const endDate = new Date();
      const startDate = subYears(endDate, 10);
      let currentDate = startDate;

      logger.info(`Starting data collection from ${startDate.toISOString()} to ${endDate.toISOString()}`);

      while (currentDate < endDate && !this.shouldStop) {
        await this.collectDayData(currentDate, symbol, onProgress);
        currentDate = addDays(currentDate, 1);
      }

      logger.info('Data collection completed');
    } catch (error) {
      logger.error('Data collection failed:', error);
      throw error;
    } finally {
      this.isCollecting = false;
    }
  }

  private async collectDayData(
    date: Date,
    symbol: string,
    onProgress: (progress: CollectionProgress) => void
  ): Promise<void> {
    const client = getClient();
    const nextDate = addDays(date, 1);

    try {
      const candles = await client.candles({
        symbol,
        interval: '1m',
        startTime: date.getTime(),
        endTime: nextDate.getTime()
      });

      if (!candles.length) {
        logger.warn(`No data for ${date.toISOString()}`);
        return;
      }

      const data = this.transformCandles(candles, symbol);
      await this.saveBatch(data);

      onProgress({
        date,
        recordsCollected: data.length,
        totalRecords: await marketDataRepository.getTotalRecords(symbol)
      });

      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    } catch (error) {
      logger.error(`Failed to collect data for ${date.toISOString()}:`, error);
      throw error;
    }
  }

  private transformCandles(candles: any[], symbol: string): MarketData[] {
    return candles.map(candle => ({
      timestamp: candle.openTime,
      symbol,
      price: parseFloat(candle.close),
      volume: parseFloat(candle.volume)
    }));
  }

  private async saveBatch(data: MarketData[]): Promise<void> {
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      await marketDataRepository.addBatch(batch);
    }
  }

  stopCollection(): void {
    this.shouldStop = true;
  }

  isActive(): boolean {
    return this.isCollecting;
  }
}

export const marketDataCollector = new MarketDataCollector();