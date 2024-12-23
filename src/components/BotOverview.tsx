import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Brain, TrendingUp, Clock, Award, Activity, BarChart2 } from 'lucide-react';
import { marketDataRepository } from '../db/repositories/marketDataRepository';
import { tradeRepository } from '../db/repositories/tradeRepository';
import type { MarketData } from '../db/types/marketData';
import type { Trade } from '../db/types/trade';

interface LearningProgress {
  dataCollection: number;
  patternRecognition: number;
  featureExtraction: number;
  modelOptimization: number;
  strategyRefinement: number;
  riskManagement: number;
}

export function BotOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataStats, setDataStats] = useState({
    totalRecords: 0,
    daysOfData: 0,
    firstDate: new Date(),
    lastDate: new Date(),
    dataCompleteness: 0
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [marketDataResult, tradesResult] = await Promise.all([
          marketDataRepository.getBySymbol('BTC/USDT'),
          tradeRepository.getRecentTrades()
        ]);

        // Sort data by timestamp
        const sortedData = [...marketDataResult].sort((a, b) => a.timestamp - b.timestamp);
        
        if (sortedData.length > 0) {
          const firstDate = new Date(sortedData[0].timestamp);
          const lastDate = new Date(sortedData[sortedData.length - 1].timestamp);
          const daysOfData = differenceInDays(lastDate, firstDate);
          
          // Calculate data completeness
          const expectedRecords = daysOfData * 24 * 60; // One record per minute
          const dataCompleteness = Math.min((sortedData.length / expectedRecords) * 100, 100);

          setDataStats({
            totalRecords: sortedData.length,
            daysOfData,
            firstDate,
            lastDate,
            dataCompleteness
          });
        }

        setMarketData(sortedData);
        setTrades(tradesResult);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load trading data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const calculateLearningProgress = (): LearningProgress => {
    // Data collection progress based on actual data
    const dataCollectionProgress = dataStats.dataCompleteness;

    // Pattern recognition progress based on analyzed data points
    const analyzedDataPoints = marketData.filter(data => data.optimizedParameters).length;
    const patternRecognitionProgress = (analyzedDataPoints / marketData.length) * 100;

    // Feature extraction based on technical indicators
    const withIndicators = marketData.filter(data => data.optimizedParameters?.rsiPeriod).length;
    const featureExtractionProgress = (withIndicators / marketData.length) * 100;

    // Model optimization based on successful trades
    const successfulTrades = trades?.filter(trade => trade.successful).length || 0;
    const totalTrades = trades?.length || 0;
    const modelOptimizationProgress = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;

    // Strategy refinement based on profit factor
    const profitFactor = calculateProfitFactor(trades);
    const strategyRefinementProgress = Math.min((profitFactor / 2) * 100, 100);

    // Risk management based on maximum drawdown
    const maxDrawdown = calculateMaxDrawdown(marketData);
    const riskManagementProgress = Math.max(100 - (maxDrawdown * 100), 0);

    return {
      dataCollection: Math.round(dataCollectionProgress),
      patternRecognition: Math.round(patternRecognitionProgress),
      featureExtraction: Math.round(featureExtractionProgress),
      modelOptimization: Math.round(modelOptimizationProgress),
      strategyRefinement: Math.round(strategyRefinementProgress),
      riskManagement: Math.round(riskManagementProgress)
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-600 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  const progress = calculateLearningProgress();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 theme-transition">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Learning Progress</h2>
        </div>

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
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {dataStats.totalRecords.toLocaleString()} records over {dataStats.daysOfData} days
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

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Data Range</div>
              <div className="text-gray-900 dark:text-white">
                {format(dataStats.firstDate, 'MMM d, yyyy')} - {format(dataStats.lastDate, 'MMM d, yyyy')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Records</div>
              <div className="text-gray-900 dark:text-white">{dataStats.totalRecords.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Data Completeness</div>
              <div className="text-gray-900 dark:text-white">{Math.round(dataStats.dataCompleteness)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Last Update</div>
              <div className="text-gray-900 dark:text-white">
                {format(dataStats.lastDate, 'HH:mm:ss')}
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