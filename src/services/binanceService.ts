import { subYears } from 'date-fns';
import { getMarketData, storeMarketData } from './database/marketDataRepository';
import { findMissingDateRanges, processMissingData } from './market/dataProcessor';
import { calculateIndicators, analyzeStrategyPerformance } from './technicalAnalysis';
import type { MarketData } from '../db/database';

export interface MarketDataResponse {
  symbol: string;
  price: number;
  volume: number;
}

export interface HistoricalDataProgress {
  year: number;
  month: number;
  progress: number;
}

export interface AnalysisResult {
  indicators: TechnicalIndicators;
  performance: {
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    successfulTrades: number;
  };
}

const YEARS_TO_FETCH = 5;

export const fetchMarketData = async (symbol: string): Promise<MarketDataResponse> => {
  try {
    const data = {
      symbol,
      price: 45000 + Math.random() * 1000,
      volume: 100000 + Math.random() * 50000
    };

    await storeMarketData({
      timestamp: new Date(),
      symbol: data.symbol,
      price: data.price,
      volume: data.volume
    });

    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch market data');
  }
};

export const processMarketTrends = async (
  callback: (progress: number, step: string, details?: HistoricalDataProgress) => void
): Promise<AnalysisResult[]> => {
  const symbol = 'BTC/USDT';
  const currentDate = new Date();
  const startDate = subYears(currentDate, YEARS_TO_FETCH);
  const results: AnalysisResult[] = [];

  try {
    callback(5, 'Checking existing data...');
    const missingDates = await findMissingDateRanges(symbol, startDate, currentDate);

    if (missingDates.length > 0) {
      callback(15, 'Processing missing historical data...');
      await processMissingData(symbol, missingDates, (progress, currentDate) => {
        callback(15 + progress * 0.4, 'Fetching missing historical data...', {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          progress
        });
      });
    }

    callback(60, 'Calculating technical indicators...');
    const marketData = await getMarketData(symbol);

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
    
    callback(90, 'Compiling analysis results...');
    await new Promise(resolve => setTimeout(resolve, 500));

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
};