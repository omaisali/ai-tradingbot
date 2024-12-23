import { getClient } from '../client';
import { MarketError } from '../errors';
import { marketEvents } from '../events/marketEvents';
import type { MarketDataResponse } from '../types';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';

let isRunning = false;

export async function updateMarketData(): Promise<void> {
  try {
    const symbol = 'BTCUSDT';
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

    // Emit update event
    marketEvents.emitUpdate(data);
  } catch (error) {
    const marketError = error instanceof MarketError ? error : new MarketError('Market update failed', error as Error);
    console.error('Market update failed:', marketError);
    marketEvents.emitError(marketError);
  }
}

export function scheduleNextUpdate(): void {
  if (!isRunning) return;
  
  const UPDATE_INTERVAL = 5000; // 5 seconds
  setTimeout(async () => {
    await updateMarketData();
    scheduleNextUpdate();
  }, UPDATE_INTERVAL);
}

export function startUpdates(): void {
  if (isRunning) return;
  isRunning = true;
  scheduleNextUpdate();
}

export function stopUpdates(): void {
  isRunning = false;
}