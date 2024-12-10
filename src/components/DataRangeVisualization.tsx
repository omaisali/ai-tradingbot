import React from 'react';
import { format } from 'date-fns';
import { Database, Calendar, Loader2 } from 'lucide-react';

interface DataRangeVisualizationProps {
  startDate: Date;
  endDate: Date;
  existingRanges: Array<{ start: Date; end: Date }>;
  fetchingRanges?: Array<{ start: Date; end: Date; progress: number }>;
}

export function DataRangeVisualization({
  startDate,
  endDate,
  existingRanges,
  fetchingRanges = []
}: DataRangeVisualizationProps) {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const getPositionPercentage = (date: Date) => {
    return ((date.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 theme-transition">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Market Data Coverage</h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(startDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(endDate, 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* Existing data ranges */}
          {existingRanges.map((range, index) => {
            const start = getPositionPercentage(range.start);
            const end = getPositionPercentage(range.end);
            const width = end - start;
            
            return (
              <div
                key={`existing-${index}`}
                className="absolute h-full bg-green-500 dark:bg-green-600"
                style={{
                  left: `${start}%`,
                  width: `${width}%`
                }}
              />
            );
          })}

          {/* Currently fetching ranges */}
          {fetchingRanges.map((range, index) => {
            const start = getPositionPercentage(range.start);
            const end = getPositionPercentage(range.end);
            const width = end - start;
            
            return (
              <div
                key={`fetching-${index}`}
                className="absolute h-full"
                style={{
                  left: `${start}%`,
                  width: `${width}%`
                }}
              >
                <div
                  className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-300"
                  style={{ width: `${range.progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Available Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Fetching Data</span>
            </div>
          </div>
          
          <div className="space-y-2 text-right">
            <div className="text-gray-900 dark:text-white">
              {existingRanges.reduce((total, range) => {
                return total + Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
              }, 0)} days
            </div>
            <div className="text-gray-900 dark:text-white">
              {fetchingRanges.reduce((total, range) => {
                return total + Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
              }, 0)} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}