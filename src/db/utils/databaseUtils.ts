export async function safeDeleteDatabase(dbName: string): Promise<void> {
  try {
    const databases = await window.indexedDB.databases();
    const exists = databases.some(db => db.name === dbName);
    
    if (exists) {
      await new Promise<void>((resolve, reject) => {
        const request = window.indexedDB.deleteDatabase(dbName);
        
        request.onerror = () => {
          reject(new Error(`Failed to delete database: ${dbName}`));
        };
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onblocked = () => {
          console.warn('Database deletion was blocked. Closing all connections...');
        };
      });
    }
  } catch (error) {
    console.warn('Failed to check/delete database:', error);
  }
}

export function createObjectStore(
  db: IDBDatabase,
  storeName: string,
  keyPath: string = 'id',
  autoIncrement: boolean = true
): IDBObjectStore {
  return db.createObjectStore(storeName, { keyPath, autoIncrement });
}