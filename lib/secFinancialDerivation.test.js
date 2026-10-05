import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveSecFinancials } from './secFinancialDerivation.js';

const currentAccn = '0000000001-26-000001';
const priorAccn = '0000000001-25-000001';
const filing = { accessionNumber: currentAccn, formType: '10-Q', reportDate: '2026-06-30' };
const item = (val, accn, start, end, filed) => ({ val, accn, form: '10-Q', start, end, filed });

test('derives current SEC facts and prior-year changes from one company-facts payload', () => {
  const facts = { 'us-gaap': {
    RevenueFromContractWithCustomerExcludingAssessedTax: { units: { USD: [
      item(120, currentAccn, '2026-04-01', '2026-06-30', '2026-08-01'),
      item(100, priorAccn, '2025-04-01', '2025-06-30', '2025-08-01'),
    ]}},
    NetIncomeLoss: { units: { USD: [
      item(15, currentAccn, '2026-04-01', '2026-06-30', '2026-08-01'),
      item(20, priorAccn, '2025-04-01', '2025-06-30', '2025-08-01'),
    ]}},
    EarningsPerShareDiluted: { units: { 'USD/shares': [
      item(2, currentAccn, '2026-04-01', '2026-06-30', '2026-08-01'),
      item(1.6, priorAccn, '2025-04-01', '2025-06-30', '2025-08-01'),
    ]}},
  }};

  const result = deriveSecFinancials(facts, filing);
  assert.equal(result.coreFacts.revenue.value, 120);
  assert.equal(result.coreFacts.eps.unit, 'USD');
  assert.equal(result.priorCoreFacts.revenue.value, 100);
  assert.equal(result.coreMetricChanges.revenue, 20);
  assert.equal(result.coreMetricChanges.net_income, -25);
  assert.ok(Math.abs(result.coreMetricChanges.eps - 25) < 1e-10);
  assert.equal(result.currency, 'USD');
});

test('fails closed to null facts and changes when filing identity does not match', () => {
  const result = deriveSecFinancials({ 'us-gaap': {} }, filing);
  assert.deepEqual(result.coreFacts, { revenue: null, net_income: null, eps: null });
  assert.deepEqual(result.coreMetricChanges, { revenue: null, net_income: null, eps: null });
  assert.equal(result.currency, null);
});
