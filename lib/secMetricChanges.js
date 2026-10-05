const percentChange = (current, previous) => {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

export const calculateCoreMetricChanges = (currentFacts, priorFacts) => {
  const result = {};
  for (const metric of ['revenue', 'net_income', 'eps']) {
    const current = currentFacts?.[metric];
    const prior = priorFacts?.[metric];
    if (!current || !prior || current.unit !== prior.unit) {
      result[metric] = null;
      continue;
    }
    const change = percentChange(current.value, prior.value);
    result[metric] = Number.isFinite(change) ? change : null;
  }
  return result;
};

export const applyVerifiedMetricChanges = (perspectives, changes) => {
  if (!perspectives || !changes) return perspectives;
  for (const mode of ['analyst', 'simple', 'human']) {
    for (const metric of ['revenue', 'net_income', 'eps']) {
      if (Number.isFinite(changes[metric]) && perspectives?.[mode]?.key_metrics?.[metric]) {
        perspectives[mode].key_metrics[metric].change_pct = changes[metric];
      }
    }
  }
  return perspectives;
};
