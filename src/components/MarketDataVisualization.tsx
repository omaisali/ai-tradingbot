import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { db } from '../db/database';
import { LineChart, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { PriceChart } from './PriceChart';

interface MarketDataVisualizationProps {
  compact?: boolean;
}

export function MarketDataVisualization({ compact = false }: MarketDataVisualizationProps) {
  const marketData = useLiveQuery(
    () => db.marketData.orderBy('timestamp').reverse().limit(100).toArray()
  );

  if (!marketData || marketData.length === 0) {
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

  const latestPrice = marketData[0].price;
  const previousPrice = marketData[1]?.price ?? latestPrice;
  const priceChange = ((latestPrice - previousPrice) / previousPrice) * 100;
  const isPositive = priceChange >= 0;
  const volume24h = marketData.slice(0, 24).reduce((sum, data) => sum + data.volume, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold dark:text-white">BTC/USDT</h2>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
            {isPositive ? (
              <ArrowUpCircle className="w-5 h-5 text-green-500" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
            <p className="text-xl font-bold dark:text-white">${latestPrice.toLocaleString()}</p>
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
        <PriceChart data={marketData} />
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
              {marketData.slice(0, 10).map((data, index) => {
                const prevPrice = marketData[index + 1]?.price ?? data.price;
                const change = ((data.price - prevPrice) / prevPrice) * 100;
                return (
                  <tr key={data.id} className="border-b dark:border-gray-700">
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