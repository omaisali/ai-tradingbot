const VERSION_KEY = 'dbVersion';

export async function getCurrentDatabaseVersion(): Promise<number> {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    return storedVersion ? parseInt(storedVersion, 10) : 1;
  } catch (error) {
    console.warn('Error getting database version:', error);
    return 1;
  }
}

export function updateDatabaseVersion(version: number): void {
  try {
    localStorage.setItem(VERSION_KEY, version.toString());
  } catch (error) {
    console.warn('Error updating database version:', error);
  }
}

export function clearDatabaseVersion(): void {
  try {
    localStorage.removeItem(VERSION_KEY);
  } catch (error) {
    console.warn('Error clearing database version:', error);
  }
}