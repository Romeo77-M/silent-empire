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
        const baseUrl = import.meta.env.DEV ? '/sec-api' : 'https://www.sec.gov';
        const response = await fetch(`${baseUrl}/files/company_tickers.json`);
        
        if (!response.ok) {
            throw new Error(`SEC API responded with status ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("SEC returned non-JSON response:", await response.text());
            throw new Error('SEC API is temporarily unavailable. Please try again in a moment.');
        }
        
        const companies = await response.json();
        
        for (const key in companies) {
            if (companies[key].ticker.toUpperCase() === ticker.toUpperCase()) {
                return companies[key].cik_str.toString();
            }
        }
        throw new Error(`Ticker ${ticker} not found in SEC database. Please verify it's a valid US publicly traded company.`);
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
        
        if (!response.ok) {
            throw new Error(`Failed to fetch SEC submissions (Status: ${response.status})`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error('SEC API returned invalid response format.');
        }

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
        
        throw new Error('No recent 10-K or 10-Q filing found for this company.');

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
        if (!response.ok) throw new Error(`Failed to fetch filing document (Status: ${response.status})`);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const text = doc.body.textContent || "";
        
        if (text.length < 100) {
            throw new Error('Filing document appears to be empty or invalid.');
        }
        
        return text;

    } catch (error) {
        console.error("Error in getFilingText:", error);
        throw error;
    }
};

export const fetchLatestFilingForTicker = async (ticker: string): Promise<FilingInfo> => {
    const cik = await getCikFromTicker(ticker);
    const { accessionNo, primaryDoc, form } = await getLatestFilingInfo(cik);
    const text = await getFilingText(cik, accessionNo, primaryDoc);
    
    const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNo}/${primaryDoc}`;

    return { text, url, formType: form };
};