import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import type { MarketData } from '../db/database';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  data: MarketData[];
}

export function PriceChart({ data }: PriceChartProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

  const chartData = {
    labels: data.map(d => format(d.timestamp, 'HH:mm')).reverse(),
    datasets: [
      {
        label: 'BTC/USDT',
        data: data.map(d => d.price).reverse(),
        borderColor: '#3b82f6',
        backgroundColor: isDarkMode 
          ? 'rgba(59, 130, 246, 0.1)'
          : 'rgba(59, 130, 246, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHitRadius: 20,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: gridColor,
        },
        ticks: {
          color: textColor,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          callback: (value: number) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}