// ---------------------------------------------------------------------------
// Chart data: the candle series behind all 19 lesson charts.
//
// This is DATA, so it lives in @core — it has no idea it will be drawn on a
// canvas, and it would move to any renderer unchanged. The canvas drawing
// itself lives in @ui/components/charts, because that is genuinely a
// renderer concern (it would be Skia under React Native).
//
// The series are generated deterministically from control points via
// genCandles, not recorded from a real market. That is deliberate: the
// lessons illustrate price BEHAVIOUR, and inventing plausible-looking real
// company data would be presenting fiction as fact.
// ---------------------------------------------------------------------------

// Seeded PRNG. The series must be IDENTICAL on every load and in every
// browser — a lesson that says "notice the support level at 165" is wrong the
// moment the data shifts. Math.random would break that.
export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

export function genCandles(seed, waypoints, n, baseVol, noiseK = 0.018){
  const rng=mulberry32(seed);
  const candles=[];
  const start=new Date(waypoints[0].t);
  for(let i=0;i<n;i++){
    const frac=i/(n-1);
    let lo=waypoints[0], hi=waypoints[waypoints.length-1];
    for(let k=0;k<waypoints.length-1;k++){
      if(frac>=waypoints[k].f && frac<=waypoints[k+1].f){lo=waypoints[k]; hi=waypoints[k+1]; break;}
    }
    const span=hi.f-lo.f||1;
    const local=(frac-lo.f)/span;
    const base=lo.p+(hi.p-lo.p)*local;
    const noise=(rng()-0.5)*(hi.p+lo.p)/2*noiseK;
    const close=base+noise;
    const prevClose=i===0?close:candles[i-1].c;
    const open=prevClose+(rng()-0.5)*Math.abs(close-prevClose)*0.6;
    const wick=Math.abs(close-open)*(0.4+rng()*0.9)+base*0.004;
    const high=Math.max(open,close)+wick*rng();
    const low=Math.min(open,close)-wick*rng();
    const vol=baseVol*(0.6+rng()*0.8);
    const d=new Date(start); d.setDate(d.getDate()+i);
    candles.push({t:d, o:open,h:high,l:low,c:close,v:vol});
  }
  return candles;
}

/* Lesson 1: AAPL Jan-Jun 2024 — bounces off ~165, rejects ~194 */
export const L1 = genCandles(11, [
  {f:0,p:186,t:'2024-01-02'},{f:0.12,p:165,t:''},{f:0.22,p:184,t:''},
  {f:0.34,p:166,t:''},{f:0.46,p:188,t:''},{f:0.58,p:167,t:''},
  {f:0.72,p:194,t:''},{f:0.86,p:178,t:''},{f:1,p:196,t:''}
], 110, 55000000);
L1.supportZone=[163,168]; L1.resistZone=[192,196];

/* Lesson 2: NVDA 2023 — consolidation under ~140, breakout with volume, retest, continuation */
export const L2 = genCandles(23, [
  {f:0,p:118,t:'2023-01-03'},{f:0.30,p:132,t:''},{f:0.45,p:138,t:''},
  {f:0.52,p:136,t:''},{f:0.60,p:158,t:''},{f:0.66,p:141,t:''},
  {f:0.75,p:172,t:''},{f:0.88,p:210,t:''},{f:1,p:245,t:''}
], 130, 300000000);
L2.resistZone=[136,142];
// mark breakout index (~60%) and retest index (~66%) with volume spike at breakout
export const l2BreakIdx = Math.round(130*0.61);
export const l2RetestIdx = Math.round(130*0.665);
if(L2[l2BreakIdx]) L2[l2BreakIdx].v *= 2.4;
L2.breakIdx = l2BreakIdx; L2.retestIdx = l2RetestIdx;

/* Lesson 1, second chart: a zone, not a line.
   The lesson's own subcaption says "an area, not a single line" — this is the
   chart that demonstrates it. Price turns near 150 five times and overshoots
   an exact 150 line on every one of them, while staying inside a ~147-153
   band. Someone who drew the thin line would read five failures; someone who
   drew the band would read five holds, from identical price action. */
// The five turn targets are deliberately SPREAD (147.5 … 154): a band derived
// from lows that all land within a point of each other is three pixels tall,
// and the whole comparison it exists to draw — a line you can pierce versus an
// area you cannot — has nothing to show.
export const L1_ZONE = genCandles(17, [
  {f:0,p:170,t:'2024-02-01'},{f:0.10,p:147.5,t:''},{f:0.20,p:164,t:''},
  {f:0.32,p:154.0,t:''},{f:0.44,p:167,t:''},{f:0.56,p:148.5,t:''},
  {f:0.68,p:162,t:''},{f:0.80,p:153.5,t:''},{f:0.90,p:160,t:''},
  {f:1,p:150.5,t:''}
], 96, 42000000);
(function(){
  // The band is DERIVED from the turns, never typed in by hand.
  //
  // First attempt hard-coded [147, 153] and the generated series put wicks
  // below 145 — so the caption said "price never left the band" over a chart
  // where it plainly did. A caption that contradicts its own picture is worse
  // than no second chart at all, and it is not the kind of thing eyeballing
  // catches reliably. Computing the band from the lows it is meant to contain
  // makes the claim true by construction: every turn is inside it because the
  // turns are what defined it.
  const lows = [];
  for(let i = 3; i < L1_ZONE.length - 3; i++){
    const l = L1_ZONE[i].l;
    let isMin = true;
    for(let k = i - 3; k <= i + 3; k++){ if(L1_ZONE[k].l < l){ isMin = false; break; } }
    if(isMin && l < 158) lows.push(l);
  }
  L1_ZONE.band = [Math.floor(Math.min(...lows)), Math.ceil(Math.max(...lows))];
  // The line someone would have drawn instead: the middle of that same band,
  // rounded — so it necessarily sits between turns that fell short of it and
  // turns that overshot it, which is the entire point being made.
  L1_ZONE.exactLine = Math.round((L1_ZONE.band[0] + L1_ZONE.band[1]) / 2);
})();

/* Comparison mini-charts */
export const L2_REAL = genCandles(31, [
  {f:0,p:128,t:'2023-04-01'},{f:0.4,p:139,t:''},{f:0.55,p:137,t:''},
  {f:0.62,p:158,t:''},{f:0.7,p:140,t:''},{f:1,p:170,t:''}
], 48, 180000000);
export const L2_FALSE = genCandles(41, [
  {f:0,p:128,t:'2023-04-01'},{f:0.4,p:139,t:''},{f:0.5,p:137,t:''},
  {f:0.58,p:144,t:''},{f:0.66,p:135,t:''},{f:1,p:126,t:''}
], 48, 90000000);
L2_REAL.resistZone=[136,141]; L2_FALSE.resistZone=[136,141];

/* Lesson 3: MSFT 2023 — steady uptrend */
export const L3 = genCandles(37, [
  {f:0,p:239,t:'2023-01-03'},{f:0.2,p:255,t:''},{f:0.4,p:310,t:''},
  {f:0.6,p:335,t:''},{f:0.8,p:322,t:''},{f:1,p:378,t:''}
], 260, 30000000);

/* helper: find the extreme (lowest low / highest high) candle index within a fractional window */
export function findExtreme(candles, f1, f2, type){
  const n=candles.length;
  let i1=Math.max(0,Math.round(f1*(n-1))), i2=Math.min(n-1,Math.round(f2*(n-1)));
  if(i2<i1){ const tmp=i1; i1=i2; i2=tmp; }
  let idx=i1;
  for(let i=i1;i<=i2;i++){
    if(type==='low'){ if(candles[i].l<candles[idx].l) idx=i; }
    else { if(candles[i].h>candles[idx].h) idx=i; }
  }
  return idx;
}

/* Lesson 5: TSLA 2023 — swing low to swing high, pullback stalling near 61.8% */
export const L5 = genCandles(43, [
  {f:0,p:152,t:'2023-01-06'},{f:0.12,p:146,t:''},{f:0.5,p:293,t:''},
  {f:0.72,p:207,t:''},{f:0.86,p:222,t:''},{f:1,p:262,t:''}
], 145, 120000000);
L5.lowIdx = findExtreme(L5, 0.03, 0.18, 'low');
L5.highIdx = findExtreme(L5, 0.42, 0.58, 'high');
(function(){
  const lowP = L5[L5.lowIdx].l, highP = L5[L5.highIdx].h;
  L5.swingLow = lowP; L5.swingHigh = highP;
  const range = highP - lowP;
  L5.fibLevels = [0.236, 0.382, 0.5, 0.618, 0.786].map(r => ({ ratio:r, price: highP - range*r }));
})();

/* Lesson 3, second chart: the average is LATE, and in a range that costs you.
   A moving average is an average of the past, so it can only turn after price
   has already turned. In a trend that lag is harmless. In a sideways market it
   is the whole story: price crosses back and forth over the line again and
   again, and every crossing looks exactly like the signal that works in a
   trend. The lesson teaches what an average is; without this it does not teach
   when it stops meaning anything. */
export const L3_CHOP = genCandles(67, [
  {f:0,p:100,t:'2023-05-01'},{f:0.09,p:112,t:''},{f:0.18,p:99,t:''},
  {f:0.27,p:111,t:''},{f:0.36,p:98,t:''},{f:0.45,p:110,t:''},
  {f:0.54,p:100,t:''},{f:0.63,p:112,t:''},{f:0.72,p:99,t:''},
  {f:0.81,p:110,t:''},{f:0.90,p:101,t:''},{f:1,p:108,t:''}
], 120, 38000000);

