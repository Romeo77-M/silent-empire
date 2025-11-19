// services/edgarService.ts

interface FilingInfo {
    text: string;
    url: string;
    formType: string;
}

export const fetchLatestFilingForTicker = async (ticker: string): Promise<FilingInfo> => {
    try {
        // Step 1: Get CIK from ticker
        const cikResponse = await fetch(`/api/edgar/ticker-to-cik?ticker=${encodeURIComponent(ticker)}`);
        if (!cikResponse.ok) {
            const error = await cikResponse.json();
            throw new Error(error.error || 'Failed to find ticker');
        }
        const { cik } = await cikResponse.json();

        // Step 2: Get latest filing info
        const filingResponse = await fetch(`/api/edgar/latest-filing?cik=${cik}`);
        if (!filingResponse.ok) {
            const error = await filingResponse.json();
            throw new Error(error.error || 'Failed to find filing');
        }
        const { accessionNo, primaryDoc, form } = await filingResponse.json();

        // Step 3: Get filing content
        const contentResponse = await fetch(
            `/api/edgar/filing-content?cik=${cik}&accessionNo=${accessionNo}&primaryDoc=${encodeURIComponent(primaryDoc)}`
        );
        if (!contentResponse.ok) {
            const error = await contentResponse.json();
            throw new Error(error.error || 'Failed to fetch filing content');
        }
        const { text, url } = await contentResponse.json();

        return { text, url, formType: form };

    } catch (error) {
        console.error('Error in fetchLatestFilingForTicker:', error);
        throw error;
    }
};