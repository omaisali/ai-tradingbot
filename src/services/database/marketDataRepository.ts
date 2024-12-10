import { db } from '../../db/database';
import { validateMarketData } from '../../db/utils/validators';
import type { MarketData } from '../../db/types';
import { ensureDatabaseConnection } from '../../db/initDatabase';

export async function storeMarketData(data: Omit<MarketData, 'id'> | Array<Omit<MarketData, 'id'>>) {
  await ensureDatabaseConnection();

  try {
    if (Array.isArray(data)) {
      const validatedData = data.map(item => validateMarketData(item));
      const chunkSize = 100;
      
      for (let i = 0; i < validatedData.length; i += chunkSize) {
        const chunk = validatedData.slice(i, i + chunkSize);
        await db.marketData.bulkAdd(chunk);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } else {
      const validatedData = validateMarketData(data);
      await db.marketData.add(validatedData);
    }
  } catch (error) {
    console.error('Error storing market data:', error);
    throw new Error('Failed to store market data');
  }
}

export async function getMarketData(
  symbol: string,
  limit?: number,
  startDate?: Date,
  endDate?: Date
) {
  await ensureDatabaseConnection();

  try {
    let collection = db.marketData.where('symbol').equals(symbol);

    if (startDate || endDate) {
      collection = collection.filter(data => {
        if (startDate && data.timestamp < startDate.getTime()) return false;
        if (endDate && data.timestamp > endDate.getTime()) return false;
        return true;
      });
    }

    const query = collection.reverse();
    const data = limit ? await query.limit(limit).toArray() : await query.toArray();

    return data.map(item => ({
      ...item,
      timestamp: item.timestamp
    }));
  } catch (error) {
    console.error('Error retrieving market data:', error);
    throw new Error('Failed to retrieve market data');
  }
}

export async function getExistingDataRange(symbol: string): Promise<{
  oldestData: MarketData | null;
  newestData: MarketData | null;
}> {
  await ensureDatabaseConnection();

  try {
    const [oldest, newest] = await Promise.all([
      db.marketData
        .where('symbol')
        .equals(symbol)
        .orderBy('timestamp')
        .first(),
      db.marketData
        .where('symbol')
        .equals(symbol)
        .orderBy('timestamp')
        .reverse()
        .first()
    ]);

    return {
      oldestData: oldest || null,
      newestData: newest || null
    };
  } catch (error) {
    console.error('Error getting data range:', error);
    throw new Error('Failed to get existing data range');
  }
}