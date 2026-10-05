import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCoreMetricChanges, applyVerifiedMetricChanges } from './secMetricChanges.js';

const f = (value, unit = 'USD') => ({ value, unit });

test('calculates deterministic comparable-period percentage changes', () => {
  const changes = calculateCoreMetricChanges(
    { revenue: f(120), net_income: f(15), eps: f(2, 'USD') },
    { revenue: f(100), net_income: f(20), eps: f(1.6, 'USD') },
  );
  assert.equal(changes.revenue, 20);
  assert.equal(changes.net_income, -25);
  assert.ok(Math.abs(changes.eps - 25) < 1e-10);
});

test('does not calculate change from zero or mismatched units', () => {
  const changes = calculateCoreMetricChanges(
    { revenue: f(120), net_income: f(15, 'CAD') },
    { revenue: f(0), net_income: f(20, 'USD') },
  );
  assert.equal(changes.revenue, null);
  assert.equal(changes.net_income, null);
});

test('uses absolute prior value denominator for loss comparisons', () => {
  const changes = calculateCoreMetricChanges(
    { net_income: f(-50) },
    { net_income: f(-100) },
  );
  assert.equal(changes.net_income, 50);
});

test('uses verified changes and clears unverified model changes across all perspectives', () => {
  const perspectives = Object.fromEntries(['analyst','simple','human'].map(mode => [mode, {
    key_metrics: {
      revenue: { value: 120, unit: 'USD', change_pct: 999 },
      net_income: { value: 15, unit: 'USD', change_pct: 999 },
      eps: { value: 2, unit: 'USD', change_pct: 999 },
    },
  }]));
  applyVerifiedMetricChanges(perspectives, { revenue: 20, net_income: null, eps: 25 });
  for (const mode of ['analyst','simple','human']) {
    assert.equal(perspectives[mode].key_metrics.revenue.change_pct, 20);
    assert.equal(perspectives[mode].key_metrics.net_income.change_pct, null);
    assert.equal(perspectives[mode].key_metrics.eps.change_pct, 25);
  }
});
