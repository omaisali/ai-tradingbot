import { DatabaseError } from '../errors/DatabaseError';

export function handleDatabaseError(error: unknown, context: string): never {
  console.error(`[Database Error] ${context}:`, error);
  
  if (error instanceof DatabaseError) {
    throw error;
  }
  
  throw new DatabaseError(
    `An unexpected error occurred during ${context}`,
    error instanceof Error ? error : undefined
  );
}