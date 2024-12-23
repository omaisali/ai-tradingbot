import { subYears } from 'date-fns';
import { marketDataRepository } from '../db/repositories/marketDataRepository';
import { calculateIndicators, analyzeStrategyPerformance } from './technicalAnalysis';
import { getClient, initializeClient, validateClientCredentials } from './market/client';
import { MarketError } from './market/errors';
import { processMarketTrends } from './market/analysis';
import type { MarketData } from '../db/types/marketData';
import type { MarketDataResponse, HistoricalDataProgress, AnalysisResult } from './market/types';

export { 
  initializeClient,
  processMarketTrends 
};

export async function validateBinanceCredentials(apiKey: string, secretKey: string): Promise<boolean> {
  return validateClientCredentials(apiKey, secretKey);
}

export async function fetchMarketData(symbol: string): Promise<MarketDataResponse> {
  try {
    const client = getClient();

    const [ticker, trades] = await Promise.all([
      client.prices({ symbol }),
      client.trades({ symbol, limit: 1 })
    ]);

    const data = {
      symbol,
      price: parseFloat(ticker[symbol]),
      volume: trades[0]?.quantity ? parseFloat(trades[0].quantity) : 0
    };

    await marketDataRepository.add({
      timestamp: Date.now(),
      symbol: data.symbol,
      price: data.price,
      volume: data.volume
    });

    return data;
  } catch (error) {
    if (error instanceof MarketError) {
      throw error;
    }
    throw new MarketError('Failed to fetch market data', error as Error);
  }
}