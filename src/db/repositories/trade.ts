import { db } from '../database';
import type { Trade } from '../schema/trade';
import { validateTrade } from '../validators/trade';
import { DatabaseError } from '../errors/ValidationError';

export async function addTrade(data: Omit<Trade, 'id'>): Promise<number> {
  try {
    const validated = validateTrade(data);
    return await db.trades.add(validated);
  } catch (error) {
    throw new DatabaseError('Failed to add trade', error as Error);
  }
}

export async function getRecentTrades(limit: number = 10): Promise<Trade[]> {
  try {
    return await db.trades
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  } catch (error) {
    throw new DatabaseError('Failed to retrieve recent trades', error as Error);
  }
}