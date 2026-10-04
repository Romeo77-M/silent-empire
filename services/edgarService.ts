// services/edgarService.ts

const fetchJson = async (url: string, options?: RequestInit, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    return { response, payload };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
};

interface FilingInfo {
    text: string;
    companyName: string;
    url: string;
    formType: string;
    filingDate: string;
    reportDate: string;
    accessionNumber: string;
}

export const fetchLatestFilingForTicker = async (ticker: string): Promise<FilingInfo> => {
    try {
        // Step 1: Get CIK from ticker
        const { response: cikResponse, payload: cikPayload } = await fetchJson(`/api/edgar/ticker-to-cik?ticker=${encodeURIComponent(ticker)}`);
        if (!cikResponse.ok) throw new Error(cikPayload?.error || 'Failed to find ticker');
        const { cik, companyName } = cikPayload;

        // Step 2: Get latest filing info
        const { response: filingResponse, payload: filingPayload } = await fetchJson(`/api/edgar/latest-filing?cik=${encodeURIComponent(cik)}`);
        if (!filingResponse.ok) throw new Error(filingPayload?.error || 'Failed to find filing');
        const { accessionNo, primaryDoc, form, filingDate, reportDate, accessionNumber } = filingPayload;

        // Step 3: Get filing content
        const { response: contentResponse, payload: contentPayload } = await fetchJson(
            `/api/edgar/filing-content?cik=${encodeURIComponent(cik)}&accessionNo=${encodeURIComponent(accessionNo)}&primaryDoc=${encodeURIComponent(primaryDoc)}`,
            undefined,
            30000
        );
        if (!contentResponse.ok) throw new Error(contentPayload?.error || 'Failed to fetch filing content');
        const { text, url } = contentPayload;

        return { text, companyName, url, formType: form, filingDate, reportDate, accessionNumber };

    } catch (error) {
        console.error('Error in fetchLatestFilingForTicker:', error);
        throw error;
    }
};