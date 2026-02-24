import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

interface StockPriceData {
  currentPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  loading: boolean;
  error: string | null;
}

export function useStockPrice(ticker: string): StockPriceData {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    const fetchStockPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiKey = Constants.expoConfig?.extra?.finnhubApiKey || process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
        
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.c) {
          setCurrentPrice(data.c);
          setPriceChange(data.d);
          setPriceChangePercent(data.dp);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (err) {
        console.error('Error fetching stock price:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stock price');
      } finally {
        setLoading(false);
      }
    };

    fetchStockPrice();
  }, [ticker]);

  return {
    currentPrice,
    priceChange,
    priceChangePercent,
    loading,
    error,
  };
}
