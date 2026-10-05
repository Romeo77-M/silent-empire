export const formatMetricValue = ({ value, unit, isPerShare = false }) => {
  if (!Number.isFinite(value)) return { value: 'Not available', suffix: '' };

  if (isPerShare) {
    return { value: value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), suffix: '' };
  }

  const absolute = Math.abs(value);
  const scales = [
    { threshold: 1e12, divisor: 1e12, suffix: 'T' },
    { threshold: 1e9, divisor: 1e9, suffix: 'B' },
    { threshold: 1e6, divisor: 1e6, suffix: 'M' },
  ];
  const scale = scales.find(item => absolute >= item.threshold);
  if (!scale) return { value: value.toLocaleString(), suffix: unit || '' };

  const scaled = value / scale.divisor;
  const digits = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
  return {
    value: scaled.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: digits }),
    suffix: `${scale.suffix} ${unit || ''}`.trim(),
  };
};
