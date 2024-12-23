import { ENV } from '../../config/environment';
import { RateLimiter } from '../utils/rateLimiter';

const rateLimiter = new RateLimiter(ENV.BINANCE_API.RATE_LIMIT.MAX_REQUESTS_PER_MINUTE);

export class BinanceClient {
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey: string, secretKey: string) {
    this.baseUrl = ENV.BINANCE_API.BASE_URL;
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async fetchHistoricalData(symbol: string, interval: string, startTime: number, endTime: number) {
    await rateLimiter.waitForToken();

    const url = new URL(`${this.baseUrl}/klines`);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('interval', interval);
    url.searchParams.append('startTime', startTime.toString());
    url.searchParams.append('endTime', endTime.toString());
    url.searchParams.append('limit', '1000');

    const response = await fetch(url.toString(), {
      headers: {
        'X-MBX-APIKEY': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }

    return response.json();
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await rateLimiter.waitForToken();
      
      const response = await fetch(`${this.baseUrl}/account`, {
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}