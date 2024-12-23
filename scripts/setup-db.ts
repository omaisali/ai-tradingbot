import { copyFile, mkdir, stat } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function verifyWasmFile(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.size > 0;
  } catch {
    return false;
  }
}

async function setupDatabase() {
  console.log('Setting up database...');
  
  const publicDir = join(__dirname, '../public');
  const sourcePath = join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
  const destPath = join(publicDir, 'sql-wasm.wasm');

  try {
    // Create public directory
    await mkdir(publicDir, { recursive: true });
    
    // Copy WASM file
    await copyFile(sourcePath, destPath);
    
    // Verify file was copied correctly
    if (!await verifyWasmFile(destPath)) {
      throw new Error('WASM file verification failed');
    }
    
    console.log('✅ SQL.js WASM file copied successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();