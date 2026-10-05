import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMetricValue } from './metricFormatting.js';

test('formats large raw values without mutating their scale', () => {
  assert.deepEqual(formatMetricValue({ value: 416161000000, unit: 'USD' }), { value: '416', suffix: 'B USD' });
  assert.deepEqual(formatMetricValue({ value: 112010000000, unit: 'USD' }), { value: '112', suffix: 'B USD' });
});

test('formats millions and trillions for display only', () => {
  assert.deepEqual(formatMetricValue({ value: 12500000, unit: 'CAD' }), { value: '12.5', suffix: 'M CAD' });
  assert.deepEqual(formatMetricValue({ value: 1200000000000, unit: 'USD' }), { value: '1.2', suffix: 'T USD' });
});

test('preserves sign and handles smaller monetary values', () => {
  assert.deepEqual(formatMetricValue({ value: -2500000000, unit: 'USD' }), { value: '-2.5', suffix: 'B USD' });
  assert.deepEqual(formatMetricValue({ value: 950000, unit: 'USD' }), { value: '950,000', suffix: 'USD' });
});

test('keeps per-share values unscaled', () => {
  assert.deepEqual(formatMetricValue({ value: 7.46, unit: 'USD', isPerShare: true }), { value: '7.46', suffix: '' });
});
