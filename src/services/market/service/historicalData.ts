import { subYears, addDays } from 'date-fns';
import { getClient } from '../client';
import { marketDataRepository } from '../../../db/repositories/marketDataRepository';
import { logger } from '../../../server/utils/logger';
import type { MarketData } from '../../../db/types/marketData';
import type { HistoricalDataProgress } from '../types';

const YEARS_TO_FETCH = 10;
const BATCH_SIZE = 1000;
const RATE_LIMIT_DELAY = 500; // Increased delay to avoid rate limits

export async function fetchHistoricalData(
  symbol: string,
  onProgress: (progress: number, details: HistoricalDataProgress) => void
): Promise<MarketData[]> {
  logger.info(`Starting historical data collection for ${symbol}`);
  
  const client = getClient();
  const endDate = new Date();
  const startDate = subYears(endDate, YEARS_TO_FETCH);
  
  logger.info(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const historicalData: MarketData[] = [];
  let currentDate = new Date(startDate);
  const totalTimeRange = endDate.getTime() - startDate.getTime();

  while (currentDate < endDate) {
    const yearProgress = ((currentDate.getTime() - startDate.getTime()) / totalTimeRange) * 100;
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    try {
      logger.info(`Fetching data for ${currentYear}/${currentMonth}`);
      
      // Fetch data in smaller chunks (1 day at a time)
      const nextDate = addDays(currentDate, 1);
      
      const candles = await client.candles({
        symbol,
        interval: '1m', // 1-minute intervals for better granularity
        startTime: currentDate.getTime(),
        endTime: Math.min(nextDate.getTime(), endDate.getTime())
      });

      if (!candles.length) {
        logger.warn(`No data received for ${currentYear}/${currentMonth}/${currentDate.getDate()}`);
        currentDate = nextDate;
        continue;
      }

      logger.info(`Received ${candles.length} candles for ${currentYear}/${currentMonth}/${currentDate.getDate()}`);

      const dayData = candles.map(candle => ({
        timestamp: candle.openTime,
        symbol,
        price: parseFloat(candle.close),
        volume: parseFloat(candle.volume)
      }));

      // Store data in batches
      for (let i = 0; i < dayData.length; i += BATCH_SIZE) {
        const batch = dayData.slice(i, i + BATCH_SIZE);
        await marketDataRepository.addBatch(batch);
        
        // Calculate and update progress
        const progress = Math.min(100, yearProgress + (currentDate.getDate() / 31) * (100 / YEARS_TO_FETCH / 12));
        
        logger.info(`Progress: ${progress.toFixed(2)}% - ${currentYear}/${currentMonth}/${currentDate.getDate()}`);
        
        marketDataRepository.updateCollectionProgress(progress, currentYear, currentMonth);
        onProgress(progress, { 
          year: currentYear, 
          month: currentMonth, 
          progress 
        });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }

      historicalData.push(...dayData);
      currentDate = nextDate;

    } catch (error) {
      logger.error(`Failed to fetch data for ${currentYear}/${currentMonth}/${currentDate.getDate()}:`, error);
      // Add longer delay before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  logger.info(`Historical data collection complete. Total records: ${historicalData.length}`);
  return historicalData;
}