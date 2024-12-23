import { ClientValidationError } from '../errors';

export function validateMockCredentials(apiKey: string, secretKey: string): void {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 20) {
    throw new ClientValidationError('Invalid API key format - must be at least 20 characters');
  }

  if (!secretKey || typeof secretKey !== 'string' || secretKey.length < 20) {
    throw new ClientValidationError('Invalid secret key format - must be at least 20 characters');
  }
}