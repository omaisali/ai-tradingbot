import { getClient } from '../client';
import { marketEvents } from '../events/marketEvents';
import { MarketError } from '../errors';
import type { MarketDataResponse } from '../types';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';

let updateInterval: NodeJS.Timer | null = null;
const UPDATE_INTERVAL = 5000; // 5 seconds

export async function updateMarketData(symbol: string): Promise<MarketDataResponse> {
  try {
    const client = getClient();
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

    marketEvents.emitUpdate(data);
    return data;
  } catch (error) {
    const marketError = error instanceof MarketError ? error : new MarketError('Market update failed', error as Error);
    marketEvents.emitError(marketError);
    throw marketError;
  }
}

export function startRealTimeUpdates(symbol: string): void {
  if (updateInterval) return;

  // Initial update
  updateMarketData(symbol).catch(console.error);

  // Schedule periodic updates
  updateInterval = setInterval(() => {
    updateMarketData(symbol).catch(console.error);
  }, UPDATE_INTERVAL);
}

export function stopRealTimeUpdates(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}