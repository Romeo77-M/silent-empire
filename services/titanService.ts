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

import type { TitanMeta, TitanSchemaBody } from '../types';

interface TitanMultiPerspectiveResponse {
  meta: TitanMeta;
  perspectives: {
    analyst: TitanSchemaBody;
    simple: TitanSchemaBody;
    human: TitanSchemaBody;
  };
}

interface FilingMetadata {
  formType: string;
  filingDate: string;
  reportDate: string;
}

export const generateTitanSummary = async ({ ticker, filingText, filingIdentity, filingMetadata }: { ticker: string; filingText: string; filingIdentity: string; filingMetadata: FilingMetadata; }): Promise<TitanMultiPerspectiveResponse> => {
  const { response, payload } = await fetchJson('/api/titan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker, filingText, filingIdentity, filingMetadata }),
  }, 60000);
  if (!response.ok) {
    throw new Error(payload?.error || 'Titan API Error: Failed to generate financial summary.');
  }
  return payload as TitanMultiPerspectiveResponse;
};
