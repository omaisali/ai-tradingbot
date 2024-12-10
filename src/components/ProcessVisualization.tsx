import React from 'react';
import { Activity, Brain, LineChart, Loader2, Calendar, CheckCircle } from 'lucide-react';
import { BotState } from '../types/config';
import { DataRangeVisualization } from './DataRangeVisualization';
import type { HistoricalDataProgress } from '../services/binanceService';
import { subYears } from 'date-fns';

interface ProcessVisualizationProps {
  state: BotState;
}

export function ProcessVisualization({ state }: ProcessVisualizationProps) {
  const steps = [
    { 
      id: 'fetching', 
      icon: LineChart, 
      label: 'Market Data',
      description: 'Fetching and processing historical market data'
    },
    { 
      id: 'analyzing', 
      icon: Brain, 
      label: 'AI Analysis',
      description: 'Analyzing patterns and market conditions'
    },
    { 
      id: 'trading', 
      icon: Activity, 
      label: 'Trading',
      description: 'Executing trades based on analysis'
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === state.status);
  };

  const renderHistoricalProgress = (details?: HistoricalDataProgress) => {
    if (!details) return null;

    const startDate = subYears(new Date(), 5);
    const endDate = new Date();

    // Simulate existing and fetching ranges based on progress
    const existingRanges = [];
    const fetchingRanges = [];

    if (details.progress > 0) {
      const progressDate = new Date(startDate);
      progressDate.setFullYear(details.year);
      progressDate.setMonth(details.month - 1);

      // Add fetching range for current progress
      fetchingRanges.push({
        start: progressDate,
        end: new Date(progressDate.getTime() + 24 * 60 * 60 * 1000),
        progress: details.progress
      });

      // Add existing range for completed data
      if (progressDate > startDate) {
        existingRanges.push({
          start: startDate,
          end: progressDate
        });
      }
    }

    return (
      <div className="mt-4">
        <DataRangeVisualization
          startDate={startDate}
          endDate={endDate}
          existingRanges={existingRanges}
          fetchingRanges={fetchingRanges}
        />
      </div>
    );
  };

  return (
    <div className="col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === state.status;
        const isPast = getCurrentStepIndex() > index;
        const status = isActive ? 'active' : isPast ? 'completed' : 'pending';
        
        return (
          <div
            key={step.id}
            className={`
              relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6
              ${isActive ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
              theme-transition
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                ${status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
                  status === 'active' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 process-step-active' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}
                theme-transition
              `}>
                {status === 'completed' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : isActive ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className={`
                  font-semibold text-lg mb-1
                  ${status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-500 dark:text-gray-400'}
                  theme-transition
                `}>
                  {step.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 theme-transition">
                  {step.description}
                </p>
                
                {isActive && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {state.currentStep}
                    </div>
                    
                    {state.progress > 0 && (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${state.progress}%` }}
                          />
                        </div>
                        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                          {state.progress.toFixed(1)}%
                        </div>
                      </div>
                    )}
                    
                    {renderHistoricalProgress(state.historyProgress)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}