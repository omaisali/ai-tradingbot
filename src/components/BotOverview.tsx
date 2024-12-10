import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, differenceInDays } from 'date-fns';
import { Brain, TrendingUp, Clock, Award, Activity, BarChart2 } from 'lucide-react';
import { db } from '../db/database';

interface LearningProgress {
  dataCollection: number;
  patternRecognition: number;
  featureExtraction: number;
  modelOptimization: number;
  strategyRefinement: number;
  riskManagement: number;
}

export function BotOverview() {
  const marketData = useLiveQuery(() => db.marketData.orderBy('timestamp').toArray());
  const trades = useLiveQuery(() => db.trades.orderBy('timestamp').toArray());
  
  if (!marketData) return null;

  const firstDataPoint = marketData[0]?.timestamp;
  const latestDataPoint = marketData[marketData.length - 1]?.timestamp;
  const daysActive = firstDataPoint ? differenceInDays(new Date(), firstDataPoint) : 0;

  // Calculate real statistics
  const stats = {
    totalDataPoints: marketData.length,
    averageDailyTrades: Math.round(marketData.length / (daysActive || 1)),
    dataAge: firstDataPoint ? format(firstDataPoint, 'MMM d, yyyy') : 'N/A',
    latestUpdate: latestDataPoint ? format(latestDataPoint, 'MMM d, yyyy HH:mm') : 'N/A'
  };

  // Calculate learning progress based on real data
  const calculateLearningProgress = (): LearningProgress => {
    const totalExpectedData = daysActive * 24 * 60; // Data points per minute
    const dataCollectionProgress = Math.min((marketData.length / totalExpectedData) * 100, 100);

    // Pattern recognition progress based on analyzed data points
    const analyzedDataPoints = marketData.filter(data => data.volume > 0).length;
    const patternRecognitionProgress = (analyzedDataPoints / marketData.length) * 100;

    // Feature extraction based on technical indicators
    const withIndicators = marketData.filter((_, index) => index >= 50).length; // Need 50 points for indicators
    const featureExtractionProgress = (withIndicators / marketData.length) * 100;

    // Model optimization based on successful trades
    const successfulTrades = trades?.filter(trade => trade.successful).length || 0;
    const totalTrades = trades?.length || 0;
    const modelOptimizationProgress = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;

    // Strategy refinement based on profit factor
    const profitFactor = calculateProfitFactor(trades);
    const strategyRefinementProgress = Math.min((profitFactor / 2) * 100, 100); // Target profit factor of 2

    // Risk management based on maximum drawdown
    const maxDrawdown = calculateMaxDrawdown(marketData);
    const riskManagementProgress = Math.max(100 - (maxDrawdown * 100), 0); // Lower drawdown = better risk management

    return {
      dataCollection: Math.round(dataCollectionProgress),
      patternRecognition: Math.round(patternRecognitionProgress),
      featureExtraction: Math.round(featureExtractionProgress),
      modelOptimization: Math.round(modelOptimizationProgress),
      strategyRefinement: Math.round(strategyRefinementProgress),
      riskManagement: Math.round(riskManagementProgress)
    };
  };

  const progress = calculateLearningProgress();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 theme-transition">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bot Statistics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 theme-transition">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Age & Activity</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{daysActive}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">First Data Point</div>
                <div className="text-gray-900 dark:text-white">{stats.dataAge}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 theme-transition">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <Activity className="w-5 h-5" />
              <span className="font-medium">Trading Activity</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Data Points</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDataPoints.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Daily Trades</div>
                <div className="text-gray-900 dark:text-white">
                  {stats.averageDailyTrades.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 theme-transition">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Learning Progress</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(
                    (progress.dataCollection +
                    progress.patternRecognition +
                    progress.featureExtraction +
                    progress.modelOptimization +
                    progress.strategyRefinement +
                    progress.riskManagement) / 6
                  )}%
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.round(
                      (progress.dataCollection +
                      progress.patternRecognition +
                      progress.featureExtraction +
                      progress.modelOptimization +
                      progress.strategyRefinement +
                      progress.riskManagement) / 6
                    )}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 theme-transition">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-medium">Latest Activity</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Last Update</div>
                <div className="text-gray-900 dark:text-white">{stats.latestUpdate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                <div className="flex items-center gap-1 text-green-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 theme-transition">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Learning Progress</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                Historical Data
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Data Collection</span>
                  <span className="text-gray-900 dark:text-white">{progress.dataCollection}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.dataCollection}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Pattern Recognition</span>
                  <span className="text-gray-900 dark:text-white">{progress.patternRecognition}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.patternRecognition}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI Model Training
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Feature Extraction</span>
                  <span className="text-gray-900 dark:text-white">{progress.featureExtraction}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.featureExtraction}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Model Optimization</span>
                  <span className="text-gray-900 dark:text-white">{progress.modelOptimization}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.modelOptimization}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Trading Performance
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Strategy Refinement</span>
                  <span className="text-gray-900 dark:text-white">{progress.strategyRefinement}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.strategyRefinement}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Risk Management</span>
                  <span className="text-gray-900 dark:text-white">{progress.riskManagement}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.riskManagement}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Calculate profit factor from trades
function calculateProfitFactor(trades?: Trade[]): number {
  if (!trades || trades.length === 0) return 0;

  let totalProfit = 0;
  let totalLoss = 0;

  trades.forEach(trade => {
    const profit = trade.price * trade.amount * (trade.type === 'SELL' ? 1 : -1);
    if (profit > 0) {
      totalProfit += profit;
    } else {
      totalLoss += Math.abs(profit);
    }
  });

  return totalLoss > 0 ? totalProfit / totalLoss : 0;
}

// Calculate maximum drawdown from market data
function calculateMaxDrawdown(marketData: MarketData[]): number {
  let maxPrice = -Infinity;
  let maxDrawdown = 0;

  marketData.forEach(data => {
    if (data.price > maxPrice) {
      maxPrice = data.price;
    }
    const drawdown = (maxPrice - data.price) / maxPrice;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  return maxDrawdown;
}