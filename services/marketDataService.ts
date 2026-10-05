const fetchJson = async (url: string, options?: RequestInit, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    return { response, payload };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
};

import type { CandlestickData } from '../types';

export const fetchDailyChartData = async (ticker: string): Promise<CandlestickData[]> => {
  const normalizedTicker = ticker.trim().toUpperCase();
  const { response, payload } = await fetchJson(`/api/market-data?ticker=${encodeURIComponent(normalizedTicker)}`);

  if (!response.ok) {
    throw new Error(payload?.error || 'Failed to fetch market data.');
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error('Market data service returned an invalid response.');
  }

  return payload.data as CandlestickData[];
};
