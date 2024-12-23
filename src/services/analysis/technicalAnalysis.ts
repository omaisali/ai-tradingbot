import type { MarketData, TechnicalIndicators } from '../market/types';
import { calculateSMA } from './indicators/sma';
import { calculateRSI } from './indicators/rsi';
import { calculateMACD } from './indicators/macd';
import { calculateBollingerBands } from './indicators/bollinger';

export function calculateIndicators(marketData: MarketData[]): TechnicalIndicators {
  const prices = marketData.map(d => d.price);
  
  return {
    sma20: calculateSMA(prices, 20),
    sma50: calculateSMA(prices, 50),
    rsi: calculateRSI(prices),
    macd: calculateMACD(prices),
    bollingerBands: calculateBollingerBands(prices)
  };
}

export function analyzeStrategyPerformance(
  marketData: MarketData[],
  indicators: TechnicalIndicators[]
): {
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  successfulTrades: number;
} {
  let totalTrades = 0;
  let successfulTrades = 0;
  let totalProfit = 0;
  let totalLoss = 0;

  // Simulate trades based on indicators
  for (let i = 1; i < indicators.length; i++) {
    const prevIndicators = indicators[i - 1];
    const currIndicators = indicators[i];
    const price = marketData[i].price;
    const prevPrice = marketData[i - 1].price;

    // Trading signals
    const macdCrossover = prevIndicators.macd.histogram < 0 && currIndicators.macd.histogram > 0;
    const rsiOversold = prevIndicators.rsi < 30 && currIndicators.rsi > 30;
    const smaCrossover = prevIndicators.sma20 < prevIndicators.sma50 && 
                        currIndicators.sma20 > currIndicators.sma50;

    // If we have a buy signal
    if (macdCrossover || rsiOversold || smaCrossover) {
      totalTrades++;
      const profit = price - prevPrice;
      
      if (profit > 0) {
        successfulTrades++;
        totalProfit += profit;
      } else {
        totalLoss += Math.abs(profit);
      }
    }
  }

  const winRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

  return {
    winRate,
    profitFactor,
    totalTrades,
    successfulTrades
  };
}