import { startOfDay, eachDayOfInterval, addMinutes } from 'date-fns';
import type { MarketData } from './types';
import { marketDataRepository } from '../../db/repositories/marketDataRepository';
import { simulateHistoricalPrice } from './priceSimulator';

export async function findMissingDateRanges(
  symbol: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ start: Date; end: Date }>> {
  try {
    const existingData = await marketDataRepository.getBySymbol(symbol);
    
    if (!existingData.length) {
      return [{
        start: startDate,
        end: endDate
      }];
    }

    const timestamps = existingData.map(d => d.timestamp).sort((a, b) => a - b);
    const ranges: Array<{ start: Date; end: Date }> = [];
    let currentDate = startDate;

    for (const timestamp of timestamps) {
      const date = new Date(timestamp);
      if (currentDate < date) {
        ranges.push({
          start: currentDate,
          end: date
        });
      }
      currentDate = new Date(date.getTime() + 60000); // Add 1 minute
    }

    if (currentDate < endDate) {
      ranges.push({
        start: currentDate,
        end: endDate
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
): Promise<void> {
  try {
    const batchSize = 100;
    let totalProcessed = 0;
    const totalRanges = missingRanges.length;

    for (const range of missingRanges) {
      const dataPoints: MarketData[] = [];
      let currentDate = range.start;

      while (currentDate <= range.end) {
        // Generate data points for every minute
        for (let i = 0; i < 1440 && currentDate <= range.end; i++) {
          dataPoints.push({
            timestamp: currentDate.getTime(),
            symbol,
            price: simulateHistoricalPrice(currentDate),
            volume: Math.random() * 1000000
          });
          currentDate = addMinutes(currentDate, 1);
        }

        if (dataPoints.length >= batchSize) {
          await marketDataRepository.addBatch(dataPoints.splice(0, batchSize));
          const progress = (totalProcessed / totalRanges) * 100;
          onProgress(progress, currentDate);
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      if (dataPoints.length > 0) {
        await marketDataRepository.addBatch(dataPoints);
      }

      totalProcessed++;
      onProgress((totalProcessed / totalRanges) * 100, currentDate);
    }
  } catch (error) {
    console.error('Error processing missing data:', error);
    throw new Error('Failed to process missing market data');
  }
}