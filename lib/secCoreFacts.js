const CONCEPTS = {
  revenue: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet'],
  net_income: ['NetIncomeLoss'],
  eps: ['EarningsPerShareDiluted'],
};

const UNITS = {
  revenue: ['USD'],
  net_income: ['USD'],
  eps: ['USD/shares'],
};

const findMatchingFact = (facts, metric, filing) => {
  const usGaap = facts?.['us-gaap'];
  if (!usGaap) return null;

  for (const concept of CONCEPTS[metric]) {
    const node = usGaap[concept];
    if (!node?.units) continue;

    for (const unit of UNITS[metric]) {
      const candidates = Array.isArray(node.units[unit]) ? node.units[unit] : [];
      const exact = candidates
        .filter(item =>
          item?.accn === filing.accessionNumber &&
          item?.form === filing.formType &&
          item?.end === filing.reportDate &&
          Number.isFinite(item?.val)
        )
        .sort((a, b) => String(b.filed || '').localeCompare(String(a.filed || '')));

      if (exact.length) {
        const item = exact[0];
        return {
          value: item.val,
          unit,
          concept,
          accessionNumber: item.accn,
          reportDate: item.end,
          filed: item.filed,
        };
      }
    }
  }

  return null;
};

export const extractCoreFactsForFiling = (facts, filing) => ({
  revenue: findMatchingFact(facts, 'revenue', filing),
  net_income: findMatchingFact(facts, 'net_income', filing),
  eps: findMatchingFact(facts, 'eps', filing),
});
