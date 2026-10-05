const CORE_METRICS = ['revenue', 'net_income', 'eps'];

export const verifyCoreMetrics = (perspectives, expected) => {
  if (!perspectives || !expected) return false;

  const available = CORE_METRICS.filter(name => expected?.[name]);
  if (!available.length) return false;

  return ['analyst', 'simple', 'human'].every(mode =>
    available.every(name => {
      const actual = perspectives?.[mode]?.key_metrics?.[name];
      const reference = expected[name];
      if (!actual || !reference) return false;

      return (
        actual.value === reference.value &&
        actual.unit === reference.unit
      );
    })
  );
};

export const hasVerifiedCoreMetrics = expected =>
  CORE_METRICS.some(name => Boolean(expected?.[name]));
