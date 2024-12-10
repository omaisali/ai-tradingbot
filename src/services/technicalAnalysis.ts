import { MarketData } from '../db/database';

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface StrategyPerformance {
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  successfulTrades: number;
}

// Calculate Simple Moving Average
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 0;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const difference = prices[prices.length - i] - prices[prices.length - i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate MACD (Moving Average Convergence Divergence)
function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([...prices.slice(0, -1), macd], 9);
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

// Calculate EMA (Exponential Moving Average)
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

// Calculate Bollinger Bands
function calculateBollingerBands(prices: number[], period: number = 20): {
  upper: number;
  middle: number;
  lower: number;
} {
  const sma = calculateSMA(prices, period);
  const standardDeviation = Math.sqrt(
    prices.slice(-period).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
  );

  return {
    upper: sma + standardDeviation * 2,
    middle: sma,
    lower: sma - standardDeviation * 2
  };
}

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
): StrategyPerformance {
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