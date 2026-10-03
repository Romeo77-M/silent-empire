import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDailyBars, validateProviderIdentity } from './marketDataIntegrity.js';

test('normalizes and chronologically sorts valid OHLC rows', () => {
  const result = normalizeDailyBars([
    { datetime: '2026-10-02', open: '10', high: '12', low: '9', close: '11' },
    { datetime: '2026-10-01', open: '9', high: '11', low: '8', close: '10' },
  ]);
  assert.deepEqual(result.data.map(row => row.date), ['2026-10-01', '2026-10-02']);
  assert.equal(result.rejectedRows, 0);
});

test('rejects impossible, non-numeric, zero, and malformed bars', () => {
  const result = normalizeDailyBars([
    { datetime: 'bad', open: '10', high: '12', low: '9', close: '11' },
    { datetime: '2026-10-01', open: '10', high: '9', low: '8', close: '11' },
    { datetime: '2026-10-02', open: '0', high: '1', low: '0', close: '1' },
    { datetime: '2026-10-03', open: 'x', high: '12', low: '9', close: '11' },
  ]);
  assert.equal(result.data.length, 0);
  assert.equal(result.rejectedRows, 4);
});

test('deduplicates dates and reports duplicates', () => {
  const result = normalizeDailyBars([
    { datetime: '2026-10-01', open: '9', high: '11', low: '8', close: '10' },
    { datetime: '2026-10-01', open: '10', high: '12', low: '9', close: '11' },
  ]);
  assert.equal(result.data.length, 1);
  assert.deepEqual(result.duplicateDates, ['2026-10-01']);
  assert.equal(result.data[0].close, 11);
});

test('checks provider symbol identity when metadata is present', () => {
  assert.equal(validateProviderIdentity({ symbol: 'MU' }, 'MU'), true);
  assert.equal(validateProviderIdentity({ symbol: 'AAPL' }, 'MU'), false);
  assert.equal(validateProviderIdentity({}, 'MU'), true);
});
