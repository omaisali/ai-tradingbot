// Update performance calculation to be more accurate
export function analyzeStrategyPerformance(
  marketData: MarketData[],
  indicators: TechnicalIndicators[]
): StrategyPerformance {
  let totalTrades = 0;
  let successfulTrades = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let inPosition = false;
  let entryPrice = 0;

  // Analyze trades based on indicators
  for (let i = 1; i < marketData.length; i++) {
    const price = marketData[i].price;
    const prevPrice = marketData[i - 1].price;
    const indicator = indicators[Math.min(i, indicators.length - 1)];
    const prevIndicator = indicators[Math.max(0, Math.min(i - 1, indicators.length - 1))];

    // Enhanced trading signals
    const buySignal = !inPosition && (
      (prevIndicator.rsi < 30 && indicator.rsi > 30) || // RSI oversold bounce
      (prevIndicator.macd.histogram < 0 && indicator.macd.histogram > 0) || // MACD crossover
      (prevIndicator.sma20 < prevIndicator.sma50 && indicator.sma20 > indicator.sma50) || // Golden cross
      (price < indicator.bollingerBands.lower) // Price below lower Bollinger Band
    );

    const sellSignal = inPosition && (
      (prevIndicator.rsi > 70 && indicator.rsi < 70) || // RSI overbought
      (prevIndicator.macd.histogram > 0 && indicator.macd.histogram < 0) || // MACD bearish crossover
      (prevIndicator.sma20 > prevIndicator.sma50 && indicator.sma20 < indicator.sma50) || // Death cross
      (price > indicator.bollingerBands.upper) // Price above upper Bollinger Band
    );

    // Execute trades with improved profit calculation
    if (buySignal) {
      inPosition = true;
      entryPrice = price;
      totalTrades++;
    } else if (sellSignal) {
      const profit = ((price - entryPrice) / entryPrice) * 100; // Calculate percentage profit
      if (profit > 0) {
        successfulTrades++;
        totalProfit += profit;
      } else {
        totalLoss += Math.abs(profit);
      }
      inPosition = false;
    }
  }

  // Calculate performance metrics
  const winRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
  const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss) : 1;

  return {
    winRate,
    profitFactor,
    totalTrades,
    successfulTrades
  };
}