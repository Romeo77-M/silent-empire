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
  meta: { company_name: 'Micron Technology', ticker: 'MU', report_type: '10-Q', fiscal_period: '2026-08-27', currency: 'USD', filing_date: '2026-09-03', report_date: '2026-08-27', accession_number: '0000723125-26-000123' },
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


test('rejects blank metric units and oversized narrative text', () => {
  const blankUnitBody = { ...body, key_metrics: { ...body.key_metrics, eps: { ...body.key_metrics.eps, unit: '' } } };
  assert.equal(validateTitanResponse({ ...response, perspectives: { ...response.perspectives, analyst: blankUnitBody } }, 'MU'), false);

  const oversizedBody = { ...body, summary: { ...body.summary, executive_takeaway: 'x'.repeat(4001) } };
  assert.equal(validateTitanResponse({ ...response, perspectives: { ...response.perspectives, human: oversizedBody } }, 'MU'), false);
});


test('allows explicit unavailable metadata instead of forcing a guess', () => {
  const unavailable = { ...response, meta: { ...response.meta, fiscal_period: 'not_available', currency: 'not_available' } };
  assert.equal(validateTitanResponse(unavailable, 'MU'), true);
});

test('rejects malformed or hedged currency metadata', () => {
  assert.equal(validateTitanResponse({ ...response, meta: { ...response.meta, currency: 'US dollars' } }, 'MU'), false);
  assert.equal(validateTitanResponse({ ...response, meta: { ...response.meta, currency: 'unknown' } }, 'MU'), false);
});


test('rejects missing or malformed trusted SEC provenance', () => {
  assert.equal(validateTitanResponse({ ...response, meta: { ...response.meta, accession_number: '' } }, 'MU'), false);
  assert.equal(validateTitanResponse({ ...response, meta: { ...response.meta, report_date: 'August 27, 2026' } }, 'MU'), false);
  assert.equal(validateTitanResponse({ ...response, meta: { ...response.meta, filing_date: '2026/09/03' } }, 'MU'), false);
});

test('allows unavailable SEC report period when SEC omits it', () => {
  assert.equal(validateTitanResponse({ ...response, meta: { ...response.meta, report_date: 'not_available' } }, 'MU'), true);
});


test('rejects model-style fiscal labels in favor of SEC period end dates', () => {
  assert.equal(validateTitanResponse({ ...response, meta: { ...response.meta, fiscal_period: 'Q3 FY2026' } }, 'MU'), false);
});


test('rejects investment recommendation language in learner-facing narratives', () => {
  const adviceBody = { ...body, what_this_means: { summary_view: 'This filing makes the stock a strong buy.' } };
  assert.equal(validateTitanResponse({ ...response, perspectives: { ...response.perspectives, human: adviceBody } }, 'MU'), false);
});

test('rejects target-price and hold instructions', () => {
  const targetBody = { ...body, summary: { ...body.summary, executive_takeaway: 'The target price is $150.' } };
  assert.equal(validateTitanResponse({ ...response, perspectives: { ...response.perspectives, analyst: targetBody } }, 'MU'), false);

  const holdBody = { ...body, insights: [{ type: 'neutral', text: 'Investors should hold the shares.' }] };
  assert.equal(validateTitanResponse({ ...response, perspectives: { ...response.perspectives, simple: holdBody } }, 'MU'), false);
});


test('rejects core metric disagreements between explanation modes', () => {
  const conflictingHuman = {
    ...body,
    key_metrics: {
      ...body.key_metrics,
      revenue: { ...body.key_metrics.revenue, value: 11 },
    },
  };
  assert.equal(
    validateTitanResponse({
      ...response,
      perspectives: { ...response.perspectives, human: conflictingHuman },
    }, 'MU'),
    false
  );
});

test('rejects unit and change disagreements between explanation modes', () => {
  const conflictingSimple = {
    ...body,
    key_metrics: {
      ...body.key_metrics,
      eps: { ...body.key_metrics.eps, unit: 'USD per share', change_pct: 3 },
    },
  };
  assert.equal(
    validateTitanResponse({
      ...response,
      perspectives: { ...response.perspectives, simple: conflictingSimple },
    }, 'MU'),
    false
  );
});


test('accepts null metric changes as explicitly unavailable', () => {
  const withNullChange = {
    ...response,
    perspectives: Object.fromEntries(
      Object.entries(response.perspectives).map(([mode, perspective]) => [
        mode,
        {
          ...perspective,
          key_metrics: {
            ...perspective.key_metrics,
            revenue: { ...perspective.key_metrics.revenue, change_pct: null },
          },
        },
      ])
    ),
  };
  assert.equal(validateTitanResponse(withNullChange, 'MU'), true);
});
