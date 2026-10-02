import type { TitanMeta, TitanSchemaBody } from '../types';

interface TitanMultiPerspectiveResponse {
  meta: TitanMeta;
  perspectives: {
    analyst: TitanSchemaBody;
    simple: TitanSchemaBody;
    human: TitanSchemaBody;
  };
}

export const generateTitanSummary = async ({ ticker, filingText }: { ticker: string; filingText: string; }): Promise<TitanMultiPerspectiveResponse> => {
  const response = await fetch('/api/titan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker, filingText }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'Titan API Error: Failed to generate financial summary.');
  }
  return payload as TitanMultiPerspectiveResponse;
};
