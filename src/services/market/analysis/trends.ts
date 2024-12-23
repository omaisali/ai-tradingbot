import { subYears } from 'date-fns';
import type { MarketData } from '../../../db/types/marketData';
import type { AnalysisResult, HistoricalDataProgress } from '../types';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';
import { calculateIndicators, analyzeStrategyPerformance } from '../../technicalAnalysis';
import { getClient } from '../client';
import { MarketError } from '../errors';

const YEARS_TO_FETCH = 5;

export async function processMarketTrends(
  callback: (progress: number, step: string, details?: HistoricalDataProgress) => void
): Promise<AnalysisResult[]> {
  const symbol = 'BTCUSDT';
  const currentDate = new Date();
  const startDate = subYears(currentDate, YEARS_TO_FETCH);
  const results: AnalysisResult[] = [];

  try {
    callback(5, 'Checking existing data...');
    const existingData = await marketDataRepository.getBySymbol(symbol);

    if (!existingData.length) {
      callback(15, 'Processing historical data...');
      const client = getClient();
      
      // Fetch historical klines (candlestick) data
      const klines = await client.candles({
        symbol: symbol,
        interval: '1m',
        startTime: startDate.getTime(),
        endTime: currentDate.getTime()
      });

      // Convert klines to market data format
      const historicalData: MarketData[] = klines.map(kline => ({
        timestamp: kline.openTime,
        symbol,
        price: parseFloat(kline.close),
        volume: parseFloat(kline.volume)
      }));

      // Store historical data in batches
      await marketDataRepository.addBatch(historicalData);
    }

    callback(60, 'Calculating technical indicators...');
    const marketData = await marketDataRepository.getBySymbol(symbol);

    if (!marketData.length) {
      throw new MarketError('No market data available for analysis');
    }

    const windowSize = 50;
    const indicators = [];

    for (let i = windowSize; i < marketData.length; i++) {
      const windowData = marketData.slice(i - windowSize, i);
      indicators.push(calculateIndicators(windowData));
      
      if (i % 100 === 0) {
        const progress = 60 + (i / marketData.length) * 20;
        callback(progress, 'Processing technical indicators...');
      }
    }

    callback(80, 'Analyzing trading strategy...');
    const performance = analyzeStrategyPerformance(marketData, indicators);
    
    callback(90, 'Compiling analysis results...');
    await new Promise(resolve => setTimeout(resolve, 500));

    callback(100, 'Market analysis complete');

    results.push({
      indicators: indicators[indicators.length - 1],
      performance
    });

    return results;
  } catch (error) {
    throw new MarketError('Failed to process market trends', error as Error);
  }
}