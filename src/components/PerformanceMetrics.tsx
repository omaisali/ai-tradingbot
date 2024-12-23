import React from 'react';
import { TrendingUp, DollarSign, BarChart2 } from 'lucide-react';

interface PerformanceMetricsProps {
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  successfulTrades: number;
}

export function PerformanceMetrics({
  winRate,
  profitFactor,
  totalTrades,
  successfulTrades
}: PerformanceMetricsProps) {
  const roi = (profitFactor - 1) * 100;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 theme-transition">
      <h3 className="text-lg font-medium dark:text-white flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-indigo-500" />
        Trading Performance
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            Win Rate
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {winRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {successfulTrades} of {totalTrades} trades
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            ROI
          </div>
          <div className={`text-2xl font-bold ${
            roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Profit Factor: {profitFactor.toFixed(2)}x
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <BarChart2 className="w-4 h-4" />
            Total Trades
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalTrades}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last 24 hours
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            Success Rate
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {((successfulTrades / totalTrades) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {successfulTrades} successful trades
          </div>
        </div>
      </div>
    </div>
  );
}