import { useState, useEffect } from 'react';
import { connectDatabase } from '../db/config/mongodb';
import { initializeClient } from '../services/market/client';
import { startMarketService } from '../services/market/service';
import { verifyMarketData } from '../utils/verifyMarketData';
import { logger } from '../utils/logger';

export function useMarketInitialization() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketStatus, setMarketStatus] = useState<{
    hasData: boolean;
    totalRecords?: number;
    dataCompleteness?: number;
  }>({ hasData: false });

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        logger.info('Initializing market data...');
        
        // Connect to MongoDB
        await connectDatabase();
        
        if (!mounted) return;

        // Initialize market client
        initializeClient();

        if (!mounted) return;

        // Verify market data
        const status = await verifyMarketData();
        
        if (!mounted) return;

        if (!status) {
          logger.info('No market data found, starting collection...');
          setMarketStatus({ hasData: false });
          await startMarketService();
        } else {
          logger.info('Market data verified successfully');
          setMarketStatus({
            hasData: true,
            totalRecords: status.totalRecords,
            dataCompleteness: status.dataCompleteness
          });
        }
      } catch (err) {
        if (!mounted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize market data';
        logger.error('Market initialization failed:', { error: errorMessage });
        setError(errorMessage);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  return { isInitializing, error, marketStatus };
}