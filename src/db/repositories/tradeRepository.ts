import { db } from '../database';
import type { Trade } from '../schema';

export async function addTrade(trade: Omit<Trade, 'id'>): Promise<number> {
  return await db.trades.add({
    ...trade,
    timestamp: trade.timestamp instanceof Date ? trade.timestamp.getTime() : trade.timestamp
  });
}

export async function getTradesBySymbol(symbol: string): Promise<Trade[]> {
  return await db.trades
    .where('symbol')
    .equals(symbol)
    .toArray();
}

export async function getRecentTrades(limit: number = 10): Promise<Trade[]> {
  return await db.trades
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function deleteTrade(id: number): Promise<void> {
  await db.trades.delete(id);
}