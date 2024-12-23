import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { setupWasm } from './utils/wasm.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  await setupWasm(__dirname);
  logger.success('WASM setup completed successfully');
} catch (error) {
  logger.error('WASM setup failed:', error);
  process.exit(1);
}