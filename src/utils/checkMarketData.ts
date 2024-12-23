import { verifyMarketData } from './verifyMarketData';
import { initializeDatabase } from '../db/config/database';
import { initializeClient } from '../services/market/client';
import { startMarketService } from '../services/market/service';

export async function checkMarketData() {
  try {
    console.log('🔄 Initializing services...');
    await initializeDatabase();
    initializeClient();
    await startMarketService();

    console.log('🔍 Verifying market data...');
    const status = await verifyMarketData();
    
    if (!status) {
      console.log('❌ No market data available. Starting data collection...');
      return;
    }

    console.log('\n📊 Market Data Status');
    console.log('===================');
    console.log(`📝 Total Records: ${status.totalRecords.toLocaleString()}`);
    console.log(`📅 Days of Data: ${status.daysOfData}`);
    console.log(`📈 Data Completeness: ${status.dataCompleteness.toFixed(2)}%`);
    console.log(`\n⏰ Time Range:`);
    console.log(`   First Record: ${status.firstDate.toLocaleString()}`);
    console.log(`   Last Update: ${status.lastDate.toLocaleString()}`);
    console.log(`\n💰 Latest Data:`);
    console.log(`   Price: $${status.latestPrice.toLocaleString()}`);
    console.log(`   Volume: ${status.latestVolume.toLocaleString()} BTC`);

  } catch (error) {
    console.error('❌ Failed to check market data:', error);
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkMarketData().catch(console.error);
}