/* Lesson 5, second chart: a retracement that did not hold.
   Every Fibonacci illustration ever drawn is one where the level worked, which
   is how a measuring tool gets mistaken for a floor. Same construction as L5 —
   a move up, levels drawn from its low to its high — except price cuts through
   all of them and closes below the swing low it started from. The lesson's KB
   entry already covers these limitations in words; this is the picture. */
export const L5_FAIL = genCandles(73, [
  {f:0,p:120,t:'2023-06-01'},{f:0.10,p:114,t:''},{f:0.44,p:206,t:''},
  {f:0.60,p:172,t:''},{f:0.72,p:150,t:''},{f:0.86,p:126,t:''},{f:1,p:106,t:''}
], 120, 90000000);
L5_FAIL.lowIdx = findExtreme(L5_FAIL, 0.03, 0.18, 'low');
L5_FAIL.highIdx = findExtreme(L5_FAIL, 0.38, 0.52, 'high');
(function(){
  const lowP = L5_FAIL[L5_FAIL.lowIdx].l, highP = L5_FAIL[L5_FAIL.highIdx].h;
  L5_FAIL.swingLow = lowP; L5_FAIL.swingHigh = highP;
  const range = highP - lowP;
  L5_FAIL.fibLevels = [0.382, 0.5, 0.618].map(r => ({ ratio:r, price: highP - range*r }));
})();

/* Lesson 6: RSI examples */
// (a) sustained rally — RSI pushes above 70 early and stays elevated for a long stretch
export const RSI_OB = genCandles(51, [
  {f:0,p:100,t:'2023-02-01'},{f:0.15,p:118,t:''},{f:0.3,p:128,t:''},
  {f:0.5,p:150,t:''},{f:0.7,p:168,t:''},{f:0.85,p:184,t:''},{f:1,p:196,t:''}
], 100, 60000000);
// (b) sustained decline into an oversold bounce
export const RSI_OS = genCandles(52, [
  {f:0,p:180,t:'2023-03-01'},{f:0.25,p:150,t:''},{f:0.5,p:118,t:''},
  {f:0.75,p:92,t:''},{f:0.9,p:85,t:''},{f:1,p:104,t:''}
], 100, 60000000);
// (c) bearish divergence — price higher high, RSI lower high
export const RSI_DIV = genCandles(53, [
  {f:0,p:110,t:'2023-05-01'},{f:0.18,p:120,t:''},{f:0.4,p:158,t:''},
  {f:0.55,p:138,t:''},{f:0.72,p:150,t:''},{f:0.92,p:172,t:''},{f:1,p:150,t:''}
], 110, 60000000);
[RSI_OB, RSI_OS, RSI_DIV].forEach(d=>{ d.rsi = computeRSI(d.map(c=>c.c), 14); });
RSI_DIV.peak1Idx = findExtreme(RSI_DIV, 0.3, 0.44, 'high');
RSI_DIV.peak2Idx = findExtreme(RSI_DIV, 0.82, 0.98, 'high');

/* Lesson 7: chart pattern illustrations (simplified, not tied to a real ticker) */
export const P_DBL_BOTTOM = genCandles(61, [
  {f:0,p:100,t:'2023-01-01'},{f:0.22,p:70,t:''},{f:0.42,p:88,t:''},
  {f:0.62,p:71,t:''},{f:0.8,p:90,t:''},{f:1,p:104,t:''}
], 70, 30000000);
P_DBL_BOTTOM.b1Idx = findExtreme(P_DBL_BOTTOM, 0.15, 0.3, 'low');
P_DBL_BOTTOM.b2Idx = findExtreme(P_DBL_BOTTOM, 0.55, 0.7, 'low');
P_DBL_BOTTOM.neckIdx = findExtreme(P_DBL_BOTTOM, 0.32, 0.5, 'high');

export const P_DBL_TOP = genCandles(62, [
  {f:0,p:70,t:'2023-02-01'},{f:0.22,p:100,t:''},{f:0.42,p:82,t:''},
  {f:0.62,p:99,t:''},{f:0.8,p:80,t:''},{f:1,p:66,t:''}
], 70, 30000000);
P_DBL_TOP.t1Idx = findExtreme(P_DBL_TOP, 0.15, 0.3, 'high');
P_DBL_TOP.t2Idx = findExtreme(P_DBL_TOP, 0.55, 0.7, 'high');
P_DBL_TOP.neckIdx = findExtreme(P_DBL_TOP, 0.32, 0.5, 'low');

export const P_HS = genCandles(63, [
  {f:0,p:80,t:'2023-03-01'},{f:0.16,p:100,t:''},{f:0.32,p:88,t:''},
  {f:0.5,p:114,t:''},{f:0.68,p:89,t:''},{f:0.82,p:99,t:''},{f:1,p:80,t:''}
], 80, 30000000);
P_HS.shoulder1Idx = findExtreme(P_HS, 0.1, 0.22, 'high');
P_HS.headIdx = findExtreme(P_HS, 0.44, 0.56, 'high');
P_HS.shoulder2Idx = findExtreme(P_HS, 0.76, 0.88, 'high');
P_HS.trough1Idx = findExtreme(P_HS, 0.24, 0.4, 'low');
P_HS.trough2Idx = findExtreme(P_HS, 0.6, 0.74, 'low');

export const P_FLAG = genCandles(64, [
  {f:0,p:60,t:'2023-04-01'},{f:0.32,p:112,t:''},{f:0.42,p:108,t:''},
  {f:0.52,p:103,t:''},{f:0.62,p:99,t:''},{f:0.66,p:102,t:''},{f:1,p:138,t:''}
], 70, 30000000);
P_FLAG.poleStartIdx = findExtreme(P_FLAG, 0, 0.06, 'low');
P_FLAG.poleTopIdx = findExtreme(P_FLAG, 0.26, 0.36, 'high');
P_FLAG.flagEndIdx = findExtreme(P_FLAG, 0.6, 0.7, 'low');

export const P_TRIANGLE = genCandles(65, [
  {f:0,p:78,t:'2023-05-01'},{f:0.12,p:100,t:''},{f:0.25,p:85,t:''},
  {f:0.38,p:100,t:''},{f:0.5,p:90,t:''},{f:0.62,p:100,t:''},
  {f:0.72,p:95,t:''},{f:0.84,p:100,t:''},{f:1,p:114,t:''}
], 90, 30000000);
P_TRIANGLE.touch1Idx = findExtreme(P_TRIANGLE, 0.06, 0.18, 'high');
P_TRIANGLE.touch2Idx = findExtreme(P_TRIANGLE, 0.32, 0.44, 'high');
P_TRIANGLE.touch3Idx = findExtreme(P_TRIANGLE, 0.56, 0.68, 'high');
P_TRIANGLE.low1Idx = findExtreme(P_TRIANGLE, 0.18, 0.3, 'low');
P_TRIANGLE.low2Idx = findExtreme(P_TRIANGLE, 0.44, 0.56, 'low');
P_TRIANGLE.breakIdx = findExtreme(P_TRIANGLE, 0.86, 1, 'high');

/* ---------- Lesson 4: candlestick pattern illustrations ---------- */
export function overrideCandle(candles, idx, patch){
  const cd = candles[idx];
  cd.o=patch.o; cd.h=patch.h; cd.l=patch.l; cd.c=patch.c;
  if(patch.volMult) cd.v *= patch.volMult;
}

// Hammer: downtrend into a small-bodied, long-lower-wick candle, then a recovery
export const C_HAMMER = genCandles(501, [
  {f:0,p:100,t:'2023-02-01'},{f:0.65,p:68,t:''},{f:1,p:88,t:''}
], 20, 18000000);
overrideCandle(C_HAMMER, 13, {o:74, h:76, l:64, c:75.5});
C_HAMMER.highlightIdx = 13;

// Shooting Star: uptrend into a small-bodied, long-upper-wick candle, then a reversal down (mirror of the hammer)
export const C_STAR = genCandles(505, [
  {f:0,p:70,t:'2023-06-01'},{f:0.65,p:100,t:''},{f:1,p:80,t:''}
], 20, 18000000);
overrideCandle(C_STAR, 13, {o:98, h:109, l:96, c:96.7});
C_STAR.highlightIdx = 13;

// Doji: uptrend into a near-zero-body candle at the top, then a pause/pullback
export const C_DOJI = genCandles(502, [
  {f:0,p:60,t:'2023-03-01'},{f:0.6,p:95,t:''},{f:1,p:90,t:''}
], 20, 15000000);
overrideCandle(C_DOJI, 12, {o:94.8, h:98, l:91, c:95.0});
C_DOJI.highlightIdx = 12;

// Bullish engulfing: downtrend, small red candle, then a green candle that fully engulfs it
export const C_BULLE = genCandles(503, [
  {f:0,p:90,t:'2023-04-01'},{f:0.6,p:65,t:''},{f:1,p:85,t:''}
], 20, 16000000);
overrideCandle(C_BULLE, 12, {o:67, h:67.5, l:62, c:63});
overrideCandle(C_BULLE, 13, {o:62, h:69, l:61.5, c:68.5, volMult:1.9});
C_BULLE.highlightIdx = 12; C_BULLE.highlightIdx2 = 13;

