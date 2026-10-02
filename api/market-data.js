const ALLOWED_FUNCTION = 'TIME_SERIES_DAILY_ADJUSTED';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Market data service is not configured.' });

  const ticker = String(req.query?.ticker || '').trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,15}$/.test(ticker)) {
    return res.status(400).json({ error: 'Invalid ticker.' });
  }

  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', ALLOWED_FUNCTION);
  url.searchParams.set('symbol', ticker);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('outputsize', 'compact');

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return res.status(502).json({ error: 'Market data provider request failed.' });

    const json = await response.json();
    if (json['Error Message']) return res.status(404).json({ error: 'Invalid ticker or no market data available.' });
    if (json['Note'] || json['Information']) return res.status(429).json({ error: 'Market data rate limit reached. Please try again shortly.' });

    const timeSeries = json['Time Series (Daily)'];
    if (!timeSeries) return res.status(502).json({ error: 'Market data provider returned an unexpected response.' });

    const data = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: Number(values['1. open']),
      high: Number(values['2. high']),
      low: Number(values['3. low']),
      close: Number(values['4. close']),
    })).filter(row => [row.open,row.high,row.low,row.close].every(Number.isFinite)).reverse();

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json({ ticker, data });
  } catch (error) {
    console.error('Market data request failed:', error);
    return res.status(502).json({ error: 'Failed to fetch market data.' });
  }
}
