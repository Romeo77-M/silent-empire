import { normalizeCik } from '../../lib/secCompanyFacts.js';
import { fetchSecCompanyFacts } from '../../lib/secCompanyFactsFetch.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const userAgent = process.env.SEC_USER_AGENT;
  if (!userAgent) return res.status(500).json({ error: 'SEC API configuration missing' });

  const cik = String(req.query?.cik || '').trim();
  if (!normalizeCik(cik)) return res.status(400).json({ error: 'Invalid CIK' });

  try {
    const validated = await fetchSecCompanyFacts(cik, userAgent);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(validated);
  } catch (error) {
    if (error?.name === 'AbortError') return res.status(504).json({ error: 'SEC company facts request timed out' });
    if (Number.isInteger(error?.status)) return res.status(error.status).json({ error: 'SEC company facts request failed' });
    return res.status(502).json({ error: 'Unable to fetch SEC company facts' });
  }
}
