import { subYears } from 'date-fns';
import { marketEvents } from '../events/marketEvents';
import { fetchHistoricalData } from './historicalData';
import { startRealTimeUpdates, stopRealTimeUpdates } from './realTimeUpdates';
import { MarketError } from '../errors';
import type { HistoricalDataProgress } from '../types';
import { verifyMarketData } from '../../../utils/verifyMarketData';

let isInitialized = false;
let currentSymbol: string | null = null;
let initializationProgress = 0;
let historicalDataFetched = false;

export async function initializeMarketData(
  symbol: string,
  onProgress?: (progress: number, details: HistoricalDataProgress) => void
): Promise<void> {
  try {
    console.log('Starting market data initialization...');
    stopRealTimeUpdates();
    isInitialized = false;
    historicalDataFetched = false;
    initializationProgress = 0;
    currentSymbol = symbol;

    // Check existing data
    const status = await verifyMarketData();
    const hasCompleteData = status?.dataCompleteness === 100;

    if (!hasCompleteData) {
      console.log('Fetching historical data...');
      const progressCallback = (progress: number, details: HistoricalDataProgress) => {
        console.log(`Historical data: ${progress}%, ${details.year}/${details.month}`);
        initializationProgress = progress;
        onProgress?.(progress, details);
        marketEvents.emit('initialization-progress', { progress, details });
      };

      const historicalData = await fetchHistoricalData(symbol, progressCallback);
      
      if (!historicalData.length) {
        throw new MarketError('Failed to fetch historical data');
      }

      historicalDataFetched = true;
      console.log(`Historical data fetch complete: ${historicalData.length} records`);
    } else {
      console.log('Using existing historical data');
      historicalDataFetched = true;
      initializationProgress = 100;
      onProgress?.(100, {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        progress: 100
      });
    }

    // Start real-time updates
    console.log('Starting real-time updates...');
    await startRealTimeUpdates(symbol);

    isInitialized = true;
    marketEvents.emit('initialization-complete', { symbol });
  } catch (error) {
    console.error('Market data initialization failed:', error);
    isInitialized = false;
    historicalDataFetched = false;
    initializationProgress = 0;
    currentSymbol = null;
    marketEvents.emit('initialization-error', error);
    throw new MarketError('Failed to initialize market data', error as Error);
  }
}

export function getInitializationProgress(): number {
  return initializationProgress;
}

export function isHistoricalDataFetched(): boolean {
  return historicalDataFetched;
}

export function getCurrentSymbol(): string | null {
  return currentSymbol;
}

export function isMarketDataInitialized(): boolean {
  return isInitialized;
}