import { startOfDay, eachDayOfInterval, parseISO, addMinutes } from 'date-fns';
import type { MarketData } from '../../db/database';
import { getExistingDataRange, storeMarketData } from '../database/marketDataRepository';
import { simulateHistoricalPrice } from './priceSimulator';
import { ensureDatabaseConnection } from '../../db/initDatabase';

export async function findMissingDateRanges(symbol: string, startDate: Date, endDate: Date) {
  try {
    await ensureDatabaseConnection();

    const { oldestData, newestData } = await getExistingDataRange(symbol);
    
    // If no data exists, return the entire date range
    if (!oldestData || !newestData) {
      return [{
        start: startDate,
        end: endDate
      }];
    }

    const ranges = [];
    const effectiveStartDate = startOfDay(startDate);
    const effectiveEndDate = startOfDay(endDate);

    // Check if we need data before the oldest record
    if (effectiveStartDate < oldestData.timestamp) {
      ranges.push({
        start: effectiveStartDate,
        end: oldestData.timestamp
      });
    }

    // Check if we need data after the newest record
    if (effectiveEndDate > newestData.timestamp) {
      ranges.push({
        start: newestData.timestamp,
        end: effectiveEndDate
      });
    }

    return ranges;
  } catch (error) {
    console.error('Error finding missing dates:', error);
    throw new Error('Failed to analyze missing date ranges');
  }
}

export async function processMissingData(
  symbol: string,
  missingRanges: Array<{ start: Date; end: Date }>,
  onProgress: (progress: number, currentDate: Date) => void
) {
  try {
    await ensureDatabaseConnection();

    let totalProcessed = 0;
    const totalRanges = missingRanges.length;

    for (const range of missingRanges) {
      let currentDate = range.start;
      const batchSize = 100;
      const dataPoints = [];

      while (currentDate <= range.end) {
        // Generate data points for every minute
        for (let i = 0; i < 1440 && currentDate <= range.end; i++) {
          dataPoints.push({
            timestamp: new Date(currentDate),
            symbol,
            price: simulateHistoricalPrice(currentDate),
            volume: 100000 + Math.random() * 900000
          });
          currentDate = addMinutes(currentDate, 1);
        }

        // Store in batches
        if (dataPoints.length >= batchSize || currentDate > range.end) {
          await storeMarketData(dataPoints.splice(0, batchSize));
          const progress = (totalProcessed / totalRanges) * 100;
          onProgress(progress, currentDate);
          await new Promise(resolve => setTimeout(resolve, 10)); // Prevent UI blocking
        }
      }

      totalProcessed++;
    }
  } catch (error) {
    console.error('Error processing missing data:', error);
    throw new Error('Failed to process missing market data');
  }
}