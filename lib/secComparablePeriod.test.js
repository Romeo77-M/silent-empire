import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPriorComparableFact } from './secComparablePeriod.js';

const current = { concept: 'RevenueFromContractWithCustomerExcludingAssessedTax', reportDate: '2026-06-30' };
const filing = { formType: '10-Q', accessionNumber: '0000000001-26-000001' };
const prior = (val, overrides = {}) => ({
  val, form: '10-Q', start: '2025-04-01', end: '2025-06-30',
  accn: '0000000001-25-000001', filed: '2025-08-01', ...overrides,
});

test('selects same-quarter prior-year fact', () => {
  const result = selectPriorComparableFact([prior(100)], current, filing);
  assert.equal(result.value, 100);
  assert.equal(result.end, '2025-06-30');
});

test('rejects immediately preceding quarter as a comparison', () => {
  const result = selectPriorComparableFact([
    prior(115, { start: '2026-01-01', end: '2026-03-31', accn: '0000000001-26-000000' }),
  ], current, filing);
  assert.equal(result, null);
});

test('rejects prior-year YTD context sharing comparable end date', () => {
  const result = selectPriorComparableFact([
    prior(300, { start: '2025-01-01' }),
  ], current, filing);
  assert.equal(result, null);
});

test('allows small fiscal-calendar drift and picks nearest end date', () => {
  const result = selectPriorComparableFact([
    prior(98, { start: '2025-03-29', end: '2025-06-27' }),
    prior(99, { start: '2025-03-31', end: '2025-06-29', accn: '0000000001-25-000002' }),
  ], current, filing);
  assert.equal(result.value, 99);
  assert.equal(result.end, '2025-06-29');
});

test('rejects current accession even if period metadata looks comparable', () => {
  const result = selectPriorComparableFact([
    prior(100, { accn: filing.accessionNumber }),
  ], current, filing);
  assert.equal(result, null);
});


test('rejects prior comparable facts with malformed provenance', () => {
  assert.equal(selectPriorComparableFact([
    prior(100, { accn: 'bad-accession' }),
  ], current, filing), null);
  assert.equal(selectPriorComparableFact([
    prior(100, { filed: 'August 1, 2025' }),
  ], current, filing), null);
});

test('rejects unsupported filing forms instead of treating them as annual', () => {
  const result = selectPriorComparableFact(
    [prior(100, { form: '8-K', start: '2024-07-01', end: '2025-06-30' })],
    current,
    { formType: '8-K', accessionNumber: filing.accessionNumber }
  );
  assert.equal(result, null);
});
