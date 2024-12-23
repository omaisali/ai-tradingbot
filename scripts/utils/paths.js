import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export function setupPaths(scriptDir) {
  const publicDir = join(scriptDir, '../public');
  const sourcePath = join(scriptDir, '../node_modules/sql.js/dist/sql-wasm.wasm');
  const destPath = join(publicDir, 'sql-wasm.wasm');

  return {
    publicDir,
    sourcePath,
    destPath
  };
}