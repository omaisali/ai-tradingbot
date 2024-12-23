import { db } from '../database';
import type { MarketData } from '../schema/marketData';
import { validateMarketData } from '../validators/marketData';
import { DatabaseError } from '../errors/ValidationError';

export async function addMarketData(data: Omit<MarketData, 'id'>): Promise<number> {
  try {
    const validated = validateMarketData(data);
    return await db.marketData.add(validated);
  } catch (error) {
    throw new DatabaseError('Failed to add market data', error as Error);
  }
}

export async function getMarketDataBySymbol(
  symbol: string,
  startTime?: number,
  endTime?: number
): Promise<MarketData[]> {
  try {
    let query = db.marketData.where('symbol').equals(symbol.toUpperCase());
    
    if (startTime || endTime) {
      query = query.filter(data => {
        if (startTime && data.timestamp < startTime) return false;
        if (endTime && data.timestamp > endTime) return false;
        return true;
      });
    }
    
    return await query.toArray();
  } catch (error) {
    throw new DatabaseError('Failed to retrieve market data', error as Error);
  }
}