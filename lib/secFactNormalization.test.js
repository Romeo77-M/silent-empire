import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSecCoreFacts, inferCoreFactsCurrency, bindCoreFactsToFiling } from './secFactNormalization.js';

const concepts = {
  revenue: 'RevenueFromContractWithCustomerExcludingAssessedTax',
  net_income: 'NetIncomeLoss',
  eps: 'EarningsPerShareDiluted',
};
const fact = (value, unit, concept = concepts.revenue) => ({ value, unit, concept, accessionNumber: '0000000001-26-000001', reportDate: '2026-06-30', filed: '2026-08-01' });

test('preserves raw monetary values and normalizes EPS currency-per-share units', () => {
  const result = normalizeSecCoreFacts({
    revenue: fact(416161000000, 'USD'),
    net_income: fact(112010000000, 'USD', concepts.net_income),
    eps: fact(7.46, 'USD/shares', concepts.eps),
  });
  assert.equal(result.revenue.value, 416161000000);
  assert.equal(result.revenue.unit, 'USD');
  assert.equal(result.eps.value, 7.46);
  assert.equal(result.eps.unit, 'USD');
  assert.equal(inferCoreFactsCurrency(result), 'USD');
});

test('rejects unsupported or ambiguous SEC units', () => {
  const result = normalizeSecCoreFacts({
    revenue: fact(100, 'shares'),
    net_income: fact(20, 'USD', concepts.net_income),
    eps: fact(1.2, 'pure', concepts.eps),
  });
  assert.equal(result.revenue, null);
  assert.equal(result.net_income.unit, 'USD');
  assert.equal(result.eps, null);
});

test('does not infer currency from conflicting structured facts', () => {
  const result = normalizeSecCoreFacts({
    revenue: fact(100, 'USD'),
    net_income: fact(20, 'CAD', concepts.net_income),
    eps: null,
  });
  assert.equal(inferCoreFactsCurrency(result), null);
});


test('rejects malformed SEC fact provenance instead of trusting browser-supplied metadata', () => {
  const result = normalizeSecCoreFacts({
    revenue: { ...fact(100, 'USD'), accessionNumber: 'not-an-accession' },
    net_income: { ...fact(20, 'USD'), reportDate: 'June 30, 2026' },
    eps: { ...fact(1.2, 'USD/shares'), filed: '' },
  });
  assert.equal(result.revenue, null);
  assert.equal(result.net_income, null);
  assert.equal(result.eps, null);
});


test('binds normalized facts to the exact SEC filing identity', () => {
  const facts = normalizeSecCoreFacts({
    revenue: fact(100, 'USD'),
    net_income: fact(20, 'USD', concepts.net_income),
    eps: fact(1.2, 'USD/shares', concepts.eps),
  });
  const matching = bindCoreFactsToFiling(facts, {
    accessionNumber: '0000000001-26-000001',
    reportDate: '2026-06-30',
    filingDate: '2026-08-01',
  });
  assert.equal(matching.revenue.value, 100);
  assert.equal(matching.net_income.value, 20);
  assert.equal(matching.eps.value, 1.2);

  const wrongAccession = bindCoreFactsToFiling(facts, {
    accessionNumber: '0000000001-26-000002',
    reportDate: '2026-06-30',
    filingDate: '2026-08-01',
  });
  assert.equal(wrongAccession.revenue, null);
  assert.equal(wrongAccession.net_income, null);
  assert.equal(wrongAccession.eps, null);

  const wrongPeriod = bindCoreFactsToFiling(facts, {
    accessionNumber: '0000000001-26-000001',
    reportDate: '2026-09-30',
    filingDate: '2026-08-01',
  });
  assert.equal(wrongPeriod.revenue, null);
  assert.equal(wrongPeriod.net_income, null);
  assert.equal(wrongPeriod.eps, null);

  const wrongFiledDate = bindCoreFactsToFiling(facts, {
    accessionNumber: '0000000001-26-000001',
    reportDate: '2026-06-30',
    filingDate: '2026-08-02',
  });
  assert.equal(wrongFiledDate.revenue, null);
  assert.equal(wrongFiledDate.net_income, null);
  assert.equal(wrongFiledDate.eps, null);
});


test('rejects blank SEC concept identifiers', () => {
  const result = normalizeSecCoreFacts({
    revenue: { ...fact(100, 'USD'), concept: '   ' },
    net_income: fact(20, 'USD', concepts.net_income),
    eps: fact(1.2, 'USD/shares', concepts.eps),
  });
  assert.equal(result.revenue, null);
  assert.equal(result.net_income.value, 20);
  assert.equal(result.eps.value, 1.2);
});


test('rejects a valid-looking but wrong XBRL concept for a core metric', () => {
  const result = normalizeSecCoreFacts({
    revenue: fact(100, 'USD', 'NetIncomeLoss'),
    net_income: fact(20, 'USD', concepts.net_income),
    eps: fact(1.2, 'USD/shares', concepts.eps),
  });
  assert.equal(result.revenue, null);
  assert.equal(result.net_income.value, 20);
  assert.equal(result.eps.value, 1.2);
});
