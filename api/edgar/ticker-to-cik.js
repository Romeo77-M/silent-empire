const SEC_HEADERS = {
  'User-Agent': process.env.SEC_USER_AGENT || 'Silent Empire Financial Summarizer contact@silentempire.com',
  'Accept': 'application/json'
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const ticker = String(req.query?.ticker || '').trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,15}$/.test(ticker)) {
    return res.status(400).json({ error: 'Invalid ticker.' });
  }

  try {
    const response = await fetch('https://www.sec.gov/files/company_tickers.json', { headers: SEC_HEADERS });
    if (!response.ok) {
      console.error('SEC ticker map request failed:', response.status);
      return res.status(502).json({ error: 'SEC ticker service is temporarily unavailable.' });
    }

    const companies = await response.json();
    const company = Object.values(companies).find(
      item => String(item?.ticker || '').toUpperCase() === ticker
    );

    if (!company) return res.status(404).json({ error: `Ticker ${ticker} not found.` });

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({
      cik: String(company.cik_str),
      ticker: String(company.ticker),
      companyName: String(company.title || '')
    });
  } catch (error) {
    console.error('Error fetching SEC ticker map:', error);
    return res.status(502).json({ error: 'Failed to fetch SEC ticker information.' });
  }
}
