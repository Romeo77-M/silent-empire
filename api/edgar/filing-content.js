const SEC_HEADERS = {
  'User-Agent': process.env.SEC_USER_AGENT || 'Silent Empire Financial Summarizer contact@silentempire.com',
  'Accept': 'text/html,application/xhtml+xml'
};

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'");
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const cik = String(req.query?.cik || '').trim();
  const accessionNo = String(req.query?.accessionNo || '').trim();
  const primaryDoc = String(req.query?.primaryDoc || '').trim();

  if (!/^\d{1,10}$/.test(cik) || !/^\d{18}$/.test(accessionNo)) {
    return res.status(400).json({ error: 'Invalid filing identifiers.' });
  }
  if (!/^[A-Za-z0-9._-]+\.(?:htm|html|txt)$/i.test(primaryDoc)) {
    return res.status(400).json({ error: 'Invalid filing document name.' });
  }

  try {
    const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNo}/${encodeURIComponent(primaryDoc)}`;
    const response = await fetch(url, { headers: SEC_HEADERS });
    if (!response.ok) {
      console.error('SEC filing content request failed:', response.status);
      return res.status(response.status === 404 ? 404 : 502).json({ error: 'SEC filing content is temporarily unavailable.' });
    }

    const html = await response.text();
    const text = decodeEntities(
      html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<br\s*\/?\s*>/gi, '\n')
        .replace(/<\/(?:p|div|tr|li|h[1-6])>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
    )
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n')
      .trim();

    if (text.length < 100) return res.status(502).json({ error: 'SEC filing content appears incomplete.' });

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({ text, url });
  } catch (error) {
    console.error('Error fetching SEC filing content:', error);
    return res.status(502).json({ error: 'Failed to fetch SEC filing content.' });
  }
}
