import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

interface CandleData {
  timestamps: number[];
  closePrices: number[];
  highPrices: number[];
  lowPrices: number[];
  openPrices: number[];
  volumes: number[];
}

interface UseStockChartReturn {
  data: number[];
  loading: boolean;
  error: string | null;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export function useStockChart(ticker: string, timeRange: TimeRange = '1D'): UseStockChartReturn {
  const [data, setData] = useState<number[]>([100]); // 初始值避免空数组
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) {
      setLoading(false);
      setData([100]); // 确保有默认值
      return;
    }

    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiKey = Constants.expoConfig?.extra?.finnhubApiKey || process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
        
        // 计算时间范围
        const now = Math.floor(Date.now() / 1000);
        let from: number;
        let resolution: string;

        switch (timeRange) {
          case '1D':
            from = now - 24 * 60 * 60; // 1 天前
            resolution = '5'; // 5 分钟 K 线
            break;
          case '1W':
            from = now - 7 * 24 * 60 * 60; // 7 天前
            resolution = '30'; // 30 分钟 K 线
            break;
          case '1M':
            from = now - 30 * 24 * 60 * 60; // 30 天前
            resolution = '60'; // 1 小时 K 线
            break;
          case '3M':
            from = now - 90 * 24 * 60 * 60; // 90 天前
            resolution = 'D'; // 日线
            break;
          case '1Y':
            from = now - 365 * 24 * 60 * 60; // 365 天前
            resolution = 'D'; // 日线
            break;
          default:
            from = now - 24 * 60 * 60;
            resolution = '5';
        }

        const response = await fetch(
          `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${now}&token=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const candleData = await response.json();

        if (candleData.s === 'ok' && candleData.c && candleData.c.length > 0) {
          // 使用收盘价作为走势数据
          setData(candleData.c);
        } else if (candleData.s === 'no_data') {
          // 如果没有数据（可能是非交易时段），生成模拟数据
          console.log(`No real-time data for ${ticker}, using simulated data`);
          setData(generateFallbackData(20));
        } else {
          throw new Error('Invalid API response');
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
        // 出错时使用模拟数据
        setData(generateFallbackData(20));
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [ticker, timeRange]);

  return {
    data,
    loading,
    error,
  };
}

// 生成回退数据（当 API 失败或无数据时）
function generateFallbackData(points: number): number[] {
  const data: number[] = [];
  const baseValue = 100;
  
  for (let i = 0; i < points; i++) {
    const trend = Math.sin(i / points * Math.PI) * 5;
    const noise = (Math.random() - 0.5) * 2;
    data.push(baseValue + trend + noise);
  }
  
  return data;
}
