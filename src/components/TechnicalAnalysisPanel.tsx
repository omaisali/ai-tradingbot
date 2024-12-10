import React, { useState } from 'react';
import { TrendingUp, Activity, BarChart2, RefreshCw, Clock, Zap, Database, CheckCircle } from 'lucide-react';
import type { AnalysisResult } from '../services/binanceService';
import { optimizeStrategy, type OptimizationProgress } from '../services/strategyOptimizer';
import { db } from '../db/database';
import { calculateIndicators } from '../services/technicalAnalysis';

interface TechnicalAnalysisPanelProps {
  analysis?: AnalysisResult;
}

export function TechnicalAnalysisPanel({ analysis }: TechnicalAnalysisPanelProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationState, setOptimizationState] = useState<OptimizationProgress>();

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 theme-transition">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Technical Analysis</h2>
        <p className="text-gray-500 dark:text-gray-400">Waiting for analysis results...</p>
      </div>
    );
  }

  const { indicators, performance } = analysis;
  const needsOptimization = performance.winRate < 90;

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizationState(undefined);

    try {
      const marketData = await db.marketData.orderBy('timestamp').toArray();
      const result = await optimizeStrategy(marketData, performance.winRate, (progress) => {
        setOptimizationState(progress);
      });

      // Update indicators with optimized parameters
      const latestData = marketData.slice(-50); // Use last 50 data points
      const updatedIndicators = calculateIndicators(latestData);

      // Store optimized parameters in IndexedDB
      await db.marketData.where('id').above(0).modify(data => {
        data.optimizedParameters = result.parameters;
      });

      // Update the analysis with new results
      analysis.indicators = updatedIndicators;
      analysis.performance = {
        winRate: result.winRate,
        profitFactor: result.profitFactor,
        totalTrades: performance.totalTrades,
        successfulTrades: Math.round((result.winRate / 100) * performance.totalTrades)
      };

    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const renderOptimizationProgress = () => {
    if (!optimizationState) return null;

    const stageIcons = {
      'initialization': Database,
      'parameter-tuning': Zap,
      'backtesting': RefreshCw,
      'validation': CheckCircle
    };

    const StageIcon = stageIcons[optimizationState.stage];

    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg theme-transition">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StageIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span className="font-medium capitalize dark:text-white">
              {optimizationState.stage.replace('-', ' ')}
            </span>
          </div>
          {optimizationState.estimatedTimeRemaining !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>~{optimizationState.estimatedTimeRemaining}s remaining</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${optimizationState.progress}%` }}
            />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {optimizationState.currentMetric}
          </div>

          {optimizationState.currentParameters && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Parameters
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>RSI: {optimizationState.currentParameters.rsiOversoldThreshold}</div>
                  <div>MACD Fast: {optimizationState.currentParameters.macdFastPeriod}</div>
                  <div>MACD Slow: {optimizationState.currentParameters.macdSlowPeriod}</div>
                  <div>SMA: {optimizationState.currentParameters.smaPeriods.join(', ')}</div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Best Results
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>Win Rate: {optimizationState.bestWinRate?.toFixed(2)}%</div>
                  <div>Profit Factor: {optimizationState.bestProfitFactor?.toFixed(2)}</div>
                  {optimizationState.testedCombinations !== undefined && (
                    <div>
                      Tested: {optimizationState.testedCombinations} / {optimizationState.totalCombinations}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow theme-transition">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 theme-transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold dark:text-white">Technical Analysis</h2>
          </div>
          {needsOptimization && (
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              {isOptimizing ? 'Optimizing...' : 'Optimize Strategy'}
            </button>
          )}
        </div>
        {isOptimizing && renderOptimizationProgress()}
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2 dark:text-white">
                <Activity className="w-4 h-4" />
                Indicators
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">RSI:</span>
                  <span className={`ml-2 font-medium ${
                    indicators.rsi > 70 ? 'text-red-500 dark:text-red-400' :
                    indicators.rsi < 30 ? 'text-green-500 dark:text-green-400' :
                    'text-gray-900 dark:text-gray-100'
                  }`}>
                    {indicators.rsi.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">MACD:</span>
                  <span className={`ml-2 font-medium ${
                    indicators.macd.histogram > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {indicators.macd.histogram.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">SMA Crossover:</span>
                  <span className={`ml-2 font-medium ${
                    indicators.sma20 > indicators.sma50 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {indicators.sma20 > indicators.sma50 ? 'Bullish' : 'Bearish'}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bollinger Bands:</span>
                  <div className="ml-4 text-sm text-gray-900 dark:text-gray-100">
                    <div>Upper: ${indicators.bollingerBands.upper.toFixed(2)}</div>
                    <div>Middle: ${indicators.bollingerBands.middle.toFixed(2)}</div>
                    <div>Lower: ${indicators.bollingerBands.lower.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2 dark:text-white">
                <BarChart2 className="w-4 h-4" />
                Strategy Performance
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate:</span>
                  <span className={`ml-2 font-medium ${
                    performance.winRate > 50 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {performance.winRate.toFixed(2)}%
                  </span>
                  {needsOptimization && (
                    <span className="ml-2 text-sm text-yellow-600 dark:text-yellow-500">
                      (Optimization recommended)
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Profit Factor:</span>
                  <span className={`ml-2 font-medium ${
                    performance.profitFactor > 1 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {performance.profitFactor.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Trades:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {performance.totalTrades}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Successful Trades:</span>
                  <span className="ml-2 font-medium text-green-500 dark:text-green-400">
                    {performance.successfulTrades}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}