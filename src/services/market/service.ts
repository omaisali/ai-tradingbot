import { getClient } from './client';
import { MarketError } from './errors';
import { marketEvents } from './events/marketEvents';
import type { MarketDataResponse } from './types';
import { marketDataRepository } from '../../db/repositories/marketDataRepository';

let isRunning = false;

export async function startMarketService(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  try {
    await updateMarketData();
    scheduleNextUpdate();
  } catch (error) {
    isRunning = false;
    throw new MarketError('Failed to start market service', error as Error);
  }
}

export function stopMarketService(): void {
  isRunning = false;
}

async function updateMarketData(): Promise<void> {
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

function scheduleNextUpdate(): void {
  if (!isRunning) return;
  
  const UPDATE_INTERVAL = 5000; // 5 seconds
  setTimeout(async () => {
    await updateMarketData();
    scheduleNextUpdate();
  }, UPDATE_INTERVAL);
}

export function subscribeToMarketUpdates(
  callback: (data: MarketDataResponse) => void,
  onError?: (error: Error) => void
): () => void {
  marketEvents.onUpdate(callback);
  if (onError) {
    marketEvents.onError(onError);
  }

  return () => {
    marketEvents.offUpdate(callback);
    if (onError) {
      marketEvents.offError(onError);
    }
  };
}