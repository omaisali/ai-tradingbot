import { getClient } from '../client';
import { MarketError } from '../errors';
import { marketEvents } from '../events/marketEvents';
import type { MarketDataResponse } from '../types';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';

const UPDATE_INTERVAL = 5000;
let updateTimer: ReturnType<typeof setInterval> | null = null;

export async function updateMarketData(): Promise<MarketDataResponse> {
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

export function startUpdates(): void {
  if (updateTimer) return;
  
  updateTimer = setInterval(async () => {
    try {
      await updateMarketData();
    } catch (error) {
      console.error('Market update failed:', error);
    }
  }, UPDATE_INTERVAL);
}

export function stopUpdates(): void {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
}