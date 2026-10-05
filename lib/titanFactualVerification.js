const CORE_METRICS = ['revenue', 'net_income', 'eps'];

export const verifyCoreMetrics = (perspectives, expected) => {
  if (!perspectives || !expected) return false;

  return ['analyst', 'simple', 'human'].every(mode =>
    CORE_METRICS.every(name => {
      const actual = perspectives?.[mode]?.key_metrics?.[name];
      const reference = expected?.[name];
      if (!actual || !reference) return false;

      return (
        actual.value === reference.value &&
        actual.unit === reference.unit
      );
    })
  );
};
