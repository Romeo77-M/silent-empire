export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { cik, accessionNo, primaryDoc } = req.query;

  if (!cik || !accessionNo || !primaryDoc) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNo}/${primaryDoc}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Silent Empire LLC tech@silentempire.com',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status}`);
    }

    const html = await response.text();
    
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();

    if (text.length < 100) {
      throw new Error('Filing appears to be empty');
    }

    return res.status(200).json({ text, url });

  } catch (error) {
    console.error('Error fetching filing content:', error);
    return res.status(500).json({ error: 'Failed to fetch filing content' });
  }
}