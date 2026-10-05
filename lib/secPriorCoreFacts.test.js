import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPriorComparableCoreFacts } from './secPriorCoreFacts.js';

const filing = { formType: '10-Q', accessionNumber: '0000000001-26-000001' };
const currentFacts = {
  revenue: { concept: 'RevenueFromContractWithCustomerExcludingAssessedTax', reportDate: '2026-06-30', value: 120, unit: 'USD' },
  net_income: { concept: 'NetIncomeLoss', reportDate: '2026-06-30', value: 15, unit: 'USD' },
  eps: { concept: 'EarningsPerShareDiluted', reportDate: '2026-06-30', value: 2, unit: 'USD/shares' },
};
const fact = (val, form='10-Q') => ({ val, form, start:'2025-04-01', end:'2025-06-30', accn:'0000000001-25-000001', filed:'2025-08-01' });

test('extracts prior comparable facts using SEC concepts and units', () => {
  const facts = { 'us-gaap': {
    RevenueFromContractWithCustomerExcludingAssessedTax: { units: { USD: [fact(100)] } },
    NetIncomeLoss: { units: { USD: [fact(20)] } },
    EarningsPerShareDiluted: { units: { 'USD/shares': [fact(1.6)] } },
  }};
  const result = extractPriorComparableCoreFacts(facts, currentFacts, filing);
  assert.equal(result.revenue.value, 100);
  assert.equal(result.net_income.value, 20);
  assert.equal(result.eps.value, 1.6);
  assert.equal(result.eps.unit, 'USD/shares');
});

test('leaves missing comparable metrics null', () => {
  const result = extractPriorComparableCoreFacts({ 'us-gaap': {} }, currentFacts, filing);
  assert.deepEqual(result, { revenue: null, net_income: null, eps: null });
});


test('does not select a prior comparable from a unit that differs from the current fact', () => {
  const facts = { 'us-gaap': {
    RevenueFromContractWithCustomerExcludingAssessedTax: { units: { USD: [fact(100)] } },
  }};
  const mismatchedCurrent = {
    ...currentFacts,
    revenue: { ...currentFacts.revenue, unit: 'CAD' },
  };
  const result = extractPriorComparableCoreFacts(facts, mismatchedCurrent, filing);
  assert.equal(result.revenue, null);
});
