export const chartTerms = {
  Doji: { display_label: 'Doji — Indecision', tooltip: 'The open and close are very close. It shows indecision, not a prediction. Traders usually look for confirmation from the next candles and the surrounding trend.' },
  Hammer: { display_label: 'Hammer — Rejection of Lower Prices', tooltip: 'A long lower wick shows price fell and then recovered. Context matters: traders often look for it after a decline and wait for confirmation.' },
  ShootingStar: { display_label: 'Shooting Star — Rejection of Higher Prices', tooltip: 'A long upper wick shows price rose and then pulled back. It can matter after an advance, but it does not guarantee a reversal.' },
  BullishEngulfing: { display_label: 'Bullish Engulfing', tooltip: 'A rising candle body fully covers the prior falling candle body. It can show a momentum shift, but traders typically use trend, volume, and follow-through for context.' },
  BearishEngulfing: { display_label: 'Bearish Engulfing', tooltip: 'A falling candle body fully covers the prior rising candle body. It can show a momentum shift, but traders typically use trend, volume, and follow-through for context.' }
};
