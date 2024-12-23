import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { ConfigurationPanel } from '../ConfigurationPanel';
import { ProcessVisualization } from '../ProcessVisualization';
import { MarketDataVisualization } from '../MarketDataVisualization';
import { TechnicalAnalysisPanel } from '../TechnicalAnalysisPanel';
import { BotOverview } from '../BotOverview';
import { Layout } from '../Layout';
import { OpenAIPrompt } from '../OpenAIPrompt';
import { useTradingDashboard } from './context';

export function TradingDashboardView() {
  const { config, isValid, updateConfig } = useConfig();
  const {
    activeTab,
    setActiveTab,
    botState,
    showOpenAIPrompt,
    setShowOpenAIPrompt,
    dbError,
    isLoading,
    analysis,
    marketData,
    marketError,
    aiError,
    isAnalyzing,
    performance
  } = useTradingDashboard();

  if (dbError) {
    return (
      <Layout currentTab={activeTab} onTabChange={setActiveTab}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <span className="text-lg">{dbError}</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isValid) {
    return (
      <Layout currentTab={activeTab} onTabChange={setActiveTab}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="w-6 h-6" />
            <span className="text-lg">Please configure your Binance API keys to start trading</span>
          </div>
          <ConfigurationPanel config={config} onSave={updateConfig} />
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout currentTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      {showOpenAIPrompt && (
        <OpenAIPrompt
          onSubmit={(apiKey) => {
            updateConfig({ ...config, openaiApiKey: apiKey });
            setShowOpenAIPrompt(false);
          }}
        />
      )}
    </Layout>
  );

  function renderContent() {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <ProcessVisualization state={botState} />
            <BotOverview />
            <MarketDataVisualization compact />
          </div>
        );
      case 'market':
        return <MarketDataVisualization />;
      case 'analysis':
        return (
          <div className="space-y-8">
            <TechnicalAnalysisPanel 
              analysis={analysis} 
              isLoading={isAnalyzing}
              error={aiError}
              performance={performance}
            />
            {marketError && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{marketError}</p>
              </div>
            )}
          </div>
        );
      case 'settings':
        return <ConfigurationPanel config={config} onSave={updateConfig} />;
      default:
        return null;
    }
  }
}