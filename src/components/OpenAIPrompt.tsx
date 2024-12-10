import React, { useState } from 'react';
import { Key } from 'lucide-react';

interface OpenAIPromptProps {
  onSubmit: (apiKey: string) => void;
}

export function OpenAIPrompt({ onSubmit }: OpenAIPromptProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">OpenAI API Key Required</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          To enable AI-powered trading decisions, please provide your OpenAI API key.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="sk-..."
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue with AI Trading
          </button>
        </form>
      </div>
    </div>
  );
}