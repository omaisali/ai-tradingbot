import React from 'react';
import { TrendingUp, Activity, BarChart2, RefreshCw } from 'lucide-react';
import { PerformanceMetrics } from './PerformanceMetrics';
import type { AIAnalysisResponse } from '../services/ai/types';

interface TechnicalAnalysisPanelProps {
  analysis?: AIAnalysisResponse | null;
  isLoading?: boolean;
  error?: string | null;
  performance?: {
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    successfulTrades: number;
  };
}

export function TechnicalAnalysisPanel({ 
  analysis, 
  isLoading,
  error,
  performance = {
    winRate: 0,
    profitFactor: 1,
    totalTrades: 0,
    successfulTrades: 0
  }
}: TechnicalAnalysisPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 theme-transition">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold dark:text-white">Technical Analysis</h2>
        </div>
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 theme-transition">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-semibold dark:text-white">Technical Analysis</h2>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 theme-transition">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold dark:text-white">Technical Analysis</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Waiting for analysis results...
        </p>
      </div>
    );
  }

  const { recommendation, confidence, reasoning, risks, supportLevels, resistanceLevels } = analysis;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow theme-transition">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold dark:text-white">Technical Analysis</h2>
            </div>
            <div className={`px-4 py-2 rounded-full font-medium ${
              recommendation === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              recommendation === 'SELL' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            }`}>
              {recommendation} ({confidence}% Confidence)
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{reasoning}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              Key Levels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Support Levels
                </h4>
                <div className="space-y-2">
                  {supportLevels.map((level, index) => (
                    <div key={index} className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded">
                      <span className="text-green-700 dark:text-green-400">
                        ${level.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Resistance Levels
                </h4>
                <div className="space-y-2">
                  {resistanceLevels.map((level, index) => (
                    <div key={index} className="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded">
                      <span className="text-red-700 dark:text-red-400">
                        ${level.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {risks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium dark:text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-500" />
                Key Risks
              </h3>
              <ul className="space-y-2">
                {risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-600 dark:text-gray-300">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <PerformanceMetrics {...performance} />
    </div>
  );
}