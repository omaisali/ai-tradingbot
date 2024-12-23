export class MarketError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'MarketError';
  }
}

export class ClientNotInitializedError extends MarketError {
  constructor() {
    super('Binance client not initialized. Call initializeClient first.');
  }
}

export class InvalidCredentialsError extends MarketError {
  constructor() {
    super('Invalid API credentials provided.');
  }
}

export class ClientValidationError extends MarketError {
  constructor(message: string) {
    super(`Client validation failed: ${message}`);
  }
}