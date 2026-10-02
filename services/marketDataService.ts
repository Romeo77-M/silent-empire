import type { CandlestickData } from '../types';

export const fetchDailyChartData = async (ticker: string): Promise<CandlestickData[]> => {
  const normalizedTicker = ticker.trim().toUpperCase();
  const response = await fetch(`/api/market-data?ticker=${encodeURIComponent(normalizedTicker)}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to fetch market data.');
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error('Market data service returned an invalid response.');
  }

  return payload.data as CandlestickData[];
};
