export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class DatabaseInitializationError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(`Database initialization failed: ${message}`, cause);
    this.name = 'DatabaseInitializationError';
  }
}

export class DatabaseValidationError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(`Database validation failed: ${message}`, cause);
    this.name = 'DatabaseValidationError';
  }
}