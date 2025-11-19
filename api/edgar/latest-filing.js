export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { cik } = req.query;

  if (!cik) {
    return res.status(400).json({ error: 'CIK parameter required' });
  }

  const paddedCik = String(cik).padStart(10, '0');

  try {
    const response = await fetch(
      `https://data.sec.gov/submissions/CIK${paddedCik}.json`,
      {
        headers: {
          'User-Agent': 'Silent Empire LLC tech@silentempire.com',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status}`);
    }

    const submissions = await response.json();
    const recentFilings = submissions.filings.recent;

    for (let i = 0; i < recentFilings.form.length; i++) {
      const formType = recentFilings.form[i];
      if (formType === '10-K' || formType === '10-Q') {
        return res.status(200).json({
          accessionNo: recentFilings.accessionNumber[i].replace(/-/g, ''),
          primaryDoc: recentFilings.primaryDocument[i],
          form: formType,
          filingDate: recentFilings.filingDate[i]
        });
      }
    }

    return res.status(404).json({ error: 'No recent 10-K or 10-Q found' });

  } catch (error) {
    console.error('Error fetching filing info:', error);
    return res.status(500).json({ error: 'Failed to fetch filing information' });
  }
}