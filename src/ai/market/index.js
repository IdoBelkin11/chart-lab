// ---------------------------------------------------------------------------
// Market-data orchestration.
//
// This is the seam the whole provider abstraction exists for: everything
// above this file (the AI's intent/formatting layer, the UI's stock card)
// calls getMarketData(ticker) and only ever sees the shape documented
// below. Swapping TwelveDataProvider for DemoProvider — or a future real
// provider — never requires touching anything above this file.
// ---------------------------------------------------------------------------

// Default to the live provider. Flip with setActiveMarketDataProvider(DemoProvider)
// for local development or offline demos — see docs/MARKET_DATA.md.
let activeMarketDataProvider = TwelveDataProvider;
const marketDataCache = {}; // ticker -> { ts, promise } — avoid refetching within a session

function setActiveMarketDataProvider(provider){
  activeMarketDataProvider = provider;
  Object.keys(marketDataCache).forEach(k => delete marketDataCache[k]);
}
function getActiveMarketDataProvider(){
  return activeMarketDataProvider;
}

// Top-level `const`/`let` (including the DemoProvider/TwelveDataProvider
// objects themselves) do NOT become `window` properties in a plain script —
// only `var` and function declarations do. That's invisible to code inside
// this same script (ordinary lexical scope still sees them), but it means
// anything reaching in from OUTSIDE this script tag — browser console
// tooling, an automated end-to-end test driver, a future settings panel —
// silently gets `undefined` instead of the real object. This was caught by
// exactly that kind of external check during testing. Explicit exports for
// the small public surface a caller outside this file might reasonably need:
if(typeof window !== 'undefined'){
  window.DemoProvider = DemoProvider;
  window.TwelveDataProvider = TwelveDataProvider;
}

// Returns { ok:true, data:{...}, fetchedAt } or { ok:false, reason }.
// Never throws past this point, and never returns a fabricated number —
// a provider failure always becomes an explicit ok:false.
async function getMarketData(ticker){
  const provider = activeMarketDataProvider;
  if(!provider.hasApiKey()){
    return { ok:false, reason:'no_api_key' };
  }
  const cacheKey = provider.id + ':' + ticker;
  const cacheHit = marketDataCache[cacheKey];
  if(cacheHit && (Date.now() - cacheHit.ts) < 2 * 60 * 1000) return cacheHit.promise;

  const p = (async () => {
    let history, quote;
    try{
      [history, quote] = await Promise.all([
        provider.getHistory(ticker),
        provider.getQuote(ticker)
      ]);
    }catch(e){
      return { ok:false, reason:'no_price_source' };
    }
    if(!history || history.length < 2 || !quote) return { ok:false, reason:'no_price_source' };

    const closes = history.map(r => r.close);
    const last = history[history.length-1];
    const asOfDate = quote.asOf || last.date;
    const price = quote.price != null ? quote.price : last.close;
    const week52 = quote.week52 || fiftyTwoWeek(history);

    const result = {
      ticker,
      isDemo: !!provider.isDemo,
      asOf: asOfDate,
      price,
      open: last.open, high: last.high, low: last.low, volume: last.volume,
      change: quote.change, changePct: quote.changePct,
      sma20: mdSma(closes, 20), sma50: mdSma(closes, 50), sma200: mdSma(closes, 200),
      ema12: emaSeries(closes, 12), ema26: emaSeries(closes, 26),
      rsi14: rsi(closes, 14),
      macd: macd(closes),
      volatility20: volatilityPct(closes, 20),
      week52,
      monthChangePct: history.length > 21 ? pctChange(closes[closes.length-22], price) : null,
      history,
      source: provider.sourceLabel
    };

    // Fundamentals are best-effort and additive — their absence never fails
    // the whole request.
    try{
      const fd = await provider.getFundamentals(ticker);
      if(fd) result.fundamentals = fd;
    }catch(e){ /* fundamentals unavailable is not an error for price/technical questions */ }

    return { ok:true, data: result, fetchedAt: formatTimestamp(new Date()) };
  })();
  marketDataCache[cacheKey] = { ts: Date.now(), promise: p };
  return p;
}
