import { extractCoreFactsForFiling } from './secCoreFacts.js';
import { extractPriorComparableCoreFacts } from './secPriorCoreFacts.js';
import { normalizeSecCoreFacts, inferCoreFactsCurrency } from './secFactNormalization.js';
import { calculateCoreMetricChanges } from './secMetricChanges.js';

export const deriveSecFinancials = (facts, filing) => {
  const currentRaw = extractCoreFactsForFiling(facts, filing);
  const priorRaw = extractPriorComparableCoreFacts(facts, currentRaw, filing);
  const current = normalizeSecCoreFacts(currentRaw);
  const prior = normalizeSecCoreFacts(priorRaw);
  return {
    coreFacts: current,
    priorCoreFacts: prior,
    coreMetricChanges: calculateCoreMetricChanges(current, prior),
    currency: inferCoreFactsCurrency(current),
  };
};
