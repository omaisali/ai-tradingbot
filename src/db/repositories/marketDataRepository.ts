import { db } from '../database';
import type { MarketData } from '../schema';

export async function addMarketData(data: Omit<MarketData, 'id'>): Promise<number> {
  try {
    return await db.marketData.add({
      ...data,
      timestamp: data.timestamp instanceof Date ? data.timestamp.getTime() : data.timestamp,
      symbol: String(data.symbol),
      price: Number(data.price),
      volume: Number(data.volume)
    });
  } catch (error) {
    console.error('Failed to add market data:', error);
    throw new Error('Failed to add market data to database');
  }
}

export async function addMarketDataBatch(dataArray: Omit<MarketData, 'id'>[]): Promise<void> {
  try {
    const processedData = dataArray.map(data => ({
      ...data,
      timestamp: data.timestamp instanceof Date ? data.timestamp.getTime() : data.timestamp,
      symbol: String(data.symbol),
      price: Number(data.price),
      volume: Number(data.volume)
    }));
    
    await db.marketData.bulkAdd(processedData);
  } catch (error) {
    console.error('Failed to add market data batch:', error);
    throw new Error('Failed to add market data batch to database');
  }
}

export async function getMarketDataBySymbol(
  symbol: string,
  startTime?: number,
  endTime?: number
): Promise<MarketData[]> {
  try {
    let query = db.marketData.where('symbol').equals(String(symbol));
    
    if (startTime !== undefined || endTime !== undefined) {
      query = query.filter(data => {
        if (startTime !== undefined && data.timestamp < startTime) return false;
        if (endTime !== undefined && data.timestamp > endTime) return false;
        return true;
      });
    }
    
    return await query.toArray();
  } catch (error) {
    console.error('Failed to get market data:', error);
    throw new Error('Failed to retrieve market data from database');
  }
}

export async function getLatestMarketData(symbol: string): Promise<MarketData | undefined> {
  try {
    return await db.marketData
      .where('symbol')
      .equals(String(symbol))
      .reverse()
      .first();
  } catch (error) {
    console.error('Failed to get latest market data:', error);
    throw new Error('Failed to retrieve latest market data from database');
  }
}

export async function deleteMarketData(symbol: string): Promise<void> {
  try {
    await db.marketData
      .where('symbol')
      .equals(String(symbol))
      .delete();
  } catch (error) {
    console.error('Failed to delete market data:', error);
    throw new Error('Failed to delete market data from database');
  }
}