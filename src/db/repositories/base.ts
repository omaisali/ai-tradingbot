import { executeTransaction } from '../core/transaction';
import type { DatabaseError } from '../errors/DatabaseError';

export abstract class BaseRepository<T> {
  protected abstract tableName: string;
  
  protected async execute<R>(
    operation: () => Promise<R>,
    errorContext: string
  ): Promise<R> {
    return executeTransaction(
      operation,
      `Error in ${this.tableName} repository: ${errorContext}`
    );
  }

  protected handleError(error: unknown, context: string): never {
    if (error instanceof Error) {
      throw new DatabaseError(
        `${this.tableName} repository error: ${context}`,
        error
      );
    }
    throw error;
  }
}