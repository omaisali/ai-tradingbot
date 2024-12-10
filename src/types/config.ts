import type { HistoricalDataProgress } from '../services/binanceService';

export interface Config {
  binanceApiKey?: string;
  binanceSecretKey?: string;
  openaiApiKey?: string;
}

export interface BotState {
  status: 'idle' | 'fetching' | 'analyzing' | 'trading';
  currentStep: string;
  progress: number;
  error?: string;
  historyProgress?: HistoricalDataProgress;
}