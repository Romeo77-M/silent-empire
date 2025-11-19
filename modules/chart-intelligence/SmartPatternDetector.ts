interface Candlestick {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export function detectPatterns(data: Candlestick[]) {
  const detected = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const body = Math.abs(curr.close - curr.open);
    const range = curr.high - curr.low;
    
    // Prevent division by zero
    if (range === 0) continue;

    const upperWick = curr.high - Math.max(curr.close, curr.open);
    const lowerWick = Math.min(curr.close, curr.open) - curr.low;

    // Doji
    if (body / range < 0.1) detected.push({ index: i, pattern: 'Doji' });
    // Hammer
    else if (lowerWick > 2 * body && curr.close > curr.open) detected.push({ index: i, pattern: 'Hammer' });
    // Shooting Star
    else if (upperWick > 2 * body && curr.close < curr.open) detected.push({ index: i, pattern: 'ShootingStar' });
    // Engulfing
    else if (Math.sign(curr.close - curr.open) !== Math.sign(prev.close - prev.open) && Math.abs(curr.close - curr.open) > Math.abs(prev.close - prev.open)) detected.push({ index: i, pattern: 'Engulfing' });
  }
  return detected;
}
