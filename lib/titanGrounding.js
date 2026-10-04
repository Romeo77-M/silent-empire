const CAUSAL_PATTERNS = [
  { label: 'due to', pattern: /\bdue to\b/i },
  { label: 'because of', pattern: /\bbecause of\b/i },
  { label: 'driven by', pattern: /\bdriven by\b/i },
  { label: 'benefit from', pattern: /\bbenefit(?:ed|s|ing)? from\b/i },
  { label: 'result from', pattern: /\bresult(?:ed|s|ing)? from\b/i },
  { label: 'caused by', pattern: /\bcaus(?:e|ed|es|ing) by\b/i },
  { label: 'attributable to', pattern: /\battributable to\b/i },
];

const findCausalPhrases = value => {
  const text = String(value || '');
  return CAUSAL_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
};

const collectNarrativeText = parsed => {
  const bodies = ['analyst', 'simple', 'human'].map(key => parsed?.perspectives?.[key]).filter(Boolean);
  return bodies.flatMap(body => [
    body.summary?.headline,
    body.summary?.executive_takeaway,
    ...(body.risk_assessment?.primary_risks || []),
    ...(body.risk_assessment?.mitigating_factors || []),
    ...(body.insights || []).map(insight => insight?.text),
    body.what_this_means?.summary_view,
  ]).filter(Boolean);
};

export const hasUnsupportedCausalClaims = (parsed, filingEvidence) => {
  const evidence = String(filingEvidence || '');
  return collectNarrativeText(parsed).some(text =>
    findCausalPhrases(text).some(label => {
      const causalPattern = CAUSAL_PATTERNS.find(item => item.label === label)?.pattern;
      return causalPattern ? !causalPattern.test(evidence) : false;
    })
  );
};
