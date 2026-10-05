import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchSecCompanyFacts } from './secCompanyFactsFetch.js';

test('fetches and validates SEC company facts for the requested CIK', async () => {
  let requestedUrl = '';
  const fetchImpl = async (url, options) => {
    requestedUrl = url;
    assert.equal(options.headers['User-Agent'], 'Silent Empire test contact@example.com');
    return {
      ok: true,
      json: async () => ({ cik: 320193, entityName: 'Apple Inc.', facts: { 'us-gaap': {} } }),
    };
  };
  const result = await fetchSecCompanyFacts('320193', 'Silent Empire test contact@example.com', fetchImpl);
  assert.equal(requestedUrl, 'https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json');
  assert.equal(result.cik, '320193');
});

test('rejects mismatched SEC company facts payloads', async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ cik: 723125, entityName: 'Micron Technology, Inc.', facts: {} }),
  });
  await assert.rejects(
    fetchSecCompanyFacts('320193', 'Silent Empire test contact@example.com', fetchImpl),
    /Invalid SEC company facts response/
  );
});

test('rejects invalid CIK and missing SEC identity before network access', async () => {
  const shouldNotFetch = async () => { throw new Error('network should not be called'); };
  await assert.rejects(fetchSecCompanyFacts('bad', 'ua', shouldNotFetch), /Invalid CIK/);
  await assert.rejects(fetchSecCompanyFacts('320193', '', shouldNotFetch), /SEC API configuration missing/);
});
