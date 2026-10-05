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

const isValidFilingIdentity = filing =>
  /^\d{10}-\d{2}-\d{6}$/.test(String(filing?.accessionNumber || '')) &&
  ['10-K', '10-Q'].includes(filing?.formType) &&
  /^\d{4}-\d{2}-\d{2}$/.test(String(filing?.reportDate || ''));

const daysBetween = (start, end) => {
  if (!start || !end) return null;
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return null;
  return Math.round((endMs - startMs) / 86400000);
};

const hasExpectedDuration = (item, formType) => {
  const days = daysBetween(item?.start, item?.end);
  if (days === null) return false;
  // Income-statement metrics in a 10-Q should represent the quarter, not a
  // six- or nine-month year-to-date context sharing the same end date.
  if (formType === '10-Q') return days >= 70 && days <= 110;
  // Annual issuers vary (52/53-week calendars), so keep a tolerant annual band.
  if (formType === '10-K') return days >= 330 && days <= 400;
  return false;
};

const findMatchingFact = (facts, metric, filing) => {
  if (!isValidFilingIdentity(filing)) return null;
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
          Number.isFinite(item?.val) &&
          hasExpectedDuration(item, filing.formType)
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