// Bearish engulfing: uptrend, small green candle, then a red candle that fully engulfs it
export const C_BEARE = genCandles(504, [
  {f:0,p:65,t:'2023-05-01'},{f:0.6,p:92,t:''},{f:1,p:72,t:''}
], 20, 16000000);
overrideCandle(C_BEARE, 12, {o:90, h:94.5, l:89.5, c:94});
overrideCandle(C_BEARE, 13, {o:95, h:95.5, l:87.5, c:88, volMult:1.9});
C_BEARE.highlightIdx = 12; C_BEARE.highlightIdx2 = 13;

export function ema(vals,period){
  const k=2/(period+1); const out=[]; let prev;
  vals.forEach((v,i)=>{ if(i===0){prev=v;} else {prev=v*k+prev*(1-k);} out.push(prev); });
  return out;
}
export function sma(vals,period){
  const out=[];
  for(let i=0;i<vals.length;i++){
    if(i<period-1){out.push(null);continue;}
    let s=0; for(let j=i-period+1;j<=i;j++) s+=vals[j];
    out.push(s/period);
  }
  return out;
}
export function computeRSI(closes, period){
  period = period||14;
  const out = new Array(closes.length).fill(null);
  let avgG=0, avgL=0;
  for(let i=1;i<=period && i<closes.length;i++){
    const diff = closes[i]-closes[i-1];
    if(diff>=0) avgG+=diff; else avgL-=diff;
  }
  avgG/=period; avgL/=period;
  out[period] = avgL===0 ? 100 : 100 - 100/(1+avgG/avgL);
  for(let i=period+1;i<closes.length;i++){
    const diff = closes[i]-closes[i-1];
    const gain = diff>0? diff:0, loss = diff<0? -diff:0;
    avgG = (avgG*(period-1)+gain)/period;
    avgL = (avgL*(period-1)+loss)/period;
    out[i] = avgL===0 ? 100 : 100 - 100/(1+avgG/avgL);
  }
  return out;
}

/* ---------- theme-aware chart colors ---------- */

/* ---------- Lesson workspace activities ---------- */
// T2 "which of these is the hammer?": one chart carrying four marked candles —
// a doji on the way down (A), the hammer at the low (B), a bullish engulfing on
// the recovery (C) and a shooting star at the top (D). Built from the same
// generator and hand-set candles as the single-pattern illustrations above.
export const C_MIX = genCandles(507, [
  {f:0,p:104,t:'2023-07-03'},{f:0.3,p:92,t:''},{f:0.47,p:78,t:''},{f:0.78,p:98,t:''},{f:1,p:90,t:''}
], 36, 16000000);
overrideCandle(C_MIX, 8, {o:95.2, h:98.4, l:91.8, c:95.4});           // A · doji
overrideCandle(C_MIX, 16, {o:79, h:80.6, l:70.5, c:80.2});           // B · hammer
overrideCandle(C_MIX, 20, {o:84.5, h:85, l:81.2, c:81.8});           //     small red…
overrideCandle(C_MIX, 21, {o:81.2, h:88.4, l:80.8, c:87.9, volMult:1.8}); // C · …engulfed
overrideCandle(C_MIX, 28, {o:97.6, h:106.5, l:96.8, c:97});          // D · shooting star
C_MIX.marks = { a: 8, b: 16, c: [20, 21], d: 28 };

/* ---------- Foundations (F3, F4) ---------- */
/** Moves every candle from idx on by delta — how a gap is cut into a generated series. */
function shiftFrom(candles, idx, delta){
  for(let i=idx;i<candles.length;i++){ const c=candles[i]; c.o+=delta; c.h+=delta; c.l+=delta; c.c+=delta; }
}

// F3 · step 3: a steady rise, then the morning after a report that grew less
// than expected — the open lands far below the previous close, leaving a gap.
export const F3_GAPDOWN = genCandles(311, [
  {f:0,p:84,t:'2024-02-01'},{f:0.7,p:100,t:''},{f:1,p:94,t:''}
], 60, 9000000);
F3_GAPDOWN.gapIdx = 42;
shiftFrom(F3_GAPDOWN, F3_GAPDOWN.gapIdx, -8);
F3_GAPDOWN[F3_GAPDOWN.gapIdx].v *= 3.2;
F3_GAPDOWN.prevClose = F3_GAPDOWN[F3_GAPDOWN.gapIdx-1].c;
F3_GAPDOWN.gapOpen = F3_GAPDOWN[F3_GAPDOWN.gapIdx].o;
// Keep the gap truly empty: no wick of the gap candle reaches back up.
F3_GAPDOWN[F3_GAPDOWN.gapIdx].h = Math.min(F3_GAPDOWN[F3_GAPDOWN.gapIdx].h, F3_GAPDOWN.gapOpen + 0.4);
F3_GAPDOWN.gapTop = Math.min(F3_GAPDOWN.prevClose, F3_GAPDOWN[F3_GAPDOWN.gapIdx-1].l);
F3_GAPDOWN.gapBottom = F3_GAPDOWN[F3_GAPDOWN.gapIdx].h;

// F3 · the Try step: a slide into a report, then a loss that was SMALLER than
// feared — bad news, better than expected, and the next open gaps up.
export const F3_BEAT = genCandles(313, [
  {f:0,p:62,t:'2024-05-01'},{f:0.72,p:50,t:''},{f:1,p:55,t:''}
], 60, 7000000);
F3_BEAT.gapIdx = 44;
shiftFrom(F3_BEAT, F3_BEAT.gapIdx, 5);
F3_BEAT[F3_BEAT.gapIdx].v *= 3;
F3_BEAT[F3_BEAT.gapIdx].l = Math.max(F3_BEAT[F3_BEAT.gapIdx].l, F3_BEAT[F3_BEAT.gapIdx].o - 0.3);
F3_BEAT.gapBottom = Math.max(F3_BEAT[F3_BEAT.gapIdx-1].c, F3_BEAT[F3_BEAT.gapIdx-1].h);
F3_BEAT.gapTop = F3_BEAT[F3_BEAT.gapIdx].l;

// F4 · broad vs concentrated: a broad index (candles) and a concentrated one
// (a line) that swings roughly twice as far, both from 100 on the same days.
export const F4_BROAD = genCandles(401, [
  {f:0,p:100,t:'2023-01-02'},{f:0.25,p:111,t:''},{f:0.45,p:103,t:''},{f:0.7,p:117,t:''},{f:0.85,p:108,t:''},{f:1,p:119,t:''}
], 120, 40000000);
export const F4_CONC = F4_BROAD.map((c, i) => {
  const wobble = Math.sin(i / 4) * 0.8;
  return 100 + (c.c - 100) * 1.9 + wobble;
});

/* ---------- Technical Analysis T2–T5 ---------- */
// Swing points and zones below are FOUND in the generated data, never typed
// in: a label that says "higher low" has to sit on a low that is higher.
const swingAt = (c, f, type, w = 0.06) => findExtreme(c, Math.max(0, f - w), Math.min(1, f + w), type);
/** A zone around the extremes at the given indexes: [lowest, highest] ± pad. */
function bandOf(c, idxs, type, pad){
  const ps = idxs.map((i) => (type === 'low' ? c[i].l : c[i].h));
  return [Math.min(...ps) - pad, Math.max(...ps) + pad];
}
/** A range has a ceiling: no high (and no body) before `until` goes past `cap`. */
function capHighs(c, until, cap){
  for(let i=0;i<until;i++){ const k=c[i]; k.o=Math.min(k.o,cap-0.15); k.c=Math.min(k.c,cap-0.15); k.h=Math.min(Math.max(k.o,k.c,k.h),cap); k.l=Math.min(k.l,k.o,k.c); }
}
/** Candles after a breakout, drawn explicitly so none of them drifts back to the level. */
function continueFrom(c, from, steps){
  steps.forEach((d, j) => { const i = from + j, prev = c[i-1].c, o = prev + (d > 0 ? -0.1 : 0.1), cl = prev + d; overrideCandle(c, i, {o, h:Math.max(o,cl)+0.35, l:Math.min(o,cl)-0.3, c:cl}); });
}
/** Swing points at the waypoints' own positions: [f, 'high'|'low'] pairs. */
function markSwings(c, pts){ c.swings = pts.map(([f, type]) => { const idx = swingAt(c, f, type); return { idx, type, price: type === 'low' ? c[idx].l : c[idx].h }; }); }

// T2 · a hammer at the end of a decline, and the candle after it closing above its high.
export const T2_CONTEXT = genCandles(611, [
  {f:0,p:104,t:'2024-03-01'},{f:0.6,p:86.5,t:''},{f:1,p:96,t:''}
], 30, 12000000);
overrideCandle(T2_CONTEXT, 18, {o:86.4, h:87.5, l:82, c:87.2});
overrideCandle(T2_CONTEXT, 19, {o:87.3, h:89.9, l:87.0, c:89.6, volMult:1.4});
T2_CONTEXT.hammerIdx = 18; T2_CONTEXT.confirmIdx = 19;

// T2 · Apply: the same shape, but after a RISE, where it is not a hammer.
export const T2_APPLY = genCandles(612, [
  {f:0,p:80,t:'2024-04-01'},{f:0.66,p:100,t:''},{f:1,p:98,t:''}
], 30, 12000000);
overrideCandle(T2_APPLY, 19, {o:99.4, h:100.2, l:94.5, c:100.0});
T2_APPLY.markIdx = 19;

