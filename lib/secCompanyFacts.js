export const CIK_PATTERN = /^\d{1,10}$/;

export const normalizeCik = cik => {
  const value = String(cik || '').trim();
  if (!CIK_PATTERN.test(value)) return null;
  return value.padStart(10, '0');
};

export const validateCompanyFactsPayload = (payload, cik) => {
  const paddedCik = normalizeCik(cik);
  if (!paddedCik || !payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  if (!payload.facts || typeof payload.facts !== 'object' || Array.isArray(payload.facts)) return null;

  const payloadCik = String(payload.cik ?? '').trim();
  if (!/^\d{1,10}$/.test(payloadCik) || payloadCik.padStart(10, '0') !== paddedCik) return null;

  return {
    cik: String(Number(payloadCik)),
    entityName: String(payload.entityName || ''),
    facts: payload.facts,
  };
};
