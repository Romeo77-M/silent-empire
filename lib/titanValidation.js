const MAX_TEXT = 4000;
const MAX_LIST_ITEMS = 12;

const isText = (value, max = MAX_TEXT) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;

const isMetric = metric =>
  metric &&
  Number.isFinite(metric.value) &&
  isText(metric.unit, 32) &&
  Number.isFinite(metric.change_pct);

const isBody = body =>
  body &&
  isText(body.summary?.headline, 300) &&
  isText(body.summary?.tone, 100) &&
  isText(body.summary?.executive_takeaway) &&
  isMetric(body.key_metrics?.revenue) &&
  isMetric(body.key_metrics?.net_income) &&
  isMetric(body.key_metrics?.eps) &&
  ['low', 'moderate', 'high'].includes(body.risk_assessment?.risk_tier) &&
  Array.isArray(body.risk_assessment?.primary_risks) &&
  body.risk_assessment.primary_risks.length <= MAX_LIST_ITEMS &&
  body.risk_assessment.primary_risks.every(item => isText(item)) &&
  Array.isArray(body.risk_assessment?.mitigating_factors) &&
  body.risk_assessment.mitigating_factors.length <= MAX_LIST_ITEMS &&
  body.risk_assessment.mitigating_factors.every(item => isText(item)) &&
  Array.isArray(body.insights) &&
  body.insights.length <= MAX_LIST_ITEMS &&
  body.insights.every(insight =>
    insight &&
    ['positive', 'negative', 'neutral'].includes(insight.type) &&
    isText(insight.text)
  ) &&
  isText(body.what_this_means?.summary_view);

export const validateTitanResponse = (value, requestedTicker) => {
  if (!value || typeof value !== 'object') return false;

  const ticker = String(value.meta?.ticker || '').trim().toUpperCase();
  if (ticker !== String(requestedTicker || '').trim().toUpperCase()) return false;

  return (
    isText(value.meta?.company_name, 300) &&
    isText(value.meta?.report_type, 50) &&
    isText(value.meta?.fiscal_period, 200) &&
    isText(value.meta?.currency, 20) &&
    (value.meta.fiscal_period === 'not_available' || !/unknown|unsure|guess/i.test(value.meta.fiscal_period)) &&
    (value.meta.currency === 'not_available' || /^[A-Z]{3}$/.test(value.meta.currency)) &&
    isText(value.meta?.filing_date, 50) &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.meta.filing_date) &&
    (value.meta?.report_date === 'not_available' || /^\d{4}-\d{2}-\d{2}$/.test(value.meta?.report_date || '')) &&
    /^\d{10}-\d{2}-\d{6}$/.test(value.meta?.accession_number || '') &&
    isBody(value.perspectives?.analyst) &&
    isBody(value.perspectives?.simple) &&
    isBody(value.perspectives?.human)
  );
};