// T2 · question charts (fresh series, so the quiz is not the gallery again).
export const T2_Q_STAR = genCandles(613, [
  {f:0,p:70,t:'2024-05-01'},{f:0.68,p:88,t:''},{f:1,p:82,t:''}
], 26, 10000000);
overrideCandle(T2_Q_STAR, 17, {o:87.9, h:94, l:87.1, c:87.4});
T2_Q_STAR.markIdx = 17;
export const T2_Q_DOJI = genCandles(614, [
  {f:0,p:78,t:'2024-06-03'},{f:0.64,p:96,t:''},{f:1,p:93,t:''}
], 26, 10000000);
overrideCandle(T2_Q_DOJI, 16, {o:96.2, h:98.5, l:94.1, c:96.3});
T2_Q_DOJI.markIdx = 16;
export const T2_Q_BEARE = genCandles(615, [
  {f:0,p:84,t:'2024-07-01'},{f:0.64,p:102,t:''},{f:1,p:95,t:''}
], 26, 10000000);
overrideCandle(T2_Q_BEARE, 16, {o:101, h:103.5, l:100.6, c:103});
overrideCandle(T2_Q_BEARE, 17, {o:103.6, h:104, l:99.8, c:100.2, volMult:1.8});
T2_Q_BEARE.markIdx = 16; T2_Q_BEARE.markIdx2 = 17;

// T3 · trends, built from explicit swings (the waypoints alternate high / low).
export const T3_UP = genCandles(621, [
  {f:0,p:95,t:'2024-01-02'},{f:0.14,p:104,t:''},{f:0.26,p:99,t:''},{f:0.42,p:110,t:''},
  {f:0.54,p:104,t:''},{f:0.72,p:117,t:''},{f:0.84,p:110,t:''},{f:1,p:121,t:''}
], 90, 20000000);
markSwings(T3_UP, [[0.14,'high'],[0.26,'low'],[0.42,'high'],[0.54,'low'],[0.72,'high'],[0.84,'low']]);

export const T3_PULL = genCandles(622, [
  {f:0,p:90,t:'2024-02-01'},{f:0.18,p:102,t:''},{f:0.32,p:96,t:''},{f:0.5,p:110,t:''},
  {f:0.6,p:99,t:''},{f:0.85,p:114,t:''},{f:1,p:112,t:''}
], 80, 20000000);
markSwings(T3_PULL, [[0.32,'low'],[0.5,'high'],[0.6,'low']]);

export const T3_DOWN = genCandles(623, [
  {f:0,p:121,t:'2024-03-01'},{f:0.14,p:112,t:''},{f:0.26,p:117,t:''},{f:0.42,p:106,t:''},
  {f:0.54,p:111,t:''},{f:0.72,p:99,t:''},{f:0.84,p:104,t:''},{f:1,p:95,t:''}
], 90, 20000000);
markSwings(T3_DOWN, [[0.14,'low'],[0.26,'high'],[0.42,'low'],[0.54,'high'],[0.72,'low'],[0.84,'high']]);

export const T3_SIDE = genCandles(624, [
  {f:0,p:105,t:'2024-04-01'},{f:0.12,p:109.5,t:''},{f:0.24,p:100.8,t:''},{f:0.38,p:109.2,t:''},
  {f:0.5,p:100.5,t:''},{f:0.64,p:109.6,t:''},{f:0.78,p:100.9,t:''},{f:0.9,p:108,t:''},{f:1,p:104,t:''}
], 90, 20000000);
markSwings(T3_SIDE, [[0.12,'high'],[0.24,'low'],[0.38,'high'],[0.5,'low'],[0.64,'high'],[0.78,'low']]);
T3_SIDE.ceiling = bandOf(T3_SIDE, T3_SIDE.swings.filter((s) => s.type === 'high').map((s) => s.idx), 'high', 0.3);
T3_SIDE.floor = bandOf(T3_SIDE, T3_SIDE.swings.filter((s) => s.type === 'low').map((s) => s.idx), 'low', 0.3);

// T3 · Apply: an uptrend whose last swing makes a LOWER low.
export const T3_BREAK = genCandles(625, [
  {f:0,p:95,t:'2024-05-01'},{f:0.15,p:105,t:''},{f:0.28,p:100,t:''},{f:0.45,p:111,t:''},
  {f:0.58,p:104.5,t:''},{f:0.72,p:113,t:''},{f:0.92,p:100.5,t:''},{f:1,p:102,t:''}
], 80, 20000000);
markSwings(T3_BREAK, [[0.28,'low'],[0.45,'high'],[0.58,'low'],[0.72,'high'],[0.92,'low']]);

// T3 · question charts.
export const T3_Q_DOWN = genCandles(626, [
  {f:0,p:70,t:'2024-06-03'},{f:0.15,p:63,t:''},{f:0.28,p:67,t:''},{f:0.45,p:58,t:''},
  {f:0.58,p:62,t:''},{f:0.78,p:53,t:''},{f:0.88,p:56,t:''},{f:1,p:51,t:''}
], 80, 15000000);
markSwings(T3_Q_DOWN, [[0.15,'low'],[0.28,'high'],[0.45,'low'],[0.58,'high'],[0.78,'low'],[0.88,'high']]);
export const T3_Q_SIDE = genCandles(627, [
  {f:0,p:42,t:'2024-07-01'},{f:0.1,p:43.8,t:''},{f:0.22,p:40.3,t:''},{f:0.36,p:43.9,t:''},
  {f:0.5,p:40.2,t:''},{f:0.66,p:43.7,t:''},{f:0.8,p:40.4,t:''},{f:1,p:42.5,t:''}
], 80, 15000000);
markSwings(T3_Q_SIDE, [[0.1,'high'],[0.22,'low'],[0.36,'high'],[0.5,'low'],[0.66,'high'],[0.8,'low']]);
export const T3_Q_UPRED = genCandles(628, [
  {f:0,p:50,t:'2024-08-01'},{f:0.15,p:56,t:''},{f:0.3,p:53,t:''},{f:0.5,p:60,t:''},
  {f:0.62,p:57,t:''},{f:0.85,p:65,t:''},{f:1,p:64.5,t:''}
], 70, 15000000);
overrideCandle(T3_Q_UPRED, 69, {o:65.1, h:65.4, l:61.6, c:61.9, volMult:1.6});
markSwings(T3_Q_UPRED, [[0.3,'low'],[0.5,'high'],[0.62,'low'],[0.85,'high']]);

// T4 · support near 50 touched three times, resistance near 60 touched twice.
export const T4_TEACH = genCandles(631, [
  {f:0,p:57,t:'2024-01-02'},{f:0.12,p:50.4,t:''},{f:0.27,p:59.6,t:''},{f:0.42,p:50.2,t:''},
  {f:0.58,p:59.8,t:''},{f:0.74,p:50.7,t:''},{f:0.9,p:57.5,t:''},{f:1,p:56,t:''}
], 100, 25000000);
markSwings(T4_TEACH, [[0.12,'low'],[0.27,'high'],[0.42,'low'],[0.58,'high'],[0.74,'low']]);
T4_TEACH.support = bandOf(T4_TEACH, T4_TEACH.swings.filter((s) => s.type === 'low').map((s) => s.idx), 'low', 0.3);
T4_TEACH.resist = bandOf(T4_TEACH, T4_TEACH.swings.filter((s) => s.type === 'high').map((s) => s.idx), 'high', 0.3);

// T4 · Apply: support that held twice, broke, and then capped the rally back up to it.
export const T4_FLIP = genCandles(632, [
  {f:0,p:90,t:'2024-02-01'},{f:0.12,p:80.6,t:''},{f:0.25,p:88,t:''},{f:0.38,p:80.4,t:''},
  {f:0.5,p:86,t:''},{f:0.62,p:72,t:''},{f:0.75,p:79.6,t:''},{f:0.87,p:73,t:''},{f:1,p:70,t:''}
], 90, 25000000);
markSwings(T4_FLIP, [[0.12,'low'],[0.38,'low'],[0.75,'high']]);
T4_FLIP.zone = bandOf(T4_FLIP, [T4_FLIP.swings[0].idx, T4_FLIP.swings[1].idx], 'low', 0.4);

// T4 · question charts.
export const T4_Q_APPROACH = genCandles(633, [
  {f:0,p:34,t:'2024-03-01'},{f:0.16,p:30.4,t:''},{f:0.33,p:34.6,t:''},{f:0.52,p:30.3,t:''},
  {f:0.72,p:35,t:''},{f:1,p:31.6,t:''}
], 80, 15000000);
markSwings(T4_Q_APPROACH, [[0.16,'low'],[0.52,'low']]);
T4_Q_APPROACH.zone = bandOf(T4_Q_APPROACH, T4_Q_APPROACH.swings.map((s) => s.idx), 'low', 0.25);
export const T4_Q_BAND = genCandles(634, [
  {f:0,p:160,t:'2024-04-01'},{f:0.15,p:148.2,t:''},{f:0.3,p:158,t:''},{f:0.45,p:151.6,t:''},
  {f:0.6,p:160,t:''},{f:0.75,p:148.8,t:''},{f:0.9,p:157,t:''},{f:1,p:153.5,t:''}
], 90, 30000000);
markSwings(T4_Q_BAND, [[0.15,'low'],[0.45,'low'],[0.75,'low']]);
T4_Q_BAND.band = bandOf(T4_Q_BAND, T4_Q_BAND.swings.map((s) => s.idx), 'low', 0.2);
export const T4_Q_RES = genCandles(635, [
  {f:0,p:62,t:'2024-05-01'},{f:0.15,p:71.6,t:''},{f:0.3,p:65,t:''},{f:0.47,p:72.2,t:''},
  {f:0.62,p:66,t:''},{f:0.8,p:71.9,t:''},{f:1,p:67,t:''}
], 80, 15000000);
markSwings(T4_Q_RES, [[0.15,'high'],[0.47,'high'],[0.8,'high']]);

