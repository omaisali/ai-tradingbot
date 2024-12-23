import { BinanceClient, createMockBinanceClient } from './mock';
import { validateCredentials } from './validation';
import { ClientNotInitializedError } from './errors';

let client: BinanceClient | null = null;

// Use longer mock keys for development
const DEV_API_KEY = 'development_api_key_1234567890';
const DEV_SECRET_KEY = 'development_secret_key_1234567890';

export function initializeClient(apiKey: string = DEV_API_KEY, secretKey: string = DEV_SECRET_KEY): void {
  validateCredentials(apiKey, secretKey);
  client = createMockBinanceClient(apiKey, secretKey);
}

export function getClient(): BinanceClient {
  if (!client) {
    throw new ClientNotInitializedError();
  }
  return client;
}

export async function validateClientCredentials(apiKey: string, secretKey: string): Promise<boolean> {
  try {
    validateCredentials(apiKey, secretKey);
    const tempClient = createMockBinanceClient(apiKey, secretKey);
    await tempClient.accountInfo();
    return true;
  } catch (error) {
    console.error('Credential validation failed:', error);
    return false;
  }
}