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

export function genCandles(seed, waypoints, n, baseVol){
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
    const noise=(rng()-0.5)*(hi.p+lo.p)/2*0.018;
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
