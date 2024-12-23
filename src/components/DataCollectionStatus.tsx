import React from 'react';
import { Database, Loader2 } from 'lucide-react';

interface DataCollectionStatusProps {
  progress: number;
  currentYear?: number;
  currentMonth?: number;
}

export function DataCollectionStatus({ progress, currentYear, currentMonth }: DataCollectionStatusProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold dark:text-white">Data Collection in Progress</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">
            {currentYear && currentMonth 
              ? `Collecting data for ${currentYear}/${String(currentMonth).padStart(2, '0')}`
              : 'Initializing data collection...'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we collect historical market data. This may take several minutes.
        </p>
      </div>
    </div>
  );
}