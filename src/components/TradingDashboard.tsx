import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { initializeDatabase } from '../db/initDatabase';
import { useConfig } from '../hooks/useConfig';
import { ConfigurationPanel } from './ConfigurationPanel';
import { ProcessVisualization } from './ProcessVisualization';
import { MarketDataVisualization } from './MarketDataVisualization';
import { TechnicalAnalysisPanel } from './TechnicalAnalysisPanel';
import { BotOverview } from './BotOverview';
import { Layout } from './Layout';
import { BotState } from '../types/config';
import { OpenAIPrompt } from './OpenAIPrompt';
import { fetchMarketData, processMarketTrends, type AnalysisResult } from '../services/binanceService';

export function TradingDashboard() {
  const { config, isValid, hasOpenAI, updateConfig } = useConfig();
  const [activeTab, setActiveTab] = useState('overview');
  const [botState, setBotState] = React.useState<BotState>({
    status: 'idle',
    currentStep: '',
    progress: 0
  });
  const [showOpenAIPrompt, setShowOpenAIPrompt] = React.useState(false);
  const [analysisResults, setAnalysisResults] = React.useState<AnalysisResult[]>([]);
  const [dbError, setDbError] = React.useState<string | null>(null);

  const recentTrades = useLiveQuery(
    () => db.trades.orderBy('timestamp').reverse().limit(5).toArray()
  );

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        setDbError('Failed to initialize database. Please refresh the page.');
        console.error('Database initialization error:', error);
      }
    };

    setupDatabase();
  }, []);

  useEffect(() => {
    if (!isValid || dbError) return;

    const runBot = async () => {
      setBotState({
        status: 'fetching',
        currentStep: 'Initializing historical data fetch...',
        progress: 0
      });

      try {
        const results = await processMarketTrends((progress, step, historyProgress) => {
          setBotState({
            status: 'fetching',
            currentStep: step,
            progress: progress,
            historyProgress
          });
        });

        setAnalysisResults(results);

        const interval = setInterval(async () => {
          await fetchMarketData('BTC/USDT');
        }, 5000);

        if (!hasOpenAI) {
          setBotState({
            status: 'analyzing',
            currentStep: 'OpenAI API key required for analysis',
            progress: 0
          });
          setShowOpenAIPrompt(true);
        } else {
          setBotState({
            status: 'analyzing',
            currentStep: 'AI analyzing patterns...',
            progress: 30
          });
        }

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Bot runtime error:', error);
        setBotState({
          status: 'idle',
          currentStep: 'Error: Failed to process market data',
          progress: 0,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    };

    runBot();
  }, [isValid, hasOpenAI, dbError]);

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

  const renderContent = () => {
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
        return <TechnicalAnalysisPanel analysis={analysisResults[analysisResults.length - 1]} />;
      case 'settings':
        return <ConfigurationPanel config={config} onSave={updateConfig} />;
      default:
        return null;
    }
  };

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
}