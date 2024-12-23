import { marketDataRepository } from '../../db/repositories/marketDataRepository';
import { calculateIndicators, analyzeStrategyPerformance } from '../market/analysis';
import { analyzeMarket } from './client';
import type { AIAnalysisRequest, AIAnalysisResponse } from './types';
import type { MarketDataResponse } from '../market/types';

class AIAnalysisService {
  private apiKey: string | null = null;
  private lastAnalysis: AIAnalysisResponse | null = null;
  private lastUpdateTime = 0;
  private analysisInProgress = false;
  private readonly UPDATE_INTERVAL = 30000; // 30 seconds

  initialize(apiKey: string): void {
    this.apiKey = apiKey;
  }

  isReady(): boolean {
    return !!this.apiKey;
  }

  async analyze(marketData: MarketDataResponse): Promise<AIAnalysisResponse> {
    if (!this.apiKey) {
      throw new Error('AI service not initialized');
    }

    const now = Date.now();
    if (
      this.lastAnalysis && 
      now - this.lastUpdateTime < this.UPDATE_INTERVAL &&
      !this.analysisInProgress
    ) {
      return this.lastAnalysis;
    }

    try {
      this.analysisInProgress = true;

      // Get historical data for better analysis
      const historicalData = await marketDataRepository.getBySymbol(
        marketData.symbol,
        now - 24 * 60 * 60 * 1000, // Last 24 hours
        now
      );

      if (!historicalData.length) {
        historicalData.push({
          timestamp: marketData.timestamp || now,
          symbol: marketData.symbol,
          price: marketData.price,
          volume: marketData.volume
        });
      }

      // Calculate technical indicators
      const indicators = calculateIndicators(historicalData);
      const performance = analyzeStrategyPerformance(historicalData, [indicators]);

      // Prepare request for AI analysis
      const request: AIAnalysisRequest = {
        marketData: {
          price: marketData.price,
          volume: marketData.volume,
          timestamp: marketData.timestamp || now,
          historicalPrices: historicalData.map(d => d.price)
        },
        technicalIndicators: {
          rsi: indicators.rsi,
          macd: {
            value: indicators.macd.macd,
            signal: indicators.macd.signal,
            histogram: indicators.macd.histogram
          },
          sma: {
            short: indicators.sma20,
            long: indicators.sma50
          },
          bollingerBands: indicators.bollingerBands
        }
      };

      // Get AI analysis
      const analysis = await analyzeMarket(request);

      // Combine AI analysis with performance metrics
      const result: AIAnalysisResponse = {
        ...analysis,
        performance: {
          winRate: performance.winRate,
          profitFactor: performance.profitFactor,
          totalTrades: performance.totalTrades,
          successfulTrades: performance.successfulTrades
        }
      };

      this.lastAnalysis = result;
      this.lastUpdateTime = now;
      return result;
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    } finally {
      this.analysisInProgress = false;
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();