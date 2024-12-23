export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(`Validation Error: ${message}`);
    this.name = 'ValidationError';
  }
}

export class InitializationError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(`Database Initialization Error: ${message}`, cause);
    this.name = 'InitializationError';
  }
}