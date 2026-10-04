import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateSummary } from '../services/historyService.ts';

const body = {
  summary: { headline: 'Headline', tone: 'neutral', executive_takeaway: 'Takeaway' },
  key_metrics: {
    revenue: { value: 10, unit: 'USD millions', change_pct: 1 },
    net_income: { value: 2, unit: 'USD millions', change_pct: 1 },
    eps: { value: 1, unit: 'USD', change_pct: 1 },
  },
  risk_assessment: { risk_tier: 'moderate', primary_risks: ['Risk'], mitigating_factors: ['Factor'] },
  insights: [{ type: 'neutral', text: 'Insight' }],
  what_this_means: { summary_view: 'Meaning' },
};

const legacy = {
  id: 'legacy',
  meta: {
    company_name: 'Example Co',
    ticker: 'EX',
    report_type: '10-Q',
    fiscal_period: '2026-06-30',
    currency: 'USD',
    filing_date: '2026-08-01',
    reportDate: '2026-06-30',
    accessionNumber: '0000000001-26-000001',
  },
  perspectives: { analyst: body, simple: body, human: body },
};

test('migrates legacy SEC provenance aliases without losing the old fields', () => {
  const migrated = migrateSummary(structuredClone(legacy));
  assert.ok(migrated);
  assert.equal(migrated.meta.report_date, '2026-06-30');
  assert.equal(migrated.meta.accession_number, '0000000001-26-000001');
  assert.equal(migrated.meta.reportDate, '2026-06-30');
  assert.equal(migrated.meta.accessionNumber, '0000000001-26-000001');
});

test('does not overwrite authoritative provenance with legacy aliases', () => {
  const current = structuredClone(legacy);
  current.meta.report_date = '2026-07-01';
  current.meta.accession_number = '0000000001-26-000002';
  const migrated = migrateSummary(current);
  assert.ok(migrated);
  assert.equal(migrated.meta.report_date, '2026-07-01');
  assert.equal(migrated.meta.accession_number, '0000000001-26-000002');
});

test('rejects malformed history entries before migration', () => {
  assert.equal(migrateSummary(null), null);
  assert.equal(migrateSummary({ meta: {} }), null);
});
