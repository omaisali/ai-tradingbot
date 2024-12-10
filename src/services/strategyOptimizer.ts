import { MarketData } from '../db/database';
import { TechnicalIndicators, calculateIndicators } from './technicalAnalysis';

export interface StrategyParameters {
  rsiPeriod: number;
  rsiOversoldThreshold: number;
  rsiOverboughtThreshold: number;
  macdFastPeriod: number;
  macdSlowPeriod: number;
  macdSignalPeriod: number;
  smaPeriods: [number, number];
  bollingerPeriod: number;
  bollingerStdDev: number;
}

export interface OptimizationProgress {
  stage: 'initialization' | 'parameter-tuning' | 'backtesting' | 'validation';
  progress: number;
  currentParameters?: StrategyParameters;
  bestWinRate?: number;
  bestProfitFactor?: number;
  testedCombinations?: number;
  totalCombinations?: number;
  currentMetric?: string;
  estimatedTimeRemaining?: number;
}

export interface OptimizationResult {
  parameters: StrategyParameters;
  winRate: number;
  profitFactor: number;
}

const DEFAULT_PARAMETERS: StrategyParameters = {
  rsiPeriod: 14,
  rsiOversoldThreshold: 30,
  rsiOverboughtThreshold: 70,
  macdFastPeriod: 12,
  macdSlowPeriod: 26,
  macdSignalPeriod: 9,
  smaPeriods: [20, 50],
  bollingerPeriod: 20,
  bollingerStdDev: 2
};

export async function optimizeStrategy(
  marketData: MarketData[],
  currentWinRate: number,
  onProgress: (progress: OptimizationProgress) => void
): Promise<OptimizationResult> {
  const startTime = Date.now();
  let bestResult: OptimizationResult = {
    parameters: DEFAULT_PARAMETERS,
    winRate: currentWinRate,
    profitFactor: 0
  };

  // Initialization stage
  onProgress({
    stage: 'initialization',
    progress: 0,
    currentMetric: 'Preparing optimization parameters...'
  });

  // Split data into training and validation sets
  const splitIndex = Math.floor(marketData.length * 0.8);
  const trainingData = marketData.slice(0, splitIndex);
  const validationData = marketData.slice(splitIndex);

  // Parameter ranges for optimization
  const parameterRanges = {
    rsiPeriod: range(10, 20, 2),
    rsiOversold: range(25, 35, 2),
    macdFast: range(8, 16, 2),
    macdSlow: range(20, 30, 2),
    smaShort: range(10, 30, 5),
    smaLong: range(40, 60, 5),
    bollingerPeriod: range(15, 25, 5),
    bollingerStdDev: [1.5, 2, 2.5]
  };

  const totalCombinations = calculateTotalCombinations(parameterRanges);
  let testedCombinations = 0;

  // Parameter tuning stage
  onProgress({
    stage: 'parameter-tuning',
    progress: 0,
    testedCombinations: 0,
    totalCombinations,
    currentMetric: 'Starting parameter optimization...',
    bestWinRate: currentWinRate,
    bestProfitFactor: 0
  });

  // Iterate through parameter combinations
  for (const rsiPeriod of parameterRanges.rsiPeriod) {
    for (const rsiOversold of parameterRanges.rsiOversold) {
      for (const macdFast of parameterRanges.macdFast) {
        for (const macdSlow of parameterRanges.macdSlow) {
          if (macdSlow <= macdFast) continue;

          for (const smaShort of parameterRanges.smaShort) {
            for (const smaLong of parameterRanges.smaLong) {
              if (smaLong <= smaShort) continue;

              for (const bollingerPeriod of parameterRanges.bollingerPeriod) {
                for (const bollingerStdDev of parameterRanges.bollingerStdDev) {
                  const parameters: StrategyParameters = {
                    rsiPeriod,
                    rsiOversoldThreshold: rsiOversold,
                    rsiOverboughtThreshold: 100 - rsiOversold,
                    macdFastPeriod: macdFast,
                    macdSlowPeriod: macdSlow,
                    macdSignalPeriod: 9,
                    smaPeriods: [smaShort, smaLong],
                    bollingerPeriod,
                    bollingerStdDev
                  };

                  // Test on training data first
                  const trainingResult = await testStrategy(trainingData, parameters);
                  testedCombinations++;

                  // Only validate promising strategies
                  if (trainingResult.winRate > bestResult.winRate) {
                    // Validation stage
                    onProgress({
                      stage: 'validation',
                      progress: (testedCombinations / totalCombinations) * 100,
                      currentParameters: parameters,
                      bestWinRate: trainingResult.winRate,
                      bestProfitFactor: trainingResult.profitFactor,
                      currentMetric: 'Validating promising strategy...'
                    });

                    // Test on validation data
                    const validationResult = await testStrategy(validationData, parameters);

                    // Only update if validation is also good
                    if (validationResult.winRate > bestResult.winRate) {
                      bestResult = {
                        parameters,
                        winRate: validationResult.winRate,
                        profitFactor: validationResult.profitFactor
                      };
                    }
                  }

                  // Progress update
                  onProgress({
                    stage: 'backtesting',
                    progress: (testedCombinations / totalCombinations) * 100,
                    currentParameters: parameters,
                    testedCombinations,
                    totalCombinations,
                    bestWinRate: bestResult.winRate,
                    bestProfitFactor: bestResult.profitFactor,
                    currentMetric: `Testing parameters combination ${testedCombinations}/${totalCombinations}`,
                    estimatedTimeRemaining: calculateEstimatedTime(startTime, testedCombinations, totalCombinations)
                  });

                  // Add small delay to prevent UI blocking
                  await new Promise(resolve => setTimeout(resolve, 10));
                }
              }
            }
          }
        }
      }
    }
  }

  return bestResult;
}

