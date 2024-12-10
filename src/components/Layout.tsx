import React from 'react';
import { Brain, LineChart, BarChart2, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface LayoutProps {
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
  currentTab?: string;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: Brain },
  { id: 'market', label: 'Market Data', icon: LineChart },
  { id: 'analysis', label: 'Technical Analysis', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function Layout({ children, onTabChange, currentTab = 'overview' }: LayoutProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Trading Bot
              </h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <div className="flex space-x-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium
                    border-b-2 transition-colors
                    ${isActive
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}