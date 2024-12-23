import { subYears } from 'date-fns';
import type { MarketData, AnalysisResult, HistoricalDataProgress } from './types';
import { fetchMarketData } from './api';
import { findMissingDateRanges, processMissingData } from './dataProcessor';
import { marketDataRepository } from '../../db/repositories/marketDataRepository';
import { calculateIndicators, analyzeStrategyPerformance } from '../analysis/technicalAnalysis';

const YEARS_TO_FETCH = 5;
const UPDATE_INTERVAL = 5000; // 5 seconds

export async function startMarketDataUpdates(symbol: string): Promise<() => void> {
  let isRunning = true;

  const updateData = async () => {
    try {
      if (!isRunning) return;

      const data = await fetchMarketData(symbol);
      await marketDataRepository.add({
        timestamp: Date.now(),
        symbol: data.symbol,
        price: data.price,
        volume: data.volume
      });

      if (isRunning) {
        setTimeout(updateData, UPDATE_INTERVAL);
      }
    } catch (error) {
      console.error('Error updating market data:', error);
      if (isRunning) {
        setTimeout(updateData, UPDATE_INTERVAL * 2); // Retry with longer interval
      }
    }
  };

  updateData();
  return () => { isRunning = false; };
}

export async function processMarketTrends(
  callback: (progress: number, step: string, details?: HistoricalDataProgress) => void
): Promise<AnalysisResult[]> {
  const symbol = 'BTCUSDT';
  const currentDate = new Date();
  const startDate = subYears(currentDate, YEARS_TO_FETCH);
  const results: AnalysisResult[] = [];

  try {
    callback(5, 'Checking existing data...');
    const missingRanges = await findMissingDateRanges(symbol, startDate, currentDate);

    if (missingRanges.length > 0) {
      callback(15, 'Processing historical data...');
      await processMissingData(symbol, missingRanges, (progress, currentDate) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        callback(15 + progress * 0.45, 'Processing historical data...', {
          year,
          month,
          progress
        });
      });
    }

    callback(60, 'Calculating technical indicators...');
    const marketData = await marketDataRepository.getBySymbol(symbol);

    if (!marketData.length) {
      throw new Error('No market data available for analysis');
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

    callback(100, 'Market analysis complete');

    results.push({
      indicators: indicators[indicators.length - 1],
      performance
    });

    return results;
  } catch (error) {
    console.error('Error processing market trends:', error);
    throw new Error('Failed to process market trends');
  }
}