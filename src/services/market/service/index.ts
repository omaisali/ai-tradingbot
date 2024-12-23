import { logger } from '../../../utils/logger';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';
import { getClient } from '../client';
import { MarketError } from '../errors';
import type { MarketDataResponse } from '../types';

let isRunning = false;
let updateInterval: NodeJS.Timeout | null = null;

export async function startMarketService(): Promise<void> {
  if (isRunning) {
    logger.info('Market service already running');
    return;
  }

  try {
    logger.info('Starting market service...');
    isRunning = true;

    // Initial update
    await updateMarketData();

    // Schedule periodic updates
    updateInterval = setInterval(async () => {
      try {
        await updateMarketData();
      } catch (error) {
        logger.error('Market update failed:', error);
      }
    }, 5000);

    logger.info('Market service started successfully');
  } catch (error) {
    isRunning = false;
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    throw new MarketError('Failed to start market service', error as Error);
  }
}

async function updateMarketData(): Promise<void> {
  try {
    const symbol = 'BTCUSDT';
    const client = getClient();

    logger.debug('Fetching market data...');
    const [ticker, trades] = await Promise.all([
      client.prices({ symbol }),
      client.trades({ symbol, limit: 1 })
    ]);

    const data: MarketDataResponse = {
      symbol,
      price: parseFloat(ticker[symbol]),
      volume: trades[0]?.quantity ? parseFloat(trades[0].quantity) : 0,
      timestamp: Date.now()
    };

    // Store in database
    await marketDataRepository.add({
      timestamp: data.timestamp!,
      symbol: data.symbol,
      price: data.price,
      volume: data.volume
    });

    logger.debug('Market data updated:', {
      symbol: data.symbol,
      price: data.price,
      timestamp: new Date(data.timestamp!).toISOString()
    });
  } catch (error) {
    logger.error('Failed to update market data:', error);
    throw error;
  }
}

export function stopMarketService(): void {
  if (!isRunning) return;
  
  logger.info('Stopping market service...');
  isRunning = false;
  
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}