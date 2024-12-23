import React, { useState } from 'react';
import { Key, Lock, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { Config } from '../types/config';
import { validateBinanceCredentials } from '../services/binanceService';

interface ConfigurationPanelProps {
  config: Config;
  onSave: (config: Config) => void;
}

interface ValidationStatus {
  isValidating: boolean;
  isValid: boolean | null;
  message: string;
}

export function ConfigurationPanel({ config, onSave }: ConfigurationPanelProps) {
  const [formData, setFormData] = useState(config);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    isValidating: false,
    isValid: null,
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.binanceApiKey || !formData.binanceSecretKey) {
      setValidationStatus({
        isValidating: false,
        isValid: false,
        message: 'Please provide both API key and Secret key'
      });
      return;
    }

    setValidationStatus({
      isValidating: true,
      isValid: null,
      message: 'Validating API keys...'
    });

    try {
      const isValid = await validateBinanceCredentials(
        formData.binanceApiKey,
        formData.binanceSecretKey
      );

      if (isValid) {
        setValidationStatus({
          isValidating: false,
          isValid: true,
          message: 'API keys validated successfully!'
        });
        onSave(formData);
      } else {
        setValidationStatus({
          isValidating: false,
          isValid: false,
          message: 'Invalid API keys. Please check your credentials.'
        });
      }
    } catch (error) {
      setValidationStatus({
        isValidating: false,
        isValid: false,
        message: 'Failed to validate API keys. Please try again.'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg theme-transition">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Configuration</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Configure your API keys to enable trading and AI-powered analysis.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
              <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              OpenAI Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={formData.openaiApiKey || ''}
                  onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
                    placeholder-gray-400 dark:placeholder-gray-500
                    theme-transition"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Required for AI-powered trading decisions
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Binance Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.binanceApiKey || ''}
                  onChange={(e) => setFormData({ ...formData, binanceApiKey: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
                    theme-transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={formData.binanceSecretKey || ''}
                  onChange={(e) => setFormData({ ...formData, binanceSecretKey: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
                    theme-transition"
                />
              </div>
            </div>
          </div>
        </div>

        {validationStatus.message && (
          <div className={`flex items-center gap-2 p-4 rounded-md ${
            validationStatus.isValidating ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
            validationStatus.isValid ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
            'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {validationStatus.isValidating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : validationStatus.isValid ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <p className="text-sm">{validationStatus.message}</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={validationStatus.isValidating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
              bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
              rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
          >
            {validationStatus.isValidating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {validationStatus.isValidating ? 'Validating...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}