import { EventEmitter } from 'events';
import { createMockBinanceClient } from '../../services/market/mock/client';
import type { MarketDataResponse } from '../../services/market/types';
import { subYears } from 'date-fns';

const MOCK_API_KEY = 'mock_api_key_1234567890';
const MOCK_SECRET_KEY = 'mock_secret_key_1234567890';
const YEARS_TO_FETCH = 10;

class MarketService {
  private client;
  private isRunning = false;
  private events = new EventEmitter();
  private historicalDataProgress = 0;
  private currentYear = 0;
  private currentMonth = 0;

  constructor() {
    this.client = createMockBinanceClient(MOCK_API_KEY, MOCK_SECRET_KEY);
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Start with historical data
    await this.fetchHistoricalData();
    
    // Then start real-time updates
    this.startUpdates();
  }

  private async fetchHistoricalData() {
    const endDate = new Date();
    const startDate = subYears(endDate, YEARS_TO_FETCH);
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      this.currentYear = currentDate.getFullYear();
      this.currentMonth = currentDate.getMonth() + 1;

      try {
        const candles = await this.client.candles({
          symbol: 'BTCUSDT',
          interval: '1h',
          startTime: currentDate.getTime(),
          endTime: currentDate.getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Calculate progress
        const progress = ((currentDate.getTime() - startDate.getTime()) / 
                         (endDate.getTime() - startDate.getTime())) * 100;
        this.historicalDataProgress = Math.min(100, progress);

        // Emit progress
        this.events.emit('historical-progress', {
          year: this.currentYear,
          month: this.currentMonth,
          progress: this.historicalDataProgress
        });

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      } catch (error) {
        console.error('Historical data fetch error:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private startUpdates() {
    const UPDATE_INTERVAL = 5000;

    const update = async () => {
      if (!this.isRunning) return;

      try {
        const [ticker, trades] = await Promise.all([
          this.client.prices({ symbol: 'BTCUSDT' }),
          this.client.trades({ symbol: 'BTCUSDT', limit: 1 })
        ]);

        const data: MarketDataResponse = {
          symbol: 'BTCUSDT',
          price: parseFloat(ticker['BTCUSDT']),
          volume: trades[0]?.quantity ? parseFloat(trades[0].quantity) : 0,
          timestamp: Date.now()
        };

        this.events.emit('market-update', data);
      } catch (error) {
        console.error('Market update failed:', error);
        this.events.emit('error', error);
      }

      setTimeout(update, UPDATE_INTERVAL);
    };

    update();
  }

  stop() {
    this.isRunning = false;
  }

  subscribe(callback: (data: MarketDataResponse) => void) {
    this.events.on('market-update', callback);
    return () => this.events.off('market-update', callback);
  }

  subscribeToProgress(callback: (progress: any) => void) {
    this.events.on('historical-progress', callback);
    return () => this.events.off('historical-progress', callback);
  }

  async getDataStatus() {
    return {
      historicalProgress: this.historicalDataProgress,
      currentYear: this.currentYear,
      currentMonth: this.currentMonth,
      isRunning: this.isRunning
    };
  }
}

export const marketService = new MarketService();