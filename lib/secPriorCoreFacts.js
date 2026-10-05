import { SEC_CORE_CONCEPTS, SEC_CORE_UNITS } from './secCoreFacts.js';
import { selectPriorComparableFact } from './secComparablePeriod.js';

export const extractPriorComparableCoreFacts = (facts, currentFacts, filing) => {
  const usGaap = facts?.['us-gaap'];
  const result = { revenue: null, net_income: null, eps: null };
  if (!usGaap) return result;

  for (const metric of Object.keys(result)) {
    const current = currentFacts?.[metric];
    if (!current) continue;

    for (const concept of SEC_CORE_CONCEPTS[metric]) {
      const node = usGaap[concept];
      if (!node?.units) continue;
      for (const unit of SEC_CORE_UNITS[metric]) {
        if (unit !== current.unit && !(metric === 'eps' && current.unit === 'USD' && unit === 'USD/shares')) continue;
        const selected = selectPriorComparableFact(node.units[unit], current, filing);
        if (selected) {
          result[metric] = { ...selected, unit, concept };
          break;
        }
      }
      if (result[metric]) break;
    }
  }
  return result;
};
