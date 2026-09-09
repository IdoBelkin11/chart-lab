// ---------------------------------------------------------------------------
// Technical indicators — pure functions over a closes[] array (oldest→newest)
// or a history[] of {date,open,high,low,close,volume} bars.
//
// These are deliberately provider-agnostic: they don't know or care whether
// the prices came from Twelve Data or DemoProvider. This is what lets Demo
// Mode produce a fully real technical analysis over fake-but-consistent
// prices, rather than needing its own parallel fake-indicator logic.
//
// No AI, no LLM, and no guessing touches these numbers — every value here is
// a real, auditable calculation. This is what keeps the assistant's answers
// trustworthy: it never asks anything to "calculate RSI" from a description.
// ---------------------------------------------------------------------------

function pad2(n){ return String(n).padStart(2,'0'); }
function formatTimestamp(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function mdSma(values, period){
  if(values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a,b) => a+b, 0) / period;
}

function emaSeries(values, period){
  if(values.length < period) return null;
  const k = 2 / (period + 1);
  let emaVal = values.slice(0, period).reduce((a,b)=>a+b,0) / period;
  for(let i = period; i < values.length; i++){
    emaVal = values[i] * k + emaVal * (1 - k);
  }
  return emaVal;
}

function rsi(values, period){
  period = period || 14;
  if(values.length < period + 1) return null;
  const slice = values.slice(-(period+1));
  let gains = 0, losses = 0;
  for(let i = 1; i < slice.length; i++){
    const diff = slice[i] - slice[i-1];
    if(diff >= 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / period, avgLoss = losses / period;
  if(avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function macd(values){
  if(values.length < 26) return null;
  // Compute EMA12/EMA26 as running series so the MACD line itself can be
  // smoothed into a signal line, rather than just a single latest value.
  function emaSeriesFull(vals, period){
    const k = 2/(period+1);
    const out = [];
    let e = vals.slice(0, period).reduce((a,b)=>a+b,0) / period;
    out[period-1] = e;
    for(let i = period; i < vals.length; i++){
      e = vals[i]*k + e*(1-k);
      out[i] = e;
    }
    return out;
  }
  const ema12 = emaSeriesFull(values, 12);
  const ema26 = emaSeriesFull(values, 26);
  const macdLine = [];
  for(let i = 25; i < values.length; i++){
    macdLine.push(ema12[i] - ema26[i]);
  }
  if(macdLine.length < 9) return { macd: macdLine[macdLine.length-1], signal: null, histogram: null };
  const signal = emaSeries(macdLine, 9);
  const macdVal = macdLine[macdLine.length-1];
  return { macd: macdVal, signal, histogram: (signal!=null ? macdVal - signal : null) };
}

function volatilityPct(values, period){
  period = period || 20;
  if(values.length < period + 1) return null;
  const slice = values.slice(-(period+1));
  const returns = [];
  for(let i = 1; i < slice.length; i++) returns.push((slice[i]-slice[i-1]) / slice[i-1]);
  const mean = returns.reduce((a,b)=>a+b,0) / returns.length;
  const variance = returns.reduce((a,b)=>a+Math.pow(b-mean,2),0) / returns.length;
  const dailyStd = Math.sqrt(variance);
  return dailyStd * Math.sqrt(252) * 100; // annualized, as a percentage
}

function fiftyTwoWeek(history){
  const slice = history.slice(-252);
  if(!slice.length) return null;
  const highs = slice.map(r=>r.high), lows = slice.map(r=>r.low);
  return { high: Math.max(...highs), low: Math.min(...lows) };
}

function pctChange(from, to){
  if(from === 0 || from == null || to == null) return null;
  return ((to - from) / from) * 100;
}

function describeTrend(closes, he){
  const s50 = mdSma(closes, 50), s200 = mdSma(closes, 200);
  const last = closes[closes.length-1];
  if(s50 == null) return he ? 'אין מספיק היסטוריה כדי לקבוע מגמה.' : 'Not enough history to determine a trend.';
  if(s200 == null){
    const above = last > s50;
    return he
      ? `המחיר ${above?'מעל ל':'מתחת ל'}ממוצע הנע ל-50 יום, מה שמרמז על מגמה קצרה-בינונית ${above?'חיובית':'שלילית'}. אין עדיין מספיק היסטוריה לממוצע 200 יום.`
      : `Price is ${above?'above':'below'} the 50-day moving average, suggesting a short/intermediate-term ${above?'uptrend':'downtrend'}. Not enough history yet for the 200-day average.`;
  }
  const aboveBoth = last > s50 && last > s200 && s50 > s200;
  const belowBoth = last < s50 && last < s200 && s50 < s200;
  if(aboveBoth) return he ? 'מגמה חיובית מסודרת: המחיר מעל ממוצע 50, ממוצע 50 מעל ממוצע 200 (מבנה "צלב זהב").' : 'Orderly uptrend: price above the 50-day average, which is above the 200-day average (a "golden cross" structure).';
  if(belowBoth) return he ? 'מגמה שלילית מסודרת: המחיר מתחת לממוצע 50, ממוצע 50 מתחת לממוצע 200 (מבנה "צלב מוות").' : 'Orderly downtrend: price below the 50-day average, which is below the 200-day average (a "death cross" structure).';
  return he ? 'תמונה מעורבת — הממוצעים הקצר והארוך אינם מיושרים לאותו כיוון כרגע.' : 'Mixed picture — the short and long averages aren\'t currently aligned in the same direction.';
}