// T5 · a range under ~50, then a candle through it. The chart ENDS a few
// candles later: what happens next is the lesson's prediction, not its teaching.
function rangeThenBreak(seed, t, breakPatch, endP, volMult, after){
  const c = genCandles(seed, [
    {f:0,p:44,t},{f:0.2,p:49.2,t:''},{f:0.38,p:46,t:''},{f:0.58,p:49.3,t:''},{f:0.76,p:46.6,t:''},{f:0.9,p:48.6,t:''},{f:1,p:endP,t:''}
  ], 50, 20000000);
  c.breakIdx = 45;
  capHighs(c, c.breakIdx, 49.9);
  markSwings(c, [[0.2,'high'],[0.58,'high']]);
  c.resist = bandOf(c, c.swings.map((s) => s.idx), 'high', 0.2);
  overrideCandle(c, c.breakIdx, breakPatch);
  c[c.breakIdx].v = c.slice(0, c.breakIdx).reduce((s, x) => s + x.v, 0) / c.breakIdx * volMult;
  if (after) continueFrom(c, c.breakIdx + 1, after);
  return c;
}
export const T5_BREAK = rangeThenBreak(641, '2024-01-02', {o:49.2, h:52.3, l:49.0, c:52.0}, 53, 2.8, [0.45, -0.2, 0.55, 0.35]);
export const T5_THIN = rangeThenBreak(642, '2024-02-01', {o:49.3, h:51.9, l:49.1, c:51.6}, 52.4, 0.55, [0.2, -0.15, 0.3, 0.1]);
// A poke: the high goes through, the close does not, and then price sags back.
export const T5_POKE = rangeThenBreak(643, '2024-03-01', {o:49.1, h:51.8, l:48.9, c:49.3}, 47, 1.3);

// T5 · Apply: breakout above ~80, a return to the old level that holds, then higher.
export const T5_APPLY = genCandles(644, [
  {f:0,p:72,t:'2024-04-01'},{f:0.22,p:79.5,t:''},{f:0.36,p:75,t:''},{f:0.5,p:79.7,t:''},
  {f:0.6,p:86,t:''},{f:0.7,p:80.8,t:''},{f:1,p:92,t:''}
], 80, 20000000);
T5_APPLY.breakIdx = 44;
capHighs(T5_APPLY, T5_APPLY.breakIdx, 80.4);
markSwings(T5_APPLY, [[0.22,'high'],[0.46,'high'],[0.7,'low']]);
T5_APPLY.resist = bandOf(T5_APPLY, [T5_APPLY.swings[0].idx, T5_APPLY.swings[1].idx], 'high', 0.3);

// T5 · question charts.
export const T5_Q_POKE = rangeThenBreak(645, '2024-05-01', {o:49.0, h:52.0, l:48.8, c:49.2}, 47.2, 1.2);
export const T5_Q_THIN = rangeThenBreak(646, '2024-06-03', {o:49.2, h:51.7, l:49.0, c:51.5}, 52.2, 0.5, [0.15, -0.1, 0.25, 0.1]);
export const T5_Q_HOLD = genCandles(647, [
  {f:0,p:72,t:'2024-07-01'},{f:0.25,p:79.6,t:''},{f:0.42,p:75.5,t:''},{f:0.6,p:79.8,t:''},
  {f:0.75,p:86.5,t:''},{f:1,p:81.2,t:''}
], 70, 20000000);
T5_Q_HOLD.breakIdx = 45;
capHighs(T5_Q_HOLD, T5_Q_HOLD.breakIdx, 80.2);
markSwings(T5_Q_HOLD, [[0.25,'high'],[0.55,'high']]);
T5_Q_HOLD.resist = bandOf(T5_Q_HOLD, T5_Q_HOLD.swings.map((s) => s.idx), 'high', 0.3);

/* ---------- Technical Analysis T1 ---------- */
/** k consecutive candles merged into one — how a weekly chart is built from daily data. */
export function toPeriods(candles, k){
  const out = [];
  for (let i = 0; i + k <= candles.length; i += k) {
    const g = candles.slice(i, i + k);
    out.push({ t: g[0].t, o: g[0].o, c: g[g.length - 1].c, h: Math.max(...g.map((x) => x.h)), l: Math.min(...g.map((x) => x.l)), v: g.reduce((s, x) => s + x.v, 0) });
  }
  return out;
}
const avgVolume = (c) => c.reduce((s, x) => s + x.v, 0) / c.length;
/** Sets candle i's volume to `mult` times the average of all the OTHER candles. */
function volumeAt(c, i, mult){ const others = c.filter((_, k) => k !== i); c[i].v = avgVolume(others) * mult; }

// T1 · step 1: sixty trading days, one candle each.
export const T1_DAILY = genCandles(701, [
  {f:0,p:48,t:'2024-01-02'},{f:0.4,p:51.5,t:''},{f:0.6,p:50,t:''},{f:1,p:55,t:''}
], 60, 18000000);
T1_DAILY.markIdx = 40;

// T1 · step 2: one year of daily data. The last twenty days fall; the year rises.
// The daily year itself is never drawn — only its last 20 days and its weekly candles.
const T1_YEAR = genCandles(702, [
  {f:0,p:40,t:'2023-01-02'},{f:0.3,p:47,t:''},{f:0.45,p:45,t:''},{f:0.75,p:58,t:''},{f:0.92,p:61,t:''},{f:1,p:56,t:''}
], 250, 18000000);
export const T1_YEAR_LAST20 = T1_YEAR.slice(-20);
export const T1_YEAR_WEEKLY = toPeriods(T1_YEAR, 5);
export const T1_YEAR_FACTS = { days: T1_YEAR.length, firstClose: T1_YEAR[0].c, lastClose: T1_YEAR[T1_YEAR.length - 1].c };

// T1 · step 3: two days of heavy volume — one up, one down. Volume counts, it does not point.
export const T1_VOL = genCandles(703, [
  {f:0,p:48,t:'2024-02-01'},{f:0.35,p:50,t:''},{f:0.7,p:54,t:''},{f:1,p:52,t:''}
], 40, 18000000);
overrideCandle(T1_VOL, 14, {o:49.8, h:52.8, l:49.6, c:52.5});
overrideCandle(T1_VOL, 29, {o:54.2, h:54.4, l:51.3, c:51.6});
volumeAt(T1_VOL, 14, 3.2); volumeAt(T1_VOL, 29, 3.0);
T1_VOL.upIdx = 14; T1_VOL.downIdx = 29;

// T1 · the Try step (Artifact 08: "mark the day with unusual volume"): four marked days.
// A: the biggest candle, on ordinary volume · B: a quiet day · C: a modest candle on
// heavy volume (the answer) · D: an ordinary day.
export const T1_TRY = genCandles(704, [
  {f:0,p:60,t:'2024-03-01'},{f:0.3,p:63,t:''},{f:0.6,p:61,t:''},{f:1,p:65,t:''}
], 40, 18000000);
overrideCandle(T1_TRY, 8, {o:61.2, h:64.9, l:61.0, c:64.6});
overrideCandle(T1_TRY, 17, {o:62.6, h:62.9, l:62.3, c:62.7});
overrideCandle(T1_TRY, 25, {o:61.4, h:62.5, l:61.1, c:62.2});
volumeAt(T1_TRY, 8, 1.0); volumeAt(T1_TRY, 17, 0.45); volumeAt(T1_TRY, 25, 3.5); volumeAt(T1_TRY, 33, 1.0);
T1_TRY.marks = { a: 8, b: 17, c: 25, d: 33 };

// T1 · Apply: the heaviest volume of the chart on a FALLING day.
export const T1_APPLY = genCandles(705, [
  {f:0,p:55,t:'2024-04-01'},{f:0.7,p:60,t:''},{f:1,p:57,t:''}
], 40, 18000000);
overrideCandle(T1_APPLY, 30, {o:60.3, h:60.5, l:56.4, c:56.7});
volumeAt(T1_APPLY, 30, 3.1);
T1_APPLY.markIdx = 30;

// T1 · question charts.
export const T1_Q_WEEKLY = toPeriods(genCandles(706, [
  {f:0,p:30,t:'2023-06-01'},{f:0.5,p:36,t:''},{f:1,p:34,t:''}
], 130, 12000000), 5);
export const T1_Q_VOL = genCandles(707, [
  {f:0,p:70,t:'2024-05-01'},{f:0.5,p:72,t:''},{f:1,p:71,t:''}
], 40, 15000000);
overrideCandle(T1_Q_VOL, 22, {o:71.6, h:72.1, l:71.3, c:71.9});
volumeAt(T1_Q_VOL, 22, 3.3);
T1_Q_VOL.markIdx = 22;
export const T1_Q_SCALE = genCandles(708, [
  {f:0,p:200,t:'2024-06-03'},{f:1,p:210,t:''}
], 30, 15000000);

