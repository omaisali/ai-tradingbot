import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { LineChart, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { marketDataRepository } from '../db/repositories/marketDataRepository';
import { TradingViewChart } from './TradingViewChart';
import type { MarketData } from '../db/types/marketData';

interface MarketDataVisualizationProps {
  compact?: boolean;
}

export function MarketDataVisualization({ compact = false }: MarketDataVisualizationProps) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get last 10 years of data
        const endDate = new Date();
        const startDate = new Date(endDate.getFullYear() - 10, endDate.getMonth(), endDate.getDate());
        
        const data = await marketDataRepository.getBySymbol(
          'BTC/USDT',
          startDate.getTime(),
          endDate.getTime()
        );

        // Sort data by timestamp in ascending order
        const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
        setMarketData(sortedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load market data:', error);
        setError('Failed to load market data');
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold dark:text-white">Market Data</h2>
        </div>
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold dark:text-white">Market Data</h2>
        </div>
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!marketData.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold dark:text-white">Market Data</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400">No market data available yet...</p>
      </div>
    );
  }

  const latestData = marketData[marketData.length - 1];
  const previousData = marketData[marketData.length - 2] || latestData;
  const priceChange = ((latestData.price - previousData.price) / previousData.price) * 100;
  const volume24h = marketData
    .slice(-24)
    .reduce((sum, data) => sum + data.volume, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold dark:text-white">BTC/USDT</h2>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
            {priceChange >= 0 ? (
              <ArrowUpCircle className="w-5 h-5 text-green-500" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
            <p className="text-xl font-bold dark:text-white">${latestData.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
            <div className="flex items-center gap-1">
              <Wallet className="w-4 h-4 text-gray-400" />
              <p className="text-xl font-bold dark:text-white">
                ${(volume24h / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${compact ? 'h-[300px]' : 'h-[500px]'} mb-6`}>
        <TradingViewChart 
          data={marketData.map(d => ({
            symbol: d.symbol,
            price: d.price,
            volume: d.volume,
            timestamp: d.timestamp
          }))}
          height={compact ? 300 : 500}
        />
      </div>

      {!compact && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="pb-2 text-gray-600 dark:text-gray-400 font-medium">Time</th>
                <th className="pb-2 text-gray-600 dark:text-gray-400 font-medium">Price</th>
                <th className="pb-2 text-gray-600 dark:text-gray-400 font-medium">Volume</th>
                <th className="pb-2 text-gray-600 dark:text-gray-400 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {marketData.slice(-10).reverse().map((data, index, arr) => {
                const prevData = arr[index + 1] || data;
                const change = ((data.price - prevData.price) / prevData.price) * 100;
                return (
                  <tr key={data.timestamp} className="border-b dark:border-gray-700">
                    <td className="py-3 text-gray-900 dark:text-gray-300">
                      {format(data.timestamp, 'HH:mm:ss')}
                    </td>
                    <td className="py-3 font-medium text-gray-900 dark:text-gray-300">
                      ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-gray-900 dark:text-gray-300">
                      ${(data.volume / 1000).toFixed(1)}K
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 ${
                        change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {change >= 0 ? (
                          <ArrowUpCircle className="w-4 h-4" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4" />
                        )}
                        {Math.abs(change).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}