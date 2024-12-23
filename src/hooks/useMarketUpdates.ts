import { useState, useEffect } from 'react';
import { subscribeToMarketUpdates } from '../services/market/service/manager';
import type { MarketDataResponse } from '../services/market/types';

export function useMarketUpdates() {
  const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToMarketUpdates(
      (data) => {
        setMarketData(data);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    marketData,
    error,
    isLoading
  };
}