/* ---------- Technical Analysis T6 ---------- */
/** Where line a crosses line b: the first index at which a is on the other side. */
export function crossings(a, b){
  const out = [];
  for (let i = 1; i < a.length; i++) {
    if (a[i] == null || b[i] == null || a[i - 1] == null || b[i - 1] == null) continue;
    const before = a[i - 1] - b[i - 1], now = a[i] - b[i];
    if (before <= 0 && now > 0) out.push({ idx: i, dir: 'up' });
    else if (before >= 0 && now < 0) out.push({ idx: i, dir: 'down' });
  }
  return out;
}
/** A series with its 20- and 50-day simple averages attached. */
function withAverages(c){
  const closes = c.map((x) => x.c);
  c.ma20 = sma(closes, 20); c.ma50 = sma(closes, 50);
  c.crosses = crossings(c.ma20, c.ma50);
  return c;
}

// T6 · teaching chart: the Artifact's shape (board 08.1a) — a slide, a turn, a climb.
export const T6_TEACH = withAverages(genCandles(801, [
  {f:0,p:112,t:'2024-01-02'},{f:0.2,p:104,t:''},{f:0.35,p:100,t:''},{f:0.5,p:102,t:''},{f:0.62,p:106,t:''},{f:0.8,p:112,t:''},{f:1,p:118,t:''}
], 110, 20000000));

// T6 · the Try chart: a different stock, one upward crossover after the warm-up.
export const T6_TRY = withAverages(genCandles(802, [
  {f:0,p:84,t:'2024-02-01'},{f:0.25,p:74,t:''},{f:0.42,p:68,t:''},{f:0.58,p:72,t:''},{f:0.78,p:80,t:''},{f:1,p:87,t:''}
], 110, 20000000));

// T6 · Apply: a sideways market, where the averages cross again and again.
export const T6_CHOP = withAverages(genCandles(803, [
  {f:0,p:100,t:'2024-03-01'},{f:0.1,p:106,t:''},{f:0.2,p:97,t:''},{f:0.32,p:105,t:''},{f:0.44,p:96,t:''},{f:0.56,p:104,t:''},
  {f:0.68,p:96.5,t:''},{f:0.8,p:105,t:''},{f:0.9,p:97,t:''},{f:1,p:101,t:''}
], 110, 20000000));

// T6 · question charts.
export const T6_Q_ABOVE = withAverages(genCandles(804, [
  {f:0,p:50,t:'2024-04-01'},{f:0.4,p:56,t:''},{f:0.55,p:54.5,t:''},{f:1,p:64,t:''}
], 100, 15000000));
export const T6_Q_DOWN = withAverages(genCandles(805, [
  {f:0,p:70,t:'2024-05-01'},{f:0.35,p:78,t:''},{f:0.55,p:76,t:''},{f:0.8,p:69,t:''},{f:1,p:64,t:''}
], 100, 15000000));
export const T6_Q_LAG = withAverages(genCandles(806, [
  {f:0,p:40,t:'2024-06-03'},{f:0.3,p:35,t:''},{f:0.45,p:33,t:''},{f:0.7,p:38,t:''},{f:1,p:42,t:''}
], 100, 15000000));

/* ---------- Technical Analysis T7 ---------- */
/** RSI (14) attached as candles.rsi — what the price + RSI chart draws. */
export function withRSI(c){ c.rsi = computeRSI(c.map((x) => x.c), 14); return c; }
/**
 * MACD (12, 26, 9) attached as candles.macd: the MACD line (12-day EMA minus
 * 26-day EMA), its 9-day EMA "signal" line, and the histogram (line − signal).
 * Null until each part has enough history: the line from day 26, the signal
 * and histogram from day 34 — the same warm-up idea as a moving average.
 */
export function withMACD(c){
  const closes = c.map((x) => x.c);
  const e12 = ema(closes, 12), e26 = ema(closes, 26);
  const line = closes.map((_, i) => (i >= 25 ? e12[i] - e26[i] : null));
  const sig = ema(line.slice(25), 9);
  const signal = line.map((_, i) => (i >= 33 ? sig[i - 25] : null));
  const hist = line.map((v, i) => (v != null && signal[i] != null ? v - signal[i] : null));
  c.macd = { line, signal, hist };
  return c;
}

// T7 · step 1: a rise, then a fall — RSI above 50 on the way up, below it on the way down.
export const T7_SWING = withRSI(genCandles(901, [
  {f:0,p:50,t:'2024-01-02'},{f:0.5,p:58,t:''},{f:1,p:50.5,t:''}
], 90, 20000000));

// T7 · step 2: a strong, steady rise — RSI stays above 70 while price keeps climbing.
export const T7_STRONG = withRSI(genCandles(902, [
  {f:0,p:40,t:'2024-02-01'},{f:0.15,p:41,t:''},{f:1,p:58,t:''}
], 100, 20000000));

// T7 · step 3: a slide and a recovery, with the MACD panel.
export const T7_MACD = withMACD(genCandles(903, [
  {f:0,p:64,t:'2024-03-01'},{f:0.4,p:52,t:''},{f:0.55,p:54,t:''},{f:1,p:66,t:''}
], 110, 20000000, 0.012));

// T7 · Apply: a steady decline — RSI stays below 30 while price keeps falling.
export const T7_APPLY = withRSI(genCandles(904, [
  {f:0,p:80,t:'2024-04-01'},{f:0.15,p:79,t:''},{f:1,p:62,t:''}
], 100, 20000000));

// T7 · question charts.
export const T7_Q_RSI = withRSI(genCandles(905, [
  {f:0,p:50,t:'2024-05-01'},{f:0.4,p:47,t:''},{f:1,p:55,t:''}
], 90, 15000000));
export const T7_Q_BELOW = withMACD(genCandles(906, [
  {f:0,p:70,t:'2024-06-03'},{f:0.65,p:57,t:''},{f:1,p:56,t:''}
], 100, 15000000, 0.012));
export const T7_Q_HIST = withMACD(genCandles(907, [
  {f:0,p:50,t:'2024-07-01'},{f:0.3,p:49,t:''},{f:0.72,p:63,t:''},{f:1,p:65,t:''}
], 100, 15000000, 0.012));

/* ---------- Technical Analysis T8 ---------- */
// Divergence charts: a steep leg to the first extreme (strong momentum), then a
// slow grind to a second, more extreme one (weaker momentum). The extremes are
// FOUND in the data (markSwings); tests check price and RSI really disagree there.
function divergenceSeries(seed, t, waypoints, pts, n){
  const c = withRSI(genCandles(seed, waypoints.map((w, i) => (i === 0 ? { ...w, t } : { ...w, t: '' })), n, 20000000));
  markSwings(c, pts);
  return c;
}
/**
 * A chart that stops `k` candles after its last swing: what came next is not on
 * screen (the exercise is about what the learner can see), but it is kept as
 * facts so the lesson can say, afterwards, what really happened.
 */
function cutAfterLast(c, k){
  const end = c.swings[c.swings.length - 1].idx + k + 1;
  const cut = c.slice(0, end), rest = c.slice(end);
  cut.rsi = c.rsi.slice(0, end); cut.swings = c.swings;
  cut.after = { maxH: Math.max(...rest.map((x) => x.h)), minL: Math.min(...rest.map((x) => x.l)), lastC: c[c.length - 1].c };
  return cut;
}
// Bearish: two peaks — the second higher in price.
export const T8_BEAR = divergenceSeries(1001, '2024-01-02', [
  {f:0,p:50},{f:0.35,p:60},{f:0.5,p:56},{f:0.82,p:61.5},{f:1,p:56.5}
], [[0.35,'high'],[0.82,'high']], 100);
// Bullish: two lows — the second lower in price.
export const T8_BULL = divergenceSeries(1002, '2024-02-01', [
  {f:0,p:60},{f:0.35,p:50},{f:0.5,p:53.5},{f:0.82,p:49},{f:1,p:53}
], [[0.35,'low'],[0.82,'low']], 100);
// No reversal: the divergence appears, and price keeps climbing anyway.
export const T8_FAIL = divergenceSeries(1003, '2024-03-01', [
  {f:0,p:50},{f:0.28,p:59},{f:0.4,p:56},{f:0.62,p:60.5},{f:0.7,p:58.5},{f:1,p:66}
], [[0.28,'high'],[0.62,'high']], 110);
// The Try chart (Artifact 08.2b): find the two latest peaks, then compare RSI.
const T8_TRY_FULL = divergenceSeries(1004, '2024-04-01', [
  {f:0,p:100},{f:0.25,p:110},{f:0.35,p:105},{f:0.6,p:113},{f:0.7,p:108.5},{f:0.9,p:114.5},{f:1,p:107}
], [[0.6,'high'],[0.9,'high']], 100);
export const T8_TRY = cutAfterLast(T8_TRY_FULL, 4);
// Apply: a bullish divergence inside a decline — and price makes another lower low after it.
const T8_APPLY_FULL = divergenceSeries(1005, '2024-05-01', [
  {f:0,p:80},{f:0.3,p:68},{f:0.42,p:71},{f:0.62,p:66.5},{f:0.72,p:69},{f:1,p:60}
], [[0.3,'low'],[0.62,'low']], 110);
export const T8_APPLY = cutAfterLast(T8_APPLY_FULL, 4);
// Question charts.
export const T8_Q_BEAR = divergenceSeries(1006, '2024-06-03', [
  {f:0,p:40},{f:0.35,p:48},{f:0.5,p:45},{f:0.82,p:49},{f:1,p:45}
], [[0.35,'high'],[0.82,'high']], 100);
export const T8_Q_BULL = divergenceSeries(1007, '2024-07-01', [
  {f:0,p:90},{f:0.35,p:78},{f:0.5,p:82},{f:0.82,p:76.5},{f:1,p:81}
], [[0.35,'low'],[0.82,'low']], 100);
export const T8_Q_FAIL = divergenceSeries(1008, '2024-08-01', [
  {f:0,p:30},{f:0.28,p:36},{f:0.4,p:34},{f:0.62,p:36.8},{f:0.7,p:35.5},{f:1,p:40}
], [[0.28,'high'],[0.62,'high']], 110);


