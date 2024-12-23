import { marketDataCollector } from './collector';
import { verifyMarketData } from '../../../utils/verifyMarketData';
import { logger } from '../../utils/logger';
import { connectionManager } from '../../websocket/connectionManager';
import type { CollectionProgress } from './types';

class MarketDataManager {
  private symbol: string = 'BTCUSDT';
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.debug('Market data manager already initialized');
      return;
    }

    try {
      logger.info('Initializing market data manager...');
      const status = await verifyMarketData();
      
      if (!status?.isComplete) {
        logger.info('Starting market data collection...');
        await this.startCollection();
      } else {
        logger.info('Market data is complete and up to date');
      }

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize market data:', error);
      throw error;
    }
  }

  private async startCollection(): Promise<void> {
    try {
      await marketDataCollector.startCollection(this.symbol, this.handleProgress);
    } catch (error) {
      logger.error('Collection failed:', error);
      throw error;
    }
  }

  private handleProgress = (progress: CollectionProgress): void => {
    // Calculate overall progress
    const progressPercent = Math.min(
      ((progress.date.getTime() - new Date(2014, 0).getTime()) /
        (Date.now() - new Date(2014, 0).getTime())) * 100,
      100
    );

    // Broadcast progress to all connected clients
    connectionManager.broadcast({
      type: 'collection-progress',
      data: {
        date: progress.date,
        recordsCollected: progress.recordsCollected,
        totalRecords: progress.totalRecords,
        progress: progressPercent
      }
    });
  };

  stopCollection(): void {
    if (marketDataCollector.isActive()) {
      marketDataCollector.stopCollection();
      logger.info('Market data collection stopped');
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const marketDataManager = new MarketDataManager();