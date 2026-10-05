import test from 'node:test';
import assert from 'node:assert/strict';
import { hasUnsupportedCausalClaims } from './titanGrounding.js';

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


test('recognizes grammatical variants of guarded causal phrases', () => {
  assert.equal(hasUnsupportedCausalClaims(makeResponse('Margins benefit from lower costs.'), 'Margins improved during the period.'), true);
  assert.equal(hasUnsupportedCausalClaims(makeResponse('Margins benefited from lower costs.'), 'Margins benefited from lower costs.'), false);
  assert.equal(hasUnsupportedCausalClaims(makeResponse('The decline resulted from weaker demand.'), 'The decline resulted from weaker demand.'), false);
  assert.equal(hasUnsupportedCausalClaims(makeResponse('The decline was caused by weaker demand.'), 'The decline was caused by weaker demand.'), false);
});
