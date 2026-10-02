const SEC_TIMEOUT_MS = 15000;

function getSecHeaders() {
  const userAgent = process.env.SEC_USER_AGENT;
  if (!userAgent) return null;
  return {
  'User-Agent': userAgent,
  'Accept': 'application/json'
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const headers = getSecHeaders();
  if (!headers) return res.status(500).json({ error: 'SEC service is not configured.' });

  const cik = String(req.query?.cik || '').trim();
  if (!/^\d{1,10}$/.test(cik)) {
    return res.status(400).json({ error: 'Invalid CIK.' });
  }

  try {
    const paddedCik = cik.padStart(10, '0');
    const response = await fetch(`https://data.sec.gov/submissions/CIK${paddedCik}.json`, { headers, signal: AbortSignal.timeout(SEC_TIMEOUT_MS) });
    if (!response.ok) {
      console.error('SEC submissions request failed:', response.status);
      return res.status(response.status === 404 ? 404 : 502).json({ error: 'SEC filing service is temporarily unavailable.' });
    }

    const submissions = await response.json();
    const recent = submissions?.filings?.recent;
    if (!recent || !Array.isArray(recent.form)) {
      return res.status(502).json({ error: 'SEC returned an unexpected filing response.' });
    }

    const index = recent.form.findIndex(form => form === '10-K' || form === '10-Q');
    if (index < 0) return res.status(404).json({ error: 'No recent 10-K or 10-Q filing could be found.' });

    const accession = String(recent.accessionNumber?.[index] || '');
    const primaryDoc = String(recent.primaryDocument?.[index] || '');
    if (!/^\d{10}-\d{2}-\d{6}$/.test(accession) || !primaryDoc) {
      return res.status(502).json({ error: 'SEC filing metadata is incomplete.' });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      accessionNo: accession.replace(/-/g, ''),
      primaryDoc,
      form: recent.form[index],
      filingDate: String(recent.filingDate?.[index] || '')
    });
  } catch (error) {
    console.error('Error fetching SEC filing metadata:', error);
    return res.status(502).json({ error: 'Failed to fetch SEC filing information.' });
  }
}
