import { Schema, Model, model as createMongooseModel } from 'mongoose';
import { logger } from '../../utils/logger';

export function createModel<T>(
  modelName: string, 
  schema: Schema<T>,
  collection?: string
): Model<T> {
  try {
    // Try to get existing model first
    try {
      return createMongooseModel.get(modelName);
    } catch {
      // Model doesn't exist yet, create it
      const modelOptions = collection ? { collection } : undefined;
      return createMongooseModel<T>(modelName, schema, modelOptions);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to create model ${modelName}:`, { error: message });
    throw error;
  }
}