
import type { CandlestickData } from '../types';

export const fetchDailyChartData = async (ticker: string): Promise<CandlestickData[]> => {
  const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("API Configuration Error: Alpha Vantage API Key is not set.");
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=compact`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const json = await response.json();

    if (json['Error Message']) {
      throw new Error(`Alpha Vantage API Error: ${json['Error Message']}`);
    }
    
    if (json['Note']) {
        console.warn('Alpha Vantage API Note:', json['Note']);
        throw new Error('API call frequency limit reached. Please try again in a moment.');
    }

    const timeSeries = json['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error('Invalid ticker or no time series data available from API.');
    }

    const transformedData: CandlestickData[] = Object.entries(timeSeries).map(([date, data]: [string, any]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
    }));
    
    // API returns in reverse chronological order, so we reverse it to have the latest date last.
    return transformedData.reverse();

  } catch (error) {
    console.error("Error fetching market data from Alpha Vantage:", error);
    throw error; // Re-throw the error to be handled by the component
  }
};
