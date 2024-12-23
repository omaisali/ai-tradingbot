import { logger } from '../../utils/logger';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';
import { wsManager } from '../../websocket/manager';
import { MarketDataCollector } from './collector';
import type { MarketStatus } from './types';

class MarketDataManager {
  private collector: MarketDataCollector;
  private isInitialized = false;

  constructor() {
    this.collector = new MarketDataCollector();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.debug('Market data manager already initialized');
      return;
    }

    try {
      logger.info('Initializing market data manager...');
      const status = await this.getStatus();
      
      if (!status.hasData) {
        logger.info('Starting initial data collection...');
        await this.startCollection();
      }

      this.isInitialized = true;
      logger.info('Market data manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize market data manager:', error);
      throw error;
    }
  }

  async getStatus(): Promise<MarketStatus> {
    const data = await marketDataRepository.getBySymbol('BTCUSDT');
    return {
      hasData: data.length > 0,
      totalRecords: data.length,
      lastUpdate: data.length ? new Date(data[data.length - 1].timestamp) : null
    };
  }

  private async startCollection(): Promise<void> {
    try {
      await this.collector.startCollection('BTCUSDT', (progress) => {
        wsManager.broadcast({
          type: 'collection-progress',
          data: progress
        });
      });
    } catch (error) {
      logger.error('Collection failed:', error);
      throw error;
    }
  }

  stopCollection(): void {
    this.collector.stopCollection();
  }
}

export const marketDataManager = new MarketDataManager();