const DAY_MS = 86400000;

const durationDays = item => {
  const start = Date.parse(item?.start);
  const end = Date.parse(item?.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.round((end - start) / DAY_MS);
};

const endDistanceDays = (a, b) => Math.abs(Date.parse(a) - Date.parse(b)) / DAY_MS;

export const selectPriorComparableFact = (facts, currentFact, filing) => {
  if (!Array.isArray(facts) || !currentFact?.reportDate || !currentFact?.concept) return null;
  const currentEnd = Date.parse(currentFact.reportDate);
  if (!Number.isFinite(currentEnd)) return null;

  const targetEnd = new Date(currentEnd);
  targetEnd.setUTCFullYear(targetEnd.getUTCFullYear() - 1);
  const targetEndDate = targetEnd.toISOString().slice(0, 10);
  const expectedDuration =
    filing?.formType === '10-Q' ? [70, 110] :
    filing?.formType === '10-K' ? [330, 400] :
    null;
  if (!expectedDuration || !/^\d{10}-\d{2}-\d{6}$/.test(String(filing?.accessionNumber || ''))) return null;

  const candidates = facts.filter(item => {
    const days = durationDays(item);
    return (
      item?.form === filing?.formType &&
      item?.end &&
      Number.isFinite(item?.val) &&
      days !== null &&
      days >= expectedDuration[0] &&
      days <= expectedDuration[1] &&
      endDistanceDays(item.end, targetEndDate) <= 14 &&
      item?.accn !== filing?.accessionNumber &&
      /^\d{10}-\d{2}-\d{6}$/.test(String(item?.accn || '')) &&
      /^\d{4}-\d{2}-\d{2}$/.test(String(item?.filed || ''))
    );
  });

  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    const distance = endDistanceDays(a.end, targetEndDate) - endDistanceDays(b.end, targetEndDate);
    if (distance !== 0) return distance;
    return String(b.filed || '').localeCompare(String(a.filed || ''));
  });

  const item = candidates[0];
  return { value: item.val, end: item.end, start: item.start, accessionNumber: item.accn, filed: item.filed };
};
