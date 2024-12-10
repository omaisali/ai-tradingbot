import React, { useState } from 'react';
import { Key, Lock, Brain } from 'lucide-react';
import { Config } from '../types/config';

interface ConfigurationPanelProps {
  config: Config;
  onSave: (config: Config) => void;
}

export function ConfigurationPanel({ config, onSave }: ConfigurationPanelProps) {
  const [formData, setFormData] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
              bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
              rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              dark:focus:ring-offset-gray-800 transition-colors"
          >
            <Lock className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}