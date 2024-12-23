import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import type { MarketDataResponse } from '../services/market/types';

interface TradingViewChartProps {
  data: MarketDataResponse[];
  height?: number;
  darkMode?: boolean;
}

export function TradingViewChart({ data, height = 500, darkMode = false }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    // Create chart
    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: darkMode ? '#1a1a1a' : '#ffffff' },
        textColor: darkMode ? '#d1d5db' : '#374151',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: darkMode ? '#2d3748' : '#e5e7eb' },
        horzLines: { color: darkMode ? '#2d3748' : '#e5e7eb' },
      },
      rightPriceScale: {
        borderColor: darkMode ? '#4a5568' : '#e5e7eb',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: darkMode ? '#4a5568' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: darkMode ? '#4a5568' : '#9ca3af',
          style: 2,
        },
        horzLine: {
          width: 1,
          color: darkMode ? '#4a5568' : '#9ca3af',
          style: 2,
        },
      },
    });

    // Create series
    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    volumeSeriesRef.current = chartRef.current.addHistogramSeries({
      color: '#60a5fa',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Handle window resize
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height, darkMode]);

  // Update data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !data.length) return;

    // Sort data by timestamp in ascending order
    const sortedData = [...data].sort((a, b) => {
      const timeA = a.timestamp || Date.now();
      const timeB = b.timestamp || Date.now();
      return timeA - timeB;
    });

    const formattedData = sortedData.map((item) => {
      const time = Math.floor((item.timestamp || Date.now()) / 1000);
      return {
        time,
        open: item.price,
        high: item.price * 1.001, // Simulate slight variation
        low: item.price * 0.999,
        close: item.price,
      };
    });

    const volumeData = sortedData.map((item, index) => {
      const time = Math.floor((item.timestamp || Date.now()) / 1000);
      const prevPrice = index > 0 ? sortedData[index - 1].price : item.price;
      return {
        time,
        value: item.volume,
        color: item.price > prevPrice
          ? 'rgba(34, 197, 94, 0.5)'  // Green for price increase
          : 'rgba(239, 68, 68, 0.5)', // Red for price decrease
      };
    });

    // Update series data
    candlestickSeriesRef.current.setData(formattedData);
    volumeSeriesRef.current.setData(volumeData);

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="w-full" />
      {!data.length && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75">
          <p className="text-gray-500 dark:text-gray-400">Waiting for market data...</p>
        </div>
      )}
    </div>
  );
}