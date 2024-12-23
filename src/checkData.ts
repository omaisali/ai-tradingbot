import { verifyMarketData } from './utils/verifyMarketData';
import { format } from 'date-fns';

export async function checkMarketData() {
  console.log('🔍 Checking market data status...');
  
  const status = await verifyMarketData();
  
  if (!status) {
    console.log('❌ Failed to verify market data');
    return;
  }

  console.log('\n📊 Market Data Status:');
  console.log('====================');
  console.log(`📝 Total Records: ${status.totalRecords.toLocaleString()}`);
  console.log(`📅 Days of Data: ${status.daysOfData}`);
  console.log(`📈 Data Completeness: ${status.dataCompleteness.toFixed(2)}%`);
  console.log(`\n⏰ Time Range:`);
  console.log(`   First: ${format(status.firstDate, 'PPpp')}`);
  console.log(`   Last:  ${format(status.lastDate, 'PPpp')}`);
  console.log(`\n💰 Latest Data:`);
  console.log(`   Price:  $${status.latestPrice.toLocaleString()}`);
  console.log(`   Volume: ${status.latestVolume.toLocaleString()} BTC`);
}