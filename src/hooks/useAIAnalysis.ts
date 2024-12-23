import { useState, useEffect } from 'react';
import { aiAnalysisManager } from '../services/ai/service/analysisManager';
import type { AIAnalysisResponse } from '../services/ai/types';
import type { MarketDataResponse } from '../services/market/types';

export function useAIAnalysis(marketData: MarketDataResponse | null) {
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!marketData || !aiAnalysisManager.isReady()) return;

    const performAnalysis = async () => {
      try {
        setIsAnalyzing(true);
        setError(null);
        const result = await aiAnalysisManager.analyze(marketData);
        setAnalysis(result);
      } catch (err) {
        console.error('AI analysis failed:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsAnalyzing(false);
      }
    };

    performAnalysis();

    const interval = setInterval(performAnalysis, 30000);
    return () => clearInterval(interval);
  }, [marketData]);

  return {
    analysis,
    error,
    isAnalyzing
  };
}