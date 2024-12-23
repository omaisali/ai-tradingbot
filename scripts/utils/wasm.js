import { mkdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { setupPaths } from './paths.js';
import { verifyWasm } from './verify.js';
import { logger } from './logger.js';

const execAsync = promisify(exec);

export async function setupWasm(scriptDir) {
  const { publicDir, sourcePath, destPath } = setupPaths(scriptDir);

  try {
    // Create public directory if it doesn't exist
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
      logger.info('Created public directory');
    }

    // Install sql.js if not present
    if (!existsSync(sourcePath)) {
      logger.info('Installing sql.js package...');
      await execAsync('npm install sql.js@1.12.0');
      
      // Verify sql.js was installed
      if (!existsSync(sourcePath)) {
        throw new Error('Failed to install sql.js package');
      }
    }

    // Copy WASM file
    await copyFile(sourcePath, destPath);
    logger.info('Copied WASM file');

    // Verify the copied file
    await verifyWasm(destPath);
    logger.success('WASM file setup complete');

    return true;
  } catch (error) {
    throw new Error(`Failed to setup WASM: ${error.message}`);
  }
}