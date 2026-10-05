import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSecCoreFacts, inferCoreFactsCurrency } from './secFactNormalization.js';

const fact = (value, unit) => ({ value, unit, concept: 'x', accessionNumber: '0000000001-26-000001', reportDate: '2026-06-30', filed: '2026-08-01' });

test('preserves raw monetary values and normalizes EPS currency-per-share units', () => {
  const result = normalizeSecCoreFacts({
    revenue: fact(416161000000, 'USD'),
    net_income: fact(112010000000, 'USD'),
    eps: fact(7.46, 'USD/shares'),
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
    net_income: fact(20, 'USD'),
    eps: fact(1.2, 'pure'),
  });
  assert.equal(result.revenue, null);
  assert.equal(result.net_income.unit, 'USD');
  assert.equal(result.eps, null);
});

test('does not infer currency from conflicting structured facts', () => {
  const result = normalizeSecCoreFacts({
    revenue: fact(100, 'USD'),
    net_income: fact(20, 'CAD'),
    eps: null,
  });
  assert.equal(inferCoreFactsCurrency(result), null);
});
