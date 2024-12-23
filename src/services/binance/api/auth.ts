import { fetchBinanceApi } from './client';
import type { BinanceCredentials } from '../types';

export async function validateCredentials(
  credentials: BinanceCredentials
): Promise<boolean> {
  try {
    const timestamp = Date.now();
    await fetchBinanceApi('/account', {
      headers: {
        'X-MBX-APIKEY': credentials.apiKey
      }
    });
    return true;
  } catch (error) {
    console.error('Credentials validation failed:', error);
    return false;
  }
}