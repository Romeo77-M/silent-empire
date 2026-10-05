import test from 'node:test';
import assert from 'node:assert/strict';

const cases = [
  {
    name: 'Micron fiscal Q3 2026 10-Q',
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
    name: 'Apple fiscal 2025 10-K',
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
