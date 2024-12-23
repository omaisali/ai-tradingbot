import { stat, access, constants } from 'fs/promises';
import { logger } from './logger.js';

export async function verifyWasm(filePath) {
  try {
    // Check file exists and is readable
    await access(filePath, constants.R_OK);
    
    // Get file stats
    const stats = await stat(filePath);
    
    if (stats.size === 0) {
      throw new Error('WASM file is empty');
    }

    logger.info(`WASM file verified (${stats.size} bytes)`);
    return true;
  } catch (error) {
    throw new Error(`WASM verification failed: ${error.message}`);
  }
}