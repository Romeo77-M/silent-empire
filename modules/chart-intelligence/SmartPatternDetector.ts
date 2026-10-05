import type { CandlestickData } from '../../types';

export interface DetectedPattern {
  index: number;
  pattern: 'Doji' | 'Hammer' | 'ShootingStar' | 'BullishEngulfing' | 'BearishEngulfing';
}

export function detectPatterns(data: CandlestickData[]): DetectedPattern[] {
  const detected: DetectedPattern[] = [];

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const body = Math.abs(curr.close - curr.open);
    const range = curr.high - curr.low;
    if (range <= 0) continue;

    const upperWick = curr.high - Math.max(curr.close, curr.open);
    const lowerWick = Math.min(curr.close, curr.open) - curr.low;

    if (body / range <= 0.1) {
      detected.push({ index: i, pattern: 'Doji' });
      continue;
    }

    const smallUpperWick = upperWick <= body;
    const smallLowerWick = lowerWick <= body;

    if (lowerWick >= 2 * body && smallUpperWick) {
      detected.push({ index: i, pattern: 'Hammer' });
    } else if (upperWick >= 2 * body && smallLowerWick) {
      detected.push({ index: i, pattern: 'ShootingStar' });
    }

    const prevBullish = prev.close > prev.open;
    const prevBearish = prev.close < prev.open;
    const currBullish = curr.close > curr.open;
    const currBearish = curr.close < curr.open;

    if (prevBearish && currBullish && curr.open <= prev.close && curr.close >= prev.open) {
      detected.push({ index: i, pattern: 'BullishEngulfing' });
    } else if (prevBullish && currBearish && curr.open >= prev.close && curr.close <= prev.open) {
      detected.push({ index: i, pattern: 'BearishEngulfing' });
    }
  }

  return detected;
}
