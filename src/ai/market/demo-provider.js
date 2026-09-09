// ---------------------------------------------------------------------------
// DemoProvider — works with zero network calls and zero API key.
//
// Purpose: local development, offline demos, and a safety valve if the real
// provider's quota is exhausted. It satisfies the exact same
// MarketDataProvider contract as TwelveDataProvider (see
// provider-interface.js), so switching providers never requires touching
// the AI or UI layers — see setActiveMarketDataProvider() in index.js.
//
// Hard rule (this is the whole point of a Demo Mode, not an optional
// nicety): every value this returns is clearly, structurally marked as
// fake. `isDemo: true` on the provider, and every quote/history object also
// carries `isDemo: true` so a formatter can't accidentally drop the label
// partway through a call chain. Nothing here should ever be presented to a
// user as if it were a real price. See docs/MARKET_DATA.md.
//
// Determinism: the same ticker always produces the same series (seeded by a
// hash of the ticker string), so the demo is stable and screenshotable
// rather than jumping around on every reload.
// ---------------------------------------------------------------------------

function demoSeedFromString(str){
  let h = 2166136261;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 — small, fast, deterministic PRNG. Not cryptographic; doesn't
// need to be, this only ever generates illustrative fake prices.
function demoRandomGenerator(seed){
  let a = seed;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function demoGenerateHistory(ticker, days){
  days = days || 260;
  const rand = demoRandomGenerator(demoSeedFromString(ticker.toUpperCase()));
  // Start price varies by ticker (deterministically) so different demo
  // tickers don't all look identical, then walks with a mild upward drift
  // and daily noise — enough to produce plausible RSI/MACD/trend behavior.
  let price = 20 + rand() * 180;
  const history = [];
  const start = new Date();
  start.setDate(start.getDate() - days);
  for(let i = 0; i < days; i++){
    const drift = 0.0003;
    const noise = (rand() - 0.5) * 0.03;
    price = Math.max(1, price * (1 + drift + noise));
    const open = price * (1 + (rand()-0.5)*0.01);
    const high = Math.max(open, price) * (1 + rand()*0.008);
    const low = Math.min(open, price) * (1 - rand()*0.008);
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    history.push({
      date: d.toISOString().slice(0,10),
      open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2),
      close: +price.toFixed(2), volume: Math.floor(1_000_000 + rand()*40_000_000)
    });
  }
  return history;
}

async function demoGetHistory(ticker, days){
  return demoGenerateHistory(ticker, days).map(bar => Object.assign({ isDemo: true }, bar));
}

async function demoGetQuote(ticker){
  const history = demoGenerateHistory(ticker, 260);
  const last = history[history.length-1], prev = history[history.length-2];
  const highs = history.map(b=>b.high), lows = history.map(b=>b.low);
  return {
    isDemo: true,
    price: last.close,
    change: +(last.close - prev.close).toFixed(2),
    changePct: +(((last.close - prev.close) / prev.close) * 100).toFixed(2),
    asOf: last.date,
    previousClose: prev.close,
    week52: { high: Math.max(...highs), low: Math.min(...lows) }
  };
}

async function demoGetFundamentals(ticker){
  const rand = demoRandomGenerator(demoSeedFromString(ticker.toUpperCase() + '-fund'));
  return {
    isDemo: true,
    valuations_metrics: {
      trailing_pe: +(10 + rand()*40).toFixed(1),
      market_capitalization: (rand()*500 + 1).toFixed(1) + 'B (demo)'
    }
  };
}

async function demoSearchSymbol(queryText){
  // No real database in Demo Mode — synthesize one clearly-fake match so the
  // rest of the resolution pipeline (which expects a symbol_search shape)
  // still has something to rank, without ever claiming this is a real
  // company. The synthesized ticker is deterministic per query.
  //
  // Critical guard: only do this for something that's actually shaped like
  // a company-name attempt. A real provider naturally returns no match for
  // an ordinary question ("who is more profitable?") because no company is
  // named "who is more profitable" — but this function used to fabricate a
  // plausible-looking match for ANY non-empty string, including exactly
  // that kind of natural-language question when it reached here as a
  // (wrongly) extracted "candidate". Reuses the same comparison/pronoun
  // pattern detection the AI's entity-context layer already relies on
  // (conversation-context.js) rather than inventing a second, parallel
  // keyword list — a query that reads as a comparison or pronoun reference
  // is by definition not someone naming a company.
  const norm = normalizeText(queryText);
  if(looksLikeEntityComparison(norm) || looksLikeEntityPronounReference(norm)) return [];
  const cleaned = queryText.trim().replace(/\s+/g, ' ');
  if(!cleaned) return [];
  const fakeTicker = ('DEMO' + demoSeedFromString(cleaned.toUpperCase()).toString(36).slice(0,4)).toUpperCase();
  return [{
    symbol: fakeTicker,
    instrument_name: `${cleaned} (Demo)`,
    exchange: 'DEMO',
    instrument_type: 'Common Stock',
    isDemo: true
  }];
}

// Satisfies the MarketDataProvider contract in provider-interface.js.
const DemoProvider = {
  id: 'demo',
  isDemo: true,
  sourceLabel: 'Demo Mode — נתוני הדגמה, אינם משקפים מחירים אמיתיים',
  hasApiKey: () => true, // demo mode never needs a key
  getQuote: demoGetQuote,
  getHistory: demoGetHistory,
  getFundamentals: demoGetFundamentals,
  searchSymbol: demoSearchSymbol
};
