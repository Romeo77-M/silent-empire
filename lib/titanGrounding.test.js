import test from 'node:test';
import assert from 'node:assert/strict';
import { hasUnsupportedCausalClaims } from '../api/titan.js';

const makeResponse = text => ({
  perspectives: {
    analyst: { summary: { headline: 'Headline', executive_takeaway: text }, risk_assessment: { primary_risks: [], mitigating_factors: [] }, insights: [], what_this_means: { summary_view: 'Meaning' } },
    simple: { summary: { headline: 'Headline', executive_takeaway: 'Takeaway' }, risk_assessment: { primary_risks: [], mitigating_factors: [] }, insights: [], what_this_means: { summary_view: 'Meaning' } },
    human: { summary: { headline: 'Headline', executive_takeaway: 'Takeaway' }, risk_assessment: { primary_risks: [], mitigating_factors: [] }, insights: [], what_this_means: { summary_view: 'Meaning' } },
  },
});

test('allows narrative without causal language', () => {
  assert.equal(hasUnsupportedCausalClaims(makeResponse('Revenue increased year over year.'), 'Revenue increased year over year.'), false);
});

test('rejects causal phrase absent from selected filing evidence', () => {
  assert.equal(hasUnsupportedCausalClaims(makeResponse('Revenue increased due to stronger demand.'), 'Revenue increased year over year.'), true);
});

test('allows causal phrase represented in selected filing evidence', () => {
  assert.equal(hasUnsupportedCausalClaims(makeResponse('Revenue increased due to stronger demand.'), 'Revenue increased due to stronger demand.'), false);
});

test('checks causal language inside insights', () => {
  const response = makeResponse('Takeaway');
  response.perspectives.human.insights = [{ type: 'positive', text: 'Margins benefited from lower costs.' }];
  assert.equal(hasUnsupportedCausalClaims(response, 'Margins improved during the period.'), true);
});
