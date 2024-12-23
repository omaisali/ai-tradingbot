import React from 'react';
import { TradingDashboardProvider } from './context';
import { TradingDashboardView } from './view';

export function TradingDashboard() {
  return (
    <TradingDashboardProvider>
      <TradingDashboardView />
    </TradingDashboardProvider>
  );
}