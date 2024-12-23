import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { useMarketInitialization } from '../../hooks/useMarketInitialization';
import { useMarketService } from '../../hooks/useMarketService';
import { ConfigurationPanel } from '../ConfigurationPanel';
import { ProcessVisualization } from '../ProcessVisualization';
import { DataCollectionStatus } from '../DataCollectionStatus';
import { Layout } from '../Layout';
import { useTradingDashboard } from './context';

export function TradingDashboardView() {
  const { activeTab, setActiveTab } = useTradingDashboard();
  const { config, isValid, updateConfig } = useConfig();
  const { isInitializing, error, marketStatus } = useMarketInitialization();
  const { historyProgress } = useMarketService();

  if (!isValid) {
    return (
      <Layout currentTab={activeTab} onTabChange={setActiveTab}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="w-6 h-6" />
            <span className="text-lg">Please configure your API keys to start trading</span>
          </div>
          <ConfigurationPanel config={config} onSave={updateConfig} />
        </div>
      </Layout>
    );
  }

  if (isInitializing) {
    return (
      <Layout currentTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentTab={activeTab} onTabChange={setActiveTab}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <span className="text-lg">{error}</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!marketStatus.hasData) {
    return (
      <Layout currentTab={activeTab} onTabChange={setActiveTab}>
        <div className="max-w-2xl mx-auto">
          <DataCollectionStatus 
            progress={historyProgress?.progress || 0}
            currentYear={historyProgress?.year}
            currentMonth={historyProgress?.month}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-8">
        <ProcessVisualization 
          state={{
            status: 'analyzing',
            currentStep: 'Processing market data...',
            progress: 100
          }} 
        />
      </div>
    </Layout>
  );
}