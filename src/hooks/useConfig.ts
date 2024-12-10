import { useState, useEffect } from 'react';
import { Config } from '../types/config';

export function useConfig() {
  const [config, setConfig] = useState<Config>({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const storedConfig = localStorage.getItem('tradingBotConfig');
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      setConfig(parsed);
      setIsValid(
        !!parsed.binanceApiKey &&
        !!parsed.binanceSecretKey
      );
    }
  }, []);

  const updateConfig = (newConfig: Config) => {
    setConfig(newConfig);
    localStorage.setItem('tradingBotConfig', JSON.stringify(newConfig));
    setIsValid(
      !!newConfig.binanceApiKey &&
      !!newConfig.binanceSecretKey
    );
  };

  return { 
    config, 
    isValid, 
    updateConfig,
    hasOpenAI: !!config.openaiApiKey 
  };
}