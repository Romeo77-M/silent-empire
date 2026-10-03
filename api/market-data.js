const MAX_OUTPUT_SIZE = 120;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Market data service is not configured.' });

  const ticker = String(req.query?.ticker || '').trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,15}$/.test(ticker)) {
    return res.status(400).json({ error: 'Invalid ticker.' });
  }

  const url = new URL('https://api.twelvedata.com/time_series');
  url.searchParams.set('symbol', ticker);
  url.searchParams.set('interval', '1day');
  url.searchParams.set('outputsize', String(MAX_OUTPUT_SIZE));
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('format', 'JSON');

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('Market data provider HTTP error:', response.status);
      return res.status(response.status === 429 ? 429 : 502).json({
        error: response.status === 429
          ? 'Market data rate limit reached. Please try again shortly.'
          : 'Market data provider request failed.'
      });
    }

    if (!json || json.status === 'error') {
      const providerCode = Number(json?.code);
      if (providerCode === 429) {
        return res.status(429).json({ error: 'Market data rate limit reached. Please try again shortly.' });
      }
      if ([400, 404].includes(providerCode)) {
        return res.status(404).json({ error: 'Invalid ticker or no market data available.' });
      }
      console.error('Market data provider error:', json?.code, json?.message);
      return res.status(502).json({ error: 'Market data provider returned an error.' });
    }

    if (!Array.isArray(json.values)) {
      return res.status(502).json({ error: 'Market data provider returned an unexpected response.' });
    }

    const data = json.values.map(row => ({
      date: String(row.datetime || '').slice(0, 10),
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
    })).filter(row =>
      /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
      [row.open, row.high, row.low, row.close].every(Number.isFinite) &&
      row.open > 0 && row.high > 0 && row.low > 0 && row.close > 0 &&
      row.low <= Math.min(row.open, row.close) &&
      row.high >= Math.max(row.open, row.close) &&
      row.low <= row.high
    ).sort((a, b) => a.date.localeCompare(b.date));

    if (data.length === 0) {
      return res.status(502).json({ error: 'Market data provider returned no valid price rows.' });
    }

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json({
      ticker,
      provider: 'twelve-data',
      interval: '1day',
      data
    });
  } catch (error) {
    if (error?.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Market data provider timed out.' });
    }
    console.error('Market data request failed:', error);
    return res.status(502).json({ error: 'Failed to fetch market data.' });
  }
}
