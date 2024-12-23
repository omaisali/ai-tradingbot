import { db } from '../core/database';
import { ValidationError } from '../errors/database';
import type { MarketData } from '../types/marketData';

export async function verifyDatabase(): Promise<void> {
  console.log('🔍 Starting database verification...');

  try {
    // Test data with all required fields properly formatted
    const testData: Omit<MarketData, 'id'> = {
      timestamp: Date.now(),
      symbol: 'TEST',
      price: 100,
      volume: 1000
    };

    console.log('📝 Testing write operation...');
    // Test write operation with explicit typing
    const id = await db.marketData.add({
      ...testData,
      id: undefined // Ensure id is undefined for auto-increment
    });
    
    if (typeof id !== 'number' || isNaN(id)) {
      throw new ValidationError('Failed to generate valid ID');
    }
    console.log('✅ Write operation successful, generated ID:', id);

    console.log('📖 Testing read operation...');
    // Test read operation
    const stored = await db.marketData.get(id);
    if (!stored || stored.timestamp !== testData.timestamp) {
      throw new ValidationError('Read operation failed');
    }
    console.log('✅ Read operation successful');

    console.log('🔍 Testing index query...');
    // Test index query
    const indexResult = await db.marketData
      .where('symbol')
      .equals('TEST')
      .first();
    if (!indexResult) {
      throw new ValidationError('Index query failed');
    }
    console.log('✅ Index query successful');

    console.log('🧹 Cleaning up test data...');
    // Clean up test data
    await db.marketData.delete(id);
    const deleted = await db.marketData.get(id);
    if (deleted) {
      throw new ValidationError('Deletion failed');
    }
    console.log('✅ Cleanup successful');

    console.log('✅ All verification tests passed');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw error;
  }
}