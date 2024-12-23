import { InvalidCredentialsError, ClientValidationError } from './errors';

export function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new InvalidCredentialsError();
  }

  if (typeof apiKey !== 'string' || apiKey.length < 10) {
    throw new ClientValidationError('Invalid API key format');
  }
}

export function validateSecretKey(secretKey: string): void {
  if (!secretKey) {
    throw new InvalidCredentialsError();
  }

  if (typeof secretKey !== 'string' || secretKey.length < 10) {
    throw new ClientValidationError('Invalid secret key format');
  }
}

export function validateCredentials(apiKey: string, secretKey: string): void {
  validateApiKey(apiKey);
  validateSecretKey(secretKey);
}