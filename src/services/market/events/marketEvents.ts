import { EventEmitter } from './EventEmitter';
import type { MarketDataResponse } from '../types';

// Event type constants for market events
export const MarketEventTypes = {
  UPDATE: 'market-update',
  ERROR: 'market-error'
} as const;

// Extended EventEmitter for handling market-specific events
class MarketEventEmitter extends EventEmitter {
  // Emits a market data update event
  emitUpdate(data: MarketDataResponse): void {
    this.emit(MarketEventTypes.UPDATE, data);
  }

  // Emits a market error event
  emitError(error: Error): void {
    this.emit(MarketEventTypes.ERROR, error);
  }

  // Subscribes to market updates
  onUpdate(callback: (data: MarketDataResponse) => void): () => void {
    this.on(MarketEventTypes.UPDATE, callback);
    return () => this.off(MarketEventTypes.UPDATE, callback);
  }

  // Subscribes to market errors
  onError(callback: (error: Error) => void): () => void {
    this.on(MarketEventTypes.ERROR, callback);
    return () => this.off(MarketEventTypes.ERROR, callback);
  }

  // Unsubscribes from market updates
  offUpdate(callback: (data: MarketDataResponse) => void): void {
    this.off(MarketEventTypes.UPDATE, callback);
  }

  // Unsubscribes from error events
  offError(callback: (error: Error) => void): void {
    this.off(MarketEventTypes.ERROR, callback);
  }
}

// Singleton instance of the market event emitter
export const marketEvents = new MarketEventEmitter();