/* ---------- Technical Analysis T9–T12 ---------- */
/** A generated series with its swings marked — [f, 'high'|'low'] at each waypoint to find. */
function swingSeries(seed, t, waypoints, pts, n, vol = 20000000){
  const c = genCandles(seed, waypoints.map((w, i) => (i === 0 ? { ...w, t } : { ...w, t: '' })), n, vol);
  markSwings(c, pts);
  return c;
}
/**
 * Sets each swing to an exact price (a lesson that says "the pullback stopped at
 * 101.50" needs a low that IS 101.50), and keeps every other candle between the
 * neighbouring swings from going past it, so the swing stays the extreme.
 */
function pinSwings(c, prices){
  c.swings.forEach((s, k) => {
    const p = prices[k], from = k ? c.swings[k-1].idx + 1 : 0, to = k < c.swings.length - 1 ? c.swings[k+1].idx - 1 : c.length - 1;
    for(let i = from; i <= to; i++){
      const x = c[i], at = i === s.idx;
      if(s.type === 'low'){ const f = at ? p : p + 0.06; x.o = Math.max(x.o, f); x.c = Math.max(x.c, f); x.l = at ? p : Math.max(x.l, f); x.h = Math.max(x.h, x.o, x.c); }
      else { const f = at ? p : p - 0.06; x.o = Math.min(x.o, f); x.c = Math.min(x.c, f); x.h = at ? p : Math.min(x.h, f); x.l = Math.min(x.l, x.o, x.c); }
    }
    s.price = p;
  });
  return c;
}
const pinned = (seed, t, waypoints, pts, n, prices) => pinSwings(swingSeries(seed, t, waypoints, pts, n), prices);

// T9 · Fibonacci (Artifact 08.4): a move from 90 to 120, and a pullback that stops at 101.50.
export const T9_MOVE = pinned(1101, '2024-01-02', [{f:0,p:90},{f:0.45,p:120},{f:0.72,p:101.6},{f:1,p:122}], [[0.02,'low'],[0.45,'high'],[0.72,'low']], 90, [90, 120, 101.5]);
// A downtrend: the tool runs from the high to the low, and the rally stops near 38.2%.
export const T9_DOWN = pinned(1107, '2024-07-01', [{f:0,p:150},{f:0.45,p:110},{f:0.7,p:125.3},{f:1,p:104}], [[0.02,'high'],[0.45,'low'],[0.7,'high']], 90, [150, 110, 125.2]);
export const T9_TRY = pinned(1102, '2024-02-01', [{f:0,p:50},{f:0.45,p:80},{f:0.7,p:68.5},{f:1,p:83}], [[0.02,'low'],[0.45,'high'],[0.7,'low']], 90, [50, 80, 68.5]);
// Apply: a pullback that goes through every level and below the low it was measured from.
export const T9_APPLY = pinned(1103, '2024-03-01', [{f:0,p:60},{f:0.4,p:80},{f:0.75,p:56.5},{f:1,p:58}], [[0.02,'low'],[0.4,'high'],[0.75,'low']], 90, [60, 80, 56.5]);
export const T9_Q_LEVEL = pinned(1104, '2024-04-01', [{f:0,p:30},{f:0.45,p:50},{f:0.7,p:40},{f:1,p:52}], [[0.02,'low'],[0.45,'high'],[0.7,'low']], 90, [30, 50, 40]);
export const T9_Q_PRICE = pinned(1105, '2024-05-01', [{f:0,p:40},{f:0.45,p:60},{f:0.7,p:50.5},{f:1,p:61}], [[0.02,'low'],[0.45,'high'],[0.7,'low']], 90, [40, 60, 50.5]);
export const T9_Q_DOWN = pinned(1106, '2024-06-03', [{f:0,p:80},{f:0.45,p:60},{f:0.7,p:67.6},{f:1,p:57}], [[0.02,'high'],[0.45,'low'],[0.7,'high']], 90, [80, 60, 67.6]);

// T10 · chart patterns. The Try's head and shoulders (Artifact 08.5), the Apply's
// double top that has NOT broken its neckline, and question charts.
const HS_PTS = [[0.15,'high'],[0.3,'low'],[0.5,'high'],[0.67,'low'],[0.82,'high']];
export const T10_TRY = pinned(1201, '2024-01-02', [{f:0,p:90},{f:0.15,p:104},{f:0.3,p:97},{f:0.5,p:110},{f:0.67,p:97.5},{f:0.82,p:103.5},{f:1,p:91}], HS_PTS, 100, [105, 96.5, 111.5, 96.5, 104]);
export const T10_APPLY = pinned(1202, '2024-02-01', [{f:0,p:70},{f:0.3,p:84},{f:0.5,p:77},{f:0.72,p:83.8},{f:0.86,p:80},{f:1,p:79.5}], [[0.3,'high'],[0.5,'low'],[0.72,'high']], 80, [84.2, 76.2, 84.5]);
export const T10_Q_HS = pinned(1203, '2024-03-01', [{f:0,p:40},{f:0.15,p:47},{f:0.3,p:43.5},{f:0.5,p:50},{f:0.67,p:43.8},{f:0.82,p:46.8},{f:1,p:41}], HS_PTS, 100, [47.2, 43.3, 50.3, 43.4, 47]);
export const T10_Q_DB = pinned(1204, '2024-04-01', [{f:0,p:70},{f:0.25,p:58},{f:0.45,p:64},{f:0.65,p:58.3},{f:0.85,p:66},{f:1,p:68}], [[0.25,'low'],[0.45,'high'],[0.65,'low']], 90, [58, 64, 58.2]);
// A head and shoulders that breaks its neckline — and then price climbs past the head.
export const T10_Q_FAIL = pinned(1205, '2024-05-01', [{f:0,p:60},{f:0.13,p:67},{f:0.26,p:63.5},{f:0.42,p:70},{f:0.56,p:63.8},{f:0.68,p:66.8},{f:0.78,p:61.5},{f:1,p:72}], [[0.13,'high'],[0.26,'low'],[0.42,'high'],[0.56,'low'],[0.68,'high'],[0.78,'low']], 110, [67, 63.5, 70, 63.7, 66.8, 61.5]);

// T11 · reversal vs continuation.
export const T11_INV_HS = pinned(1301, '2024-01-02', [{f:0,p:110},{f:0.15,p:96},{f:0.3,p:103},{f:0.5,p:90},{f:0.67,p:103.5},{f:0.82,p:97},{f:1,p:112}], [[0.15,'low'],[0.3,'high'],[0.5,'low'],[0.67,'high'],[0.82,'low']], 100, [95.5, 103.5, 90, 103.5, 96.5]);
// A rectangle inside an uptrend: a flat ceiling and floor, then the rise carries on.
export const T11_RECT = pinned(1302, '2024-02-01', [{f:0,p:60},{f:0.3,p:75},{f:0.38,p:70},{f:0.46,p:75.2},{f:0.54,p:70.3},{f:0.62,p:75.1},{f:0.7,p:70.5},{f:0.8,p:75},{f:1,p:84}], [[0.3,'high'],[0.38,'low'],[0.46,'high'],[0.54,'low'],[0.62,'high'],[0.7,'low']], 100, [75, 70, 75.2, 70.2, 75.1, 70.4]);
// Apply: a flag after a rise — and price falls out of the bottom of it instead.
export const T11_APPLY = pinned(1303, '2024-03-01', [{f:0,p:50},{f:0.35,p:68},{f:0.45,p:64},{f:0.52,p:66.5},{f:0.6,p:63.5},{f:0.68,p:65.8},{f:0.76,p:63},{f:1,p:55}], [[0.35,'high'],[0.45,'low'],[0.52,'high'],[0.6,'low'],[0.68,'high']], 100, [68, 64, 66.6, 63.4, 65.8]);
export const T11_Q_FLAG = pinned(1304, '2024-04-01', [{f:0,p:30},{f:0.35,p:42},{f:0.45,p:39.5},{f:0.52,p:41},{f:0.6,p:38.8},{f:0.68,p:40.2},{f:1,p:49}], [[0.35,'high'],[0.45,'low'],[0.52,'high'],[0.6,'low']], 100, [42.2, 39.6, 41.2, 38.8]);
// Two peaks at the same height after a rise — the floor between them never breaks, and the rise carries on.
export const T11_Q_CONTEXT = pinned(1305, '2024-05-01', [{f:0,p:40},{f:0.45,p:60},{f:0.56,p:56.5},{f:0.65,p:60.3},{f:0.75,p:56.6},{f:1,p:64}], [[0.45,'high'],[0.56,'low'],[0.65,'high'],[0.75,'low']], 100, [60.4, 56.4, 60.5, 56.6]);
export const T11_Q_TRI = pinned(1306, '2024-06-03', [{f:0,p:50},{f:0.3,p:64},{f:0.4,p:58},{f:0.5,p:63},{f:0.6,p:59},{f:0.68,p:62},{f:0.75,p:60},{f:1,p:52}], [[0.3,'high'],[0.4,'low'],[0.5,'high'],[0.6,'low'],[0.68,'high']], 100, [64.2, 58, 63, 58.1, 62]);

