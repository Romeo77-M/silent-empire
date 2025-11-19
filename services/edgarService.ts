// services/edgarService.ts

const SEC_USER_AGENT = "Silent Empire LLC tech@silentempire.com";

interface FilingInfo {
    text: string;
    url: string;
    formType: string;
}

const padCik = (cik: string): string => cik.padStart(10, '0');

const getCikFromTicker = async (ticker: string): Promise<string> => {
    try {
        // Use proxy in development, direct in production
        const baseUrl = import.meta.env.DEV ? '/sec-api' : 'https://www.sec.gov';
        const response = await fetch(`${baseUrl}/files/company_tickers.json`);
        
        if (!response.ok) throw new Error('Failed to fetch SEC ticker data.');
        const companies = await response.json();
        
        for (const key in companies) {
            if (companies[key].ticker.toUpperCase() === ticker.toUpperCase()) {
                return companies[key].cik_str.toString();
            }
        }
        throw new Error(`CIK not found for ticker: ${ticker}`);
    } catch (error) {
        console.error("Error in getCikFromTicker:", error);
        throw error;
    }
};

const getLatestFilingInfo = async (cik: string): Promise<{ accessionNo: string; primaryDoc: string; form: string; }> => {
    const paddedCik = padCik(cik);
    const baseUrl = import.meta.env.DEV ? '/sec-data' : 'https://data.sec.gov';
    const url = `${baseUrl}/submissions/CIK${paddedCik}.json`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch submissions from SEC Edgar.');
        const submissions = await response.json();

        const recentFilings = submissions.filings.recent;
        
        for (let i = 0; i < recentFilings.form.length; i++) {
            const formType = recentFilings.form[i];
            if (formType === '10-K' || formType === '10-Q') {
                return {
                    accessionNo: recentFilings.accessionNumber[i].replace(/-/g, ''),
                    primaryDoc: recentFilings.primaryDocument[i],
                    form: formType
                };
            }
        }
        
        throw new Error('No recent 10-K or 10-Q filing could be found.');

    } catch (error) {
        console.error("Error in getLatestFilingInfo:", error);
        throw error;
    }
};

const getFilingText = async (cik: string, accessionNo: string, primaryDoc: string): Promise<string> => {
    const baseUrl = import.meta.env.DEV ? '/sec-api' : 'https://www.sec.gov';
    const filingUrl = `${baseUrl}/Archives/edgar/data/${cik}/${accessionNo}/${primaryDoc}`;

    try {
        const response = await fetch(filingUrl);
        if (!response.ok) throw new Error(`Failed to fetch filing document from ${filingUrl}`);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.textContent || "";

    } catch (error) {
        console.error("Error in getFilingText:", error);
        throw error;
    }
};

export const fetchLatestFilingForTicker = async (ticker: string): Promise<FilingInfo> => {
    const cik = await getCikFromTicker(ticker);
    const { accessionNo, primaryDoc, form } = await getLatestFilingInfo(cik);
    const text = await getFilingText(cik, accessionNo, primaryDoc);
    
    const paddedCik = padCik(cik);
    const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNo}/${primaryDoc}`;

    return { text, url, formType: form };
};