import { normalizeCik, validateCompanyFactsPayload } from './secCompanyFacts.js';

export const fetchSecCompanyFacts = async (cik, userAgent, fetchImpl = fetch, timeoutMs = 15000) => {
  const paddedCik = normalizeCik(cik);
  if (!paddedCik) throw new Error('Invalid CIK');
  if (!String(userAgent || '').trim()) throw new Error('SEC API configuration missing');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`, {
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error('SEC company facts request failed');
      error.status = response.status;
      throw error;
    }
    const validated = validateCompanyFactsPayload(await response.json(), cik);
    if (!validated) throw new Error('Invalid SEC company facts response');
    return validated;
  } finally {
    clearTimeout(timer);
  }
};
