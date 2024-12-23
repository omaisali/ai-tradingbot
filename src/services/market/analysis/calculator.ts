import type { MarketData } from '../../../db/types/marketData';
import type { TechnicalIndicators } from './indicators/types';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateSMA,
  calculateBollingerBands 
} from './indicators';

export function calculateIndicators(marketData: MarketData[]): TechnicalIndicators {
  const prices = marketData.map(d => d.price);
  
  return {
    sma20: calculateSMA({ prices, period: 20 }),
    sma50: calculateSMA({ prices, period: 50 }),
    rsi: calculateRSI({ prices }),
    macd: calculateMACD(prices),
    bollingerBands: calculateBollingerBands({ prices })
  };
}