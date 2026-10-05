import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCoreFactsForFiling } from './secCoreFacts.js';

const filing = {
  accessionNumber: '0000000001-26-000001',
  formType: '10-Q',
  reportDate: '2026-06-30',
};

const fact = (val, overrides = {}) => ({
  val,
  accn: filing.accessionNumber,
  form: filing.formType,
  end: filing.reportDate,
  filed: '2026-08-01',
  start: '2026-04-01',
  ...overrides,
});

const factsWith = ({ revenue = [], salesRevenue = [], netIncome = [], eps = [] } = {}) => ({
  'us-gaap': {
    RevenueFromContractWithCustomerExcludingAssessedTax: { units: { USD: revenue } },
    SalesRevenueNet: { units: { USD: salesRevenue } },
    NetIncomeLoss: { units: { USD: netIncome } },
    EarningsPerShareDiluted: { units: { 'USD/shares': eps } },
  },
});

test('extracts exact filing facts for revenue, net income, and diluted EPS', () => {
  const result = extractCoreFactsForFiling(factsWith({
    revenue: [fact(100)],
    netIncome: [fact(20)],
    eps: [fact(1.25)],
  }), filing);

  assert.equal(result.revenue.value, 100);
  assert.equal(result.net_income.value, 20);
  assert.equal(result.eps.value, 1.25);
});

test('rejects facts from a different accession, period, or form', () => {
  const result = extractCoreFactsForFiling(factsWith({
    revenue: [
      fact(100, { accn: '0000000001-26-999999' }),
      fact(101, { end: '2026-03-31' }),
      fact(102, { form: '10-K' }),
    ],
  }), filing);

  assert.equal(result.revenue, null);
});

test('uses the newest filed duplicate only when filing identity is exact', () => {
  const result = extractCoreFactsForFiling(factsWith({
    revenue: [
      fact(100, { filed: '2026-07-31' }),
      fact(105, { filed: '2026-08-02' }),
    ],
  }), filing);

  assert.equal(result.revenue.value, 105);
  assert.equal(result.revenue.filed, '2026-08-02');
});

test('falls back to alternate SEC revenue concept', () => {
  const result = extractCoreFactsForFiling(factsWith({
    salesRevenue: [fact(250)],
  }), filing);

  assert.equal(result.revenue.value, 250);
  assert.equal(result.revenue.concept, 'SalesRevenueNet');
});

test('returns null for missing core metrics instead of inventing zero', () => {
  const result = extractCoreFactsForFiling(factsWith(), filing);
  assert.deepEqual(result, { revenue: null, net_income: null, eps: null });
});

test('ignores non-finite SEC values', () => {
  const result = extractCoreFactsForFiling(factsWith({
    revenue: [fact(Number.NaN)],
    netIncome: [fact(Number.POSITIVE_INFINITY)],
  }), filing);

  assert.equal(result.revenue, null);
  assert.equal(result.net_income, null);
});


test('10-Q selects quarterly duration instead of year-to-date context with same end date', () => {
  const result = extractCoreFactsForFiling(factsWith({
    revenue: [
      fact(300, { start: '2026-01-01' }),
      fact(110, { start: '2026-04-01' }),
    ],
  }), filing);

  assert.equal(result.revenue.value, 110);
});

test('10-Q rejects a year-to-date-only income statement fact', () => {
  const result = extractCoreFactsForFiling(factsWith({
    netIncome: [fact(60, { start: '2026-01-01' })],
  }), filing);

  assert.equal(result.net_income, null);
});

test('10-K accepts an annual duration including a 52/53-week calendar', () => {
  const annual = {
    accessionNumber: filing.accessionNumber,
    formType: '10-K',
    reportDate: '2026-12-31',
  };
  const annualFact = {
    val: 500,
    accn: annual.accessionNumber,
    form: '10-K',
    start: '2026-01-01',
    end: annual.reportDate,
    filed: '2027-02-01',
  };
  const facts = factsWith({ revenue: [annualFact] });
  const result = extractCoreFactsForFiling(facts, annual);
  assert.equal(result.revenue.value, 500);
});


test('rejects current facts with malformed filed-date provenance', () => {
  const result = extractCoreFactsForFiling(factsWith({
    revenue: [fact(100, { filed: 'August 1, 2026' })],
  }), filing);
  assert.equal(result.revenue, null);
});
