import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTitanResponse } from './titanValidation.js';

const metric = { value: 10, unit: 'USD millions', change_pct: 5 };
const body = {
  summary: { headline: 'Headline', tone: 'neutral', executive_takeaway: 'Takeaway' },
  key_metrics: { revenue: metric, net_income: metric, eps: { value: 1, unit: 'USD', change_pct: 2 } },
  risk_assessment: { risk_tier: 'moderate', primary_risks: ['Risk'], mitigating_factors: ['Factor'] },
  insights: [{ type: 'neutral', text: 'Insight' }],
  what_this_means: { summary_view: 'Meaning' },
};
const response = {
  meta: { company_name: 'Micron Technology', ticker: 'MU', report_type: '10-Q', fiscal_period: 'Q3', currency: 'USD', filing_date: '2026-09-03' },
  perspectives: { analyst: body, simple: body, human: body },
};

test('accepts a complete response for the requested ticker', () => {
  assert.equal(validateTitanResponse(response, 'mu'), true);
});

test('rejects a response for a different ticker', () => {
  assert.equal(validateTitanResponse({ ...response, meta: { ...response.meta, ticker: 'AAPL' } }, 'MU'), false);
});

test('rejects missing narrative evidence fields', () => {
  const brokenBody = { ...body, what_this_means: { summary_view: '' } };
  assert.equal(validateTitanResponse({ ...response, perspectives: { ...response.perspectives, simple: brokenBody } }, 'MU'), false);
});

test('rejects non-finite metrics and oversized lists', () => {
  const badMetricBody = { ...body, key_metrics: { ...body.key_metrics, revenue: { ...metric, value: NaN } } };
  assert.equal(validateTitanResponse({ ...response, perspectives: { ...response.perspectives, analyst: badMetricBody } }, 'MU'), false);

  const longListBody = { ...body, insights: Array.from({ length: 13 }, () => ({ type: 'neutral', text: 'x' })) };
  assert.equal(validateTitanResponse({ ...response, perspectives: { ...response.perspectives, human: longListBody } }, 'MU'), false);
});
