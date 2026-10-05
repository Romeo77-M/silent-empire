const CURRENCY_UNITS = new Set(['USD', 'CAD', 'EUR', 'GBP', 'JPY']);

export const normalizeSecCoreFacts = coreFacts => {
  const normalize = (metric, fact) => {
    if (!fact || !Number.isFinite(fact.value)) return null;

    if (metric === 'eps') {
      const match = /^([A-Z]{3})\/shares$/.exec(String(fact.unit || ''));
      if (!match || !CURRENCY_UNITS.has(match[1])) return null;
      return { ...fact, value: fact.value, unit: match[1] };
    }

    const currency = String(fact.unit || '');
    if (!CURRENCY_UNITS.has(currency)) return null;

    // SEC companyfacts currency values are raw monetary amounts. Preserve the
    // raw value; presentation formatting must not silently rescale accounting data.
    return { ...fact, value: fact.value, unit: currency };
  };

  return {
    revenue: normalize('revenue', coreFacts?.revenue),
    net_income: normalize('net_income', coreFacts?.net_income),
    eps: normalize('eps', coreFacts?.eps),
  };
};

export const inferCoreFactsCurrency = coreFacts => {
  const currencies = [coreFacts?.revenue?.unit, coreFacts?.net_income?.unit, coreFacts?.eps?.unit]
    .filter(Boolean);
  if (!currencies.length) return null;
  return currencies.every(unit => unit === currencies[0]) ? currencies[0] : null;
};
