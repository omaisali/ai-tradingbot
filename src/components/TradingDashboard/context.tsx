import React, { createContext, useContext, useState } from 'react';

interface TradingDashboardContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TradingDashboardContext = createContext<TradingDashboardContextType | null>(null);

export function TradingDashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <TradingDashboardContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TradingDashboardContext.Provider>
  );
}

export function useTradingDashboard() {
  const context = useContext(TradingDashboardContext);
  if (!context) {
    throw new Error('useTradingDashboard must be used within TradingDashboardProvider');
  }
  return context;
}