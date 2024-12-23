import { MarketError } from '../errors';
import { updateMarketData, startUpdates, stopUpdates } from './updater';
import { marketEvents } from '../events/marketEvents';
import type { MarketDataResponse } from '../types';

let isServiceRunning = false;
let lastUpdate: MarketDataResponse | null = null;

export async function startMarketService(): Promise<void> {
  if (isServiceRunning) return;

  try {
    const data = await updateMarketData();
    lastUpdate = data;
    startUpdates();
    isServiceRunning = true;
  } catch (error) {
    throw new MarketError('Failed to start market service', error as Error);
  }
}

export function stopMarketService(): void {
  if (!isServiceRunning) return;
  stopUpdates();
  isServiceRunning = false;
}

export function getLastUpdate(): MarketDataResponse | null {
  return lastUpdate;
}

export function subscribeToMarketUpdates(
  onUpdate: (data: MarketDataResponse) => void,
  onError?: (error: Error) => void
): () => void {
  // Send last update immediately if available
  if (lastUpdate) {
    setTimeout(() => onUpdate(lastUpdate!), 0);
  }

  const unsubscribeUpdate = marketEvents.onUpdate((data) => {
    lastUpdate = data;
    onUpdate(data);
  });
  
  const unsubscribeError = onError ? marketEvents.onError(onError) : undefined;

  return () => {
    unsubscribeUpdate();
    if (unsubscribeError) {
      unsubscribeError();
    }
  };
}