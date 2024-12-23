import { useState, useEffect } from 'react';
import type { MarketDataResponse, HistoricalDataProgress } from '../services/market/types';

const API_BASE = '/api/market';

export function useMarketData() {
  const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
  const [historyProgress, setHistoryProgress] = useState<HistoricalDataProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Check status first
        const statusRes = await fetch(`${API_BASE}/status`, {
          signal: controller.signal
        });
        const status = await statusRes.json();

        if (!status.hasData) {
          // Start collection if no data
          await fetch(`${API_BASE}/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol: 'BTCUSDT' }),
            signal: controller.signal
          });
        }

        // Poll for progress and data
        const pollInterval = setInterval(async () => {
          try {
            // Get progress
            const progressRes = await fetch(`${API_BASE}/progress`);
            const progress = await progressRes.json();
            
            if (mounted) {
              setHistoryProgress(progress);
            }

            // Get latest data
            const dataRes = await fetch(`${API_BASE}/latest`);
            const data = await dataRes.json();
            
            if (mounted) {
              setMarketData(data);
              setError(null);
              setIsLoading(false);
            }
          } catch (err) {
            console.error('Failed to fetch updates:', err);
            if (mounted) {
              setError('Failed to fetch market data');
              setIsLoading(false);
            }
          }
        }, 5000);

        return () => clearInterval(pollInterval);
      } catch (err) {
        if (mounted) {
          setError('Failed to initialize market data');
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return {
    marketData,
    historyProgress,
    error,
    isLoading
  };
}