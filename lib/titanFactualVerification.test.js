import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyCoreMetrics, hasVerifiedCoreMetrics } from './titanFactualVerification.js';

const body = values => ({
  key_metrics: {
    revenue: { value: values.revenue ?? 100, unit: 'USD', change_pct: 0 },
    net_income: { value: values.net_income ?? 20, unit: 'USD', change_pct: 0 },
    eps: { value: values.eps ?? 1.5, unit: 'USD/shares', change_pct: 0 },
  },
});

const perspectives = values => ({
  analyst: body(values),
  simple: body(values),
  human: body(values),
});

test('verifies only SEC metrics that are actually available', () => {
  const expected = {
    revenue: { value: 100, unit: 'USD' },
    net_income: null,
    eps: null,
  };
  assert.equal(hasVerifiedCoreMetrics(expected), true);
  assert.equal(verifyCoreMetrics(perspectives({}), expected), true);
});

test('rejects disagreement on an available SEC metric', () => {
  const expected = {
    revenue: { value: 100, unit: 'USD' },
    net_income: null,
    eps: null,
  };
  const result = perspectives({});
  result.human.key_metrics.revenue.value = 101;
  assert.equal(verifyCoreMetrics(result, expected), false);
});

test('does not claim verification when SEC supplied no core metrics', () => {
  const expected = { revenue: null, net_income: null, eps: null };
  assert.equal(hasVerifiedCoreMetrics(expected), false);
  assert.equal(verifyCoreMetrics(perspectives({}), expected), false);
});

test('checks units as well as values', () => {
  const expected = { revenue: null, net_income: null, eps: { value: 1.5, unit: 'USD/shares' } };
  const result = perspectives({});
  result.simple.key_metrics.eps.unit = 'USD';
  assert.equal(verifyCoreMetrics(result, expected), false);
});
