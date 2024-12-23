import { logger } from '../../utils/logger';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';
import { getClient } from '../../../services/market/client';
import type { CollectionProgress } from './types';

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
      const client = getClient();
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear() - 5, 0, 1);
      let currentDate = startDate;

      while (currentDate < endDate && !this.shouldStop) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const candles = await client.candles({
          symbol,
          interval: '1m',
          startTime: currentDate.getTime(),
          endTime: nextDate.getTime()
        });

        if (candles.length) {
          await marketDataRepository.addBatch(
            candles.map(candle => ({
              timestamp: candle.openTime,
              symbol,
              price: parseFloat(candle.close),
              volume: parseFloat(candle.volume)
            }))
          );
        }

        const progress = ((currentDate.getTime() - startDate.getTime()) /
          (endDate.getTime() - startDate.getTime())) * 100;

        onProgress({
          progress,
          currentDate: new Date(currentDate),
          recordsCollected: candles.length
        });

        currentDate = nextDate;
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      }
    } catch (error) {
      logger.error('Collection failed:', error);
      throw error;
    } finally {
      this.isCollecting = false;
    }
  }

  stopCollection(): void {
    this.shouldStop = true;
  }
}