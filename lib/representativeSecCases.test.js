import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTitanResponse } from './titanValidation.js';
import { verifyCoreMetrics } from './titanFactualVerification.js';

const cases = [
  {
    ticker: 'MU',
    companyName: 'Micron Technology, Inc.',
    name: 'Micron fiscal Q3 2026 10-Q',
    filingDate: '2026-07-01',
    accessionNumber: '0000723125-26-000015',
    form: '10-Q',
    reportDate: '2026-05-28',
    units: 'USD millions except per-share amounts',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/723125/000072312526000015/mu-20260528.htm',
    metrics: { revenue: 41456, netIncome: 28243, dilutedEps: 24.67 },
    sourceAnchors: {
      revenue: 'Revenue | $ | 41,456',
      netIncome: 'Net income | $ | 28,243',
      dilutedEps: 'Diluted | 24.67',
    },
  },
  {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    name: 'Apple fiscal 2025 10-K',
    filingDate: '2025-10-31',
    accessionNumber: '0000320193-25-000079',
    form: '10-K',
    reportDate: '2025-09-27',
    units: 'USD millions except per-share amounts',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm',
    metrics: { revenue: 416161, netIncome: 112010, dilutedEps: 7.46 },
    sourceAnchors: {
      revenue: 'Total net sales | 416,161',
      netIncome: 'Net income | $ | 112,010',
      dilutedEps: 'Diluted | $ | 7.46',
    },
  },
];

test('representative SEC filing fixtures cover both 10-Q and 10-K', () => {
  assert.deepEqual(new Set(cases.map(item => item.form)), new Set(['10-Q', '10-K']));
});

test('representative SEC filing fixtures retain explicit periods, units, and positive core metrics', () => {
  for (const item of cases) {
    assert.match(item.reportDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(item.units, /USD millions/);
    assert.ok(item.metrics.revenue > 0);
    assert.ok(item.metrics.netIncome > 0);
    assert.ok(item.metrics.dilutedEps > 0);
    assert.match(item.filingUrl, /^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\//);
    assert.ok(item.sourceAnchors.revenue);
    assert.ok(item.sourceAnchors.netIncome);
    assert.ok(item.sourceAnchors.dilutedEps);
  }
});

export const representativeSecCases = cases;


const metric = (value, unit) => ({ value, unit, change_pct: 0 });

const buildRepresentativeTitanResponse = item => {
  const key_metrics = {
    revenue: metric(item.metrics.revenue, 'USD millions'),
    net_income: metric(item.metrics.netIncome, 'USD millions'),
    eps: metric(item.metrics.dilutedEps, 'USD per diluted share'),
  };
  const body = {
    summary: {
      headline: 'Representative filing validation',
      tone: 'neutral',
      executive_takeaway: 'Core metrics are grounded in the representative SEC filing fixture.',
    },
    key_metrics,
    risk_assessment: {
      risk_tier: 'moderate',
      primary_risks: [],
      mitigating_factors: [],
    },
    insights: [],
    what_this_means: {
      summary_view: 'This fixture verifies the trusted filing identity and core reported metrics together.',
    },
  };

  return {
    meta: {
      company_name: item.companyName,
      ticker: item.ticker,
      report_type: item.form,
      fiscal_period: item.reportDate,
      currency: 'USD',
      filing_date: item.filingDate,
      report_date: item.reportDate,
      accession_number: item.accessionNumber,
    },
    perspectives: {
      analyst: structuredClone(body),
      simple: structuredClone(body),
      human: structuredClone(body),
    },
  };
};

test('representative SEC cases satisfy the Titan contract with exact filing-backed core metrics', () => {
  for (const item of cases) {
    const response = buildRepresentativeTitanResponse(item);
    assert.equal(validateTitanResponse(response, item.ticker), true);
    assert.equal(verifyCoreMetrics(response.perspectives, {
      revenue: { value: item.metrics.revenue, unit: 'USD millions' },
      net_income: { value: item.metrics.netIncome, unit: 'USD millions' },
      eps: { value: item.metrics.dilutedEps, unit: 'USD per diluted share' },
    }), true);
    for (const perspective of Object.values(response.perspectives)) {
      assert.equal(perspective.key_metrics.revenue.value, item.metrics.revenue);
      assert.equal(perspective.key_metrics.net_income.value, item.metrics.netIncome);
      assert.equal(perspective.key_metrics.eps.value, item.metrics.dilutedEps);
    }
  }
});

test('representative validation detects a material metric mismatch even when schema remains valid', () => {
  const item = cases[0];
  const response = buildRepresentativeTitanResponse(item);
  for (const perspective of Object.values(response.perspectives)) {
    perspective.key_metrics.revenue.value += 1;
  }

  assert.equal(validateTitanResponse(response, item.ticker), true);
  assert.equal(verifyCoreMetrics(response.perspectives, {
    revenue: { value: item.metrics.revenue, unit: 'USD millions' },
    net_income: { value: item.metrics.netIncome, unit: 'USD millions' },
    eps: { value: item.metrics.dilutedEps, unit: 'USD per diluted share' },
  }), false);
});
