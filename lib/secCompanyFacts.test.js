import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCik, validateCompanyFactsPayload } from './secCompanyFacts.js';

test('normalizes valid SEC CIKs', () => {
  assert.equal(normalizeCik('320193'), '0000320193');
  assert.equal(normalizeCik('0000320193'), '0000320193');
  assert.equal(normalizeCik('abc'), null);
  assert.equal(normalizeCik('12345678901'), null);
});

test('validates company facts against the requested CIK', () => {
  const payload = { cik: 320193, entityName: 'Apple Inc.', facts: { 'us-gaap': {} } };
  assert.deepEqual(validateCompanyFactsPayload(payload, '0000320193'), {
    cik: '320193',
    entityName: 'Apple Inc.',
    facts: { 'us-gaap': {} },
  });
  assert.equal(validateCompanyFactsPayload(payload, '723125'), null);
});

test('rejects malformed company facts payloads', () => {
  assert.equal(validateCompanyFactsPayload({ cik: 320193, facts: [] }, '320193'), null);
  assert.equal(validateCompanyFactsPayload({ cik: 'not-a-cik', facts: {} }, '320193'), null);
  assert.equal(validateCompanyFactsPayload(null, '320193'), null);
});
