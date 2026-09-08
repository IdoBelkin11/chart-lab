// Pure indicator math. No network, no provider — these are the numbers the
// AI reports, so they get verified against known mathematical properties,
// not just "did it run without crashing."
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  const engine = loadEngine();

  await describe('SMA / EMA', async (t) => {
    const closes = []; for(let i=0;i<60;i++) closes.push(100+i); // clean uptrend 100..159
    t.equal('SMA(20) of a linear ramp', engine.mdSma(closes,20), 149.5);
    t.check('EMA(12) is a finite number close to the recent range', engine.emaSeries(closes,12) > 140 && engine.emaSeries(closes,12) < 160);
  });

  await describe('RSI extremes', async (t) => {
    const up = []; for(let i=0;i<30;i++) up.push(100+i); // pure uptrend
    const down = []; for(let i=0;i<30;i++) down.push(200-i); // pure downtrend
    t.equal('RSI on a pure uptrend is 100 (no losses at all)', engine.rsi(up,14), 100);
    t.equal('RSI on a pure downtrend is 0 (no gains at all)', engine.rsi(down,14), 0);
  });

  await describe('volatility', async (t) => {
    const flat = new Array(30).fill(50);
    t.equal('volatility of a flat series is 0', engine.volatilityPct(flat,20), 0);
    const alt = [100]; for(let i=0;i<25;i++) alt.push(alt[alt.length-1]*(i%2===0?1.01:0.99));
    t.check('volatility of an oscillating series is positive', engine.volatilityPct(alt,20) > 0);
  });

  await describe('MACD', async (t) => {
    const uptrend = []; for(let i=0;i<60;i++) uptrend.push(100+i*0.5);
    const m = engine.macd(uptrend);
    t.check('MACD line is positive during a sustained uptrend', m.macd > 0);
  });

  await describe('52-week high/low', async (t) => {
    const history = []; for(let i=0;i<60;i++) history.push({ high: 100+i+2, low: 100+i-2, close: 100+i });
    const w = engine.fiftyTwoWeek(history);
    t.equal('52w high', w.high, 161);
    t.equal('52w low', w.low, 98);
  });

  await describe('pctChange and trend description', async (t) => {
    t.equal('pctChange(100,110)', engine.pctChange(100,110), 10);
    const uptrend = []; for(let i=0;i<60;i++) uptrend.push(100+i);
    const desc = engine.describeTrend(uptrend, true);
    // Regression guard: a earlier version produced "מעלממוצע" (missing a
    // space, "מעל" + "ל" + "ממוצע" concatenated wrong).
    t.check('trend description has correct Hebrew grammar (no concatenation bug)', desc.includes('מעל לממוצע'));
  });

  if(require.main === module) finalizeSuites();
})();
