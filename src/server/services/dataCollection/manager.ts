import { subYears, addHours } from 'date-fns';
import { BinanceClient } from '../binance/client';
import { getDatabase } from '../database';
import { EventEmitter } from 'events';

interface CollectionProgress {
  symbol: string;
  progress: number;
  currentDate: Date;
  estimatedTimeRemaining: number;
}

export class DataCollectionManager extends EventEmitter {
  private client: BinanceClient;
  private isCollecting: boolean = false;
  private shouldPause: boolean = false;

  constructor(apiKey: string, secretKey: string) {
    super();
    this.client = new BinanceClient(apiKey, secretKey);
  }

  async startCollection(symbol: string, interval: string = '1h') {
    if (this.isCollecting) return;
    
    this.isCollecting = true;
    this.shouldPause = false;

    const endDate = new Date();
    const startDate = subYears(endDate, 10);
    let currentDate = startDate;
    const db = getDatabase();

    try {
      while (currentDate < endDate && !this.shouldPause) {
        const batchEndDate = addHours(currentDate, 24);
        const data = await this.client.fetchHistoricalData(
          symbol,
          interval,
          currentDate.getTime(),
          batchEndDate.getTime()
        );

        // Store data in database
        const stmt = db.prepare(`
          INSERT OR IGNORE INTO market_data 
          (symbol, timestamp, open, high, low, close, volume)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        data.forEach((candle: any) => {
          stmt.run([
            symbol,
            candle[0],
            parseFloat(candle[1]),
            parseFloat(candle[2]),
            parseFloat(candle[3]),
            parseFloat(candle[4]),
            parseFloat(candle[5])
          ]);
        });

        stmt.free();

        // Calculate and emit progress
        const progress = ((currentDate.getTime() - startDate.getTime()) /
          (endDate.getTime() - startDate.getTime())) * 100;
        
        const estimatedTimeRemaining = 
          ((endDate.getTime() - currentDate.getTime()) / 
           (currentDate.getTime() - startDate.getTime())) * 
          (Date.now() - startDate.getTime());

        this.emit('progress', {
          symbol,
          progress,
          currentDate,
          estimatedTimeRemaining
        } as CollectionProgress);

        currentDate = batchEndDate;
      }

      if (!this.shouldPause) {
        this.emit('complete', symbol);
      }
    } catch (error) {
      this.emit('error', error);
    } finally {
      this.isCollecting = false;
    }
  }

  pauseCollection() {
    this.shouldPause = true;
  }

  async validateCredentials(): Promise<boolean> {
    return this.client.validateCredentials();
  }
}