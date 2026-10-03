export const normalizeDailyBars = (values) => {
  if (!Array.isArray(values)) return { data: [], rejectedRows: 0, duplicateDates: [] };

  let rejectedRows = 0;
  const byDate = new Map();
  const duplicateDates = [];

  for (const row of values) {
    const normalized = {
      date: String(row?.datetime || '').slice(0, 10),
      open: Number(row?.open),
      high: Number(row?.high),
      low: Number(row?.low),
      close: Number(row?.close),
    };

    const valid =
      /^\d{4}-\d{2}-\d{2}$/.test(normalized.date) &&
      [normalized.open, normalized.high, normalized.low, normalized.close].every(Number.isFinite) &&
      normalized.open > 0 &&
      normalized.high > 0 &&
      normalized.low > 0 &&
      normalized.close > 0 &&
      normalized.low <= Math.min(normalized.open, normalized.close) &&
      normalized.high >= Math.max(normalized.open, normalized.close) &&
      normalized.low <= normalized.high;

    if (!valid) {
      rejectedRows += 1;
      continue;
    }

    if (byDate.has(normalized.date)) duplicateDates.push(normalized.date);
    byDate.set(normalized.date, normalized);
  }

  return {
    data: Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date)),
    rejectedRows,
    duplicateDates: Array.from(new Set(duplicateDates)).sort(),
  };
};

export const validateProviderIdentity = (meta, requestedTicker) => {
  const providerSymbol = String(meta?.symbol || '').trim().toUpperCase();
  const requested = String(requestedTicker || '').trim().toUpperCase();
  return !providerSymbol || providerSymbol === requested;
};
