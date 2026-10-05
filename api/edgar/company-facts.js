import { normalizeCik, validateCompanyFactsPayload } from '../../lib/secCompanyFacts.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const userAgent = process.env.SEC_USER_AGENT;
  if (!userAgent) return res.status(500).json({ error: 'SEC API configuration missing' });

  const cik = String(req.query?.cik || '').trim();
  const paddedCik = normalizeCik(cik);
  if (!paddedCik) return res.status(400).json({ error: 'Invalid CIK' });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) return res.status(response.status).json({ error: 'SEC company facts request failed' });

    const payload = await response.json();
    const validated = validateCompanyFactsPayload(payload, cik);
    if (!validated) return res.status(502).json({ error: 'Invalid SEC company facts response' });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(validated);
  } catch (error) {
    if (error?.name === 'AbortError') return res.status(504).json({ error: 'SEC company facts request timed out' });
    return res.status(502).json({ error: 'Unable to fetch SEC company facts' });
  } finally {
    clearTimeout(timer);
  }
}