// T12 · the project: several tools on one situation.
/** 50-day average and RSI attached: one series, drawn with its trend line and its momentum. */
function withTools(c){ c.ma50 = sma(c.map((x) => x.c), 50); return withRSI(c); }
// Steps 1–2: an uptrend testing a ceiling again and again — the last push with less momentum.
export const T12_TEACH = withTools(pinned(1401, '2024-01-02', [{f:0,p:52},{f:0.25,p:58},{f:0.4,p:54.5},{f:0.5,p:58.2},{f:0.72,p:56.6},{f:0.95,p:58.4},{f:1,p:57}], [[0.25,'high'],[0.4,'low'],[0.5,'high'],[0.72,'low'],[0.95,'high']], 110, [58, 54.5, 58.2, 56.6, 58.4]));
T12_TEACH.resist = bandOf(T12_TEACH, T12_TEACH.swings.filter((s) => s.type === 'high').map((s) => s.idx), 'high', 0.2);
// Step 3: a range breakout — where the idea is wrong, and a measured estimate.
export const T12_PLAN = rangeThenBreak(1402, '2024-02-01', {o:49.3, h:52.3, l:49.1, c:52.0}, 53, 2.6, [0.4, -0.2, 0.5, 0.3]);
/**
 * An uptrend and a close above a twice-tested ceiling. `wp` shapes the run into
 * the breakout (a slow grind = less momentum than at the last peak; a sharp
 * run = more); `volMult` is the breakout day's volume against the average.
 */
function uptrendBreak(seed, t, wp, volMult, breakPatch){
  const c = genCandles(seed, [{f:0,p:40,t}, ...wp.map((w) => ({ ...w, t: '' }))], 110, 20000000);
  c.breakIdx = 100;
  capHighs(c, c.breakIdx, 50.2);
  markSwings(c, [[0.25,'high'],[0.4,'low'],[wp[2].f,'high'],[0.7,'low']]);
  pinSwings(c, [50, 46.5, 50.1, 48]);
  c.resist = bandOf(c, c.swings.filter((s) => s.type === 'high').map((s) => s.idx), 'high', 0.15);
  overrideCandle(c, c.breakIdx, breakPatch);
  c[c.breakIdx].v = c.slice(0, c.breakIdx).reduce((s, x) => s + x.v, 0) / c.breakIdx * volMult;
  continueFrom(c, c.breakIdx + 1, [0.1, -0.1, 0.15, 0.05, -0.1, 0.1, 0.05, 0.1, -0.05]);
  c.rangeLow = c.swings[1].price;
  return withTools(c);
}
// The Try: a slow grind into the breakout, on thin volume.
export const T12_CASE = uptrendBreak(1403, '2024-03-01', [{f:0.25,p:50},{f:0.4,p:46.5},{f:0.5,p:50},{f:0.7,p:48},{f:0.9,p:49.7},{f:1,p:50.9}], 0.6, {o:49.95, h:50.8, l:49.8, c:50.6});
// Apply (the knowledge base's scenario): a breakout on heavy volume with RSI already above 70.
export const T12_APPLY = withRSI(rangeThenBreak(1404, '2024-04-01', {o:49.5, h:53.2, l:49.4, c:53.0}, 55, 2.7, [0.7, 0.5, 0.6, 0.4]));
// Question charts: tools that agree (a sharp run, heavy volume); a plan; a trend with fading momentum.
export const T12_Q_AGREE = uptrendBreak(1405, '2024-05-01', [{f:0.25,p:50},{f:0.4,p:46.5},{f:0.55,p:50},{f:0.7,p:48},{f:0.84,p:48.3},{f:0.92,p:50.8},{f:1,p:52}], 2.4, {o:49.9, h:51.6, l:49.8, c:51.4});
export const T12_Q_PLAN = rangeThenBreak(1406, '2024-06-03', {o:49.2, h:52.0, l:49.0, c:51.7}, 52.6, 2.2, [0.3, -0.2, 0.4, 0.2]);
export const T12_Q_DIV = withTools(pinned(1407, '2024-07-01', [{f:0,p:30},{f:0.25,p:38},{f:0.4,p:35.5},{f:0.62,p:38.5},{f:0.78,p:36.8},{f:0.92,p:38.9},{f:1,p:38}], [[0.25,'high'],[0.4,'low'],[0.62,'high'],[0.78,'low'],[0.92,'high']], 110, [38.2, 35.5, 38.6, 36.8, 39.1]));

/* ---------- Fundamentals P8 ---------- */
// Company D's share price around a quarterly report: a climb into it, then a
// gap down the morning after — results beat expectations, but the full-year
// growth guidance was cut. The gap is cut in the same way as F3's.
export const P8_REPORT = genCandles(1501, [{f:0,p:138,t:'2025-01-02'},{f:0.75,p:160,t:''},{f:1,p:161,t:''}], 60, 3000000);
P8_REPORT.reportIdx = 45;
shiftFrom(P8_REPORT, P8_REPORT.reportIdx, -18);
P8_REPORT[P8_REPORT.reportIdx].v *= 3.5;
P8_REPORT.prevClose = P8_REPORT[P8_REPORT.reportIdx-1].c;
P8_REPORT.gapOpen = P8_REPORT[P8_REPORT.reportIdx].o;
P8_REPORT[P8_REPORT.reportIdx].h = Math.min(P8_REPORT[P8_REPORT.reportIdx].h, P8_REPORT.gapOpen + 0.6);

/* ---------- Risk (R1, R2, R5, R7) ---------- */
/** Candles from a path of closes (R2's simulated prices): each opens where the last one closed. */
export function closesToCandles(closes, t){
  const start = new Date(t);
  return closes.slice(1).map((c, i) => { const o = closes[i], d = new Date(start); d.setDate(d.getDate() + i); return { t: d, o, c, h: Math.max(o, c) * 1.002, l: Math.min(o, c) * 0.998, v: 1000000 }; });
}
// R1 · the same start and end, a calm path and a wild one.
export const R1_CALM = genCandles(1601, [{f:0,p:100,t:'2024-01-02'},{f:1,p:112,t:''}], 120, 18000000, 0.006);
export const R1_WILD = genCandles(1602, [{f:0,p:100,t:'2024-01-02'},{f:0.2,p:122,t:''},{f:0.4,p:94,t:''},{f:0.6,p:124,t:''},{f:0.8,p:97,t:''},{f:1,p:112,t:''}], 120, 18000000, 0.03);
// R1 · a drawdown: a peak, a trough, and a partial recovery.
export const R1_DD = pinned(1603, '2024-01-02', [{f:0,p:100},{f:0.4,p:140},{f:0.7,p:91},{f:1,p:118}], [[0.4,'high'],[0.7,'low']], 110, [140, 91]);
export const R1_TRY = pinned(1604, '2024-03-01', [{f:0,p:60},{f:0.35,p:80},{f:0.7,p:50},{f:1,p:58}], [[0.35,'high'],[0.7,'low']], 100, [80, 50]);
export const R1_Q = pinned(1605, '2024-05-01', [{f:0,p:30},{f:0.4,p:40},{f:0.75,p:30},{f:1,p:36}], [[0.4,'high'],[0.75,'low']], 100, [40, 30]);
// R5 · the Artifact's trade: a pullback to a low, an entry on the way back up, and a target above the last high.
export const R5_TRADE = pinned(1611, '2024-02-01', [{f:0,p:92},{f:0.35,p:108},{f:0.55,p:101.6},{f:0.62,p:104},{f:1,p:112.5}], [[0.35,'high'],[0.55,'low']], 100, [108, 101.4]);
R5_TRADE.entryIdx = R5_TRADE.findIndex((x, i) => i > R5_TRADE.swings[1].idx && x.c >= 104);
// R5 · the Try: the chart stops where the trade would be entered.
export const R5_PLAN = pinned(1612, '2024-04-01', [{f:0,p:44},{f:0.4,p:52.8},{f:0.72,p:47.6},{f:1,p:49.6}], [[0.4,'high'],[0.72,'low']], 90, [52.8, 47.6]);
// R7 · a 30% fall from the peak, and the recovery after it.
export const R7_CRASH = pinned(1621, '2024-01-02', [{f:0,p:100},{f:0.3,p:125},{f:0.5,p:87.5},{f:1,p:121}], [[0.3,'high'],[0.5,'low']], 160, [125, 87.5]);
// R7 · a bubble: a steady rise, a near-vertical one, and the collapse.
export const R7_BUBBLE = pinned(1622, '2024-01-02', [{f:0,p:20},{f:0.45,p:26},{f:0.62,p:40},{f:0.75,p:70},{f:0.85,p:40},{f:1,p:28}], [[0.75,'high']], 120, [70]);
