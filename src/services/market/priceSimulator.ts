export function simulateHistoricalPrice(date: Date): number {
  // Base price around $30,000
  const basePrice = 30000;
  
  // Add yearly trend (5% yearly growth)
  const yearsSince2020 = (date.getFullYear() - 2020) + (date.getMonth() / 12);
  const yearlyTrend = basePrice * (0.05 * yearsSince2020);
  
  // Add seasonal variation (3% amplitude)
  const seasonalVariation = Math.sin(date.getMonth() * Math.PI / 6) * basePrice * 0.03;
  
  // Add daily variation (2% amplitude)
  const dailyVariation = (Math.sin(date.getDate() * Math.PI / 15) + Math.random()) * basePrice * 0.02;
  
  return basePrice + yearlyTrend + seasonalVariation + dailyVariation;
}