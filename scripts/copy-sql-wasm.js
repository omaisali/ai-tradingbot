import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create public directory if it doesn't exist
mkdirSync(join(__dirname, '../public'), { recursive: true });

// Copy SQL.js WASM file to public directory
copyFileSync(
  join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm'),
  join(__dirname, '../public/sql-wasm.wasm')
);

console.log('✅ SQL.js WASM file copied to public directory');