// Unit tests for the market proxy's pure logic. No Firebase SDK, no emulator.
const n = require('../src/normalize.js');
let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? pass++ : (fail++, console.log('  ✗ ' + name)); };

n._resetForTests();
const q = n.normalizeQuote({ symbol:'AAPL', name:'Apple Inc', exchange:'NASDAQ',
  close:'171.20', previous_close:'169.42', percent_change:'1.05', currency:'USD', datetime:'2026-09-07' });
ok('quote is numeric, not string', typeof q.price === 'number' && q.price === 171.2);
ok('quote is flagged as live, not demo', q.isDemo === false);
ok('quote carries provenance', q.source === 'Twelve Data' && q.asOf === '2026-09-07');
ok('missing close yields null rather than a broken object', n.normalizeQuote({}) === null);

// change was missing from this shape entirely — the frontend's direction
// word (up/down) reads `change >= 0`, and `undefined >= 0` is false, so
// every quote silently displayed as "down" regardless of the real move
// (the percentage, which DID come through via changePct, still showed the
// correct sign — exactly the "down +9.12%" contradiction this caught).
const up = n.normalizeQuote({ symbol:'AAPL', close:'171.20', previous_close:'169.42', change:'1.78', percent_change:'1.05' });
ok('change is present and numeric', typeof up.change === 'number');
ok('change agrees in sign with changePct', (up.change >= 0) === (up.changePct >= 0));
const down = n.normalizeQuote({ symbol:'AAPL', close:'169.42', previous_close:'171.20', change:'-1.78', percent_change:'-1.04' });
ok('a real decline is negative, not defaulted positive', down.change < 0 && down.changePct < 0);
// Vendor response missing the field outright (not just this test's own
// close/previous_close inputs) still yields a correctly-signed number,
// computed rather than left undefined.
const fallback = n.normalizeQuote({ symbol:'AAPL', close:'171.20', previous_close:'169.42', percent_change:'1.05' });
ok('falls back to price minus previous close when the vendor omits change', Math.abs(fallback.change - 1.78) < 0.001);

const h = n.normalizeHistory({ values: [
  { datetime:'2026-09-07', open:'1', high:'2', low:'0.5', close:'1.5', volume:'100' },
  { datetime:'2026-09-06', open:'1', high:'2', low:'0.5', close:'1.2', volume:'90' }
]});
ok('history is oldest-first for the chart renderers', h[0].date === '2026-09-06');
ok('history values are numeric', typeof h[0].close === 'number');
ok('empty history is an array, not undefined', Array.isArray(n.normalizeHistory({})));

const s = n.normalizeSearch({ data: [{ symbol:'AAPL', instrument_name:'Apple Inc', exchange:'NASDAQ' }] });
ok('search maps instrument_name to name', s[0].name === 'Apple Inc');
ok('search caps result count', n.normalizeSearch({ data: new Array(50).fill({ symbol:'X' }) }).length === 20);

n._resetForTests();
n.cacheSet('k', { a:1 }, 1000);
ok('cache returns a fresh entry', !!n.cacheGet('k'));
n.cacheSet('expired', { a:1 }, -1);
ok('cache drops an expired entry', n.cacheGet('expired') === null);

n._resetForTests();
let limited = false;
for(let i = 0; i < n.RATE_LIMIT.max + 5; i++) if(n.rateLimited('1.2.3.4')) limited = true;
ok('rate limiting engages past the window max', limited);
ok('a different caller is unaffected', !n.rateLimited('5.6.7.8'));

console.log(`functions/normalize: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
