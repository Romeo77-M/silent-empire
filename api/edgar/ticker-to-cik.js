export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker parameter required' });
  }

  try {
    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers: {
        'User-Agent': 'Silent Empire LLC tech@silentempire.com',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status}`);
    }

    const companies = await response.json();
    
    for (const key in companies) {
      if (companies[key].ticker.toUpperCase() === ticker.toUpperCase()) {
        return res.status(200).json({ cik: companies[key].cik_str.toString() });
      }
    }

    return res.status(404).json({ error: `Ticker ${ticker} not found` });

  } catch (error) {
    console.error('Error fetching CIK:', error);
    return res.status(500).json({ error: 'Failed to fetch ticker information' });
  }
}