async function testStrategy(
  marketData: MarketData[],
  parameters: StrategyParameters
): Promise<{ winRate: number; profitFactor: number }> {
  let wins = 0;
  let losses = 0;
  let totalProfit = 0;
  let totalLoss = 0;

  const windowSize = Math.max(
    parameters.smaPeriods[1],
    parameters.rsiPeriod,
    parameters.macdSlowPeriod + parameters.macdSignalPeriod,
    parameters.bollingerPeriod
  );

  for (let i = windowSize; i < marketData.length - 1; i++) {
    const windowData = marketData.slice(i - windowSize, i + 1);
    const currentPrice = marketData[i].price;
    const nextPrice = marketData[i + 1].price;
    const indicators = calculateIndicators(windowData);

    const signal = getTradeSignal(indicators, parameters);
    
    if (signal !== 'HOLD') {
      const priceDiff = nextPrice - currentPrice;
      const isWin = (signal === 'BUY' && priceDiff > 0) || (signal === 'SELL' && priceDiff < 0);
      
      if (isWin) {
        wins++;
        totalProfit += Math.abs(priceDiff);
      } else {
        losses++;
        totalLoss += Math.abs(priceDiff);
      }
    }
  }

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

  return { winRate, profitFactor };
}

function getTradeSignal(
  indicators: TechnicalIndicators,
  parameters: StrategyParameters
): 'BUY' | 'SELL' | 'HOLD' {
  const { rsiOversoldThreshold, rsiOverboughtThreshold } = parameters;

  // RSI signals
  const rsiOversold = indicators.rsi < rsiOversoldThreshold;
  const rsiOverbought = indicators.rsi > rsiOverboughtThreshold;

  // MACD signals
  const macdBullish = indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal;
  const macdBearish = indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal;

  // SMA trend
  const smaBullish = indicators.sma20 > indicators.sma50;
  const smaBearish = indicators.sma20 < indicators.sma50;

  // Combined signals
  if (rsiOversold && macdBullish && smaBullish) {
    return 'BUY';
  } else if (rsiOverbought && macdBearish && smaBearish) {
    return 'SELL';
  }

  return 'HOLD';
}

function range(start: number, end: number, step: number): number[] {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

function calculateTotalCombinations(ranges: Record<string, number[]>): number {
  return Object.values(ranges).reduce((total, range) => total * range.length, 1);
}

function calculateEstimatedTime(
  startTime: number,
  testedCombinations: number,
  totalCombinations: number
): number {
  if (testedCombinations === 0) return 0;
  const elapsedTime = Date.now() - startTime;
  const timePerCombination = elapsedTime / testedCombinations;
  return Math.round((totalCombinations - testedCombinations) * timePerCombination / 1000);
}