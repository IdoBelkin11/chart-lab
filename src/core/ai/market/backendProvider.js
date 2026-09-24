// ---------------------------------------------------------------------------
// BackendProvider — talks to Chart Lab's OWN market API, not a vendor's.
//
// This is the seam that lets the frontend stop knowing about Twelve Data.
// It speaks a normalized contract we control:
//
//   GET {base}/quote?symbol=AAPL
//   GET {base}/history?symbol=AAPL&interval=1day&outputsize=260
//   GET {base}/search?q=Apple
//
// and expects responses already in the shape provider-interface.js
// documents. That means a future backend can swap Twelve Data for anything
// else — or serve a blend of providers — without a single change above this
// file.
//
// NO CREDENTIALS LIVE HERE. The whole point is that the browser authenticates
// (if at all) to our own origin, and the provider secret stays server-side.
//
// This provider is only selected when window.CHART_LAB_CONFIG.marketApiBase
// is present. The backend itself is deliberately NOT implemented in this
// change — see docs/MARKET_DATA.md. Until it exists, the app runs on
// DemoProvider, which is the safe public default.
// ---------------------------------------------------------------------------

export function backendApiBase(){
  const g = (typeof globalThis !== 'undefined') ? globalThis : null;
  const cfg = (g && g.CHART_LAB_CONFIG) || {};
  const base = cfg.marketApiBase;
  return (typeof base === 'string' && base) ? base.replace(/\/$/, '') : null;
}

export async function backendFetchJson(path, params){
  const base = backendApiBase();
  if(!base) throw new Error('backend_unconfigured');
  const qs = Object.keys(params || {})
    .filter(k => params[k] != null && params[k] !== '')
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
  const res = await fetch(base + '/' + path + (qs ? '?' + qs : ''), { cache: 'no-store' });
  if(!res.ok) throw new Error('backend_http_' + res.status);
  // A 200 is NOT proof the backend answered. Anything that serves an SPA
  // fallback — the Vite dev server, a misconfigured redirect, a captive
  // portal, a CDN error page — returns 200 with an HTML body, and res.json()
  // then fails with a parse error that reads like a bug rather than like
  // "there is no backend here". Checking the content type turns that into an
  // honest, catchable signal, which is what lets the caller fall back.
  const type = res.headers.get('content-type') || '';
  if(!type.includes('json')) throw new Error('backend_not_json');
  return res.json();
}

export async function backendGetQuote(ticker){
  // The backend is expected to return the normalized quote shape directly,
  // so there is no vendor-specific field mapping in the frontend.
  return backendFetchJson('quote', { symbol: ticker });
}

export async function backendGetHistory(ticker, days){
  const json = await backendFetchJson('history', { symbol: ticker, interval: '1day', outputsize: days });
  return Array.isArray(json) ? json : (json && json.values) || [];
}

export async function backendGetFundamentals(ticker){
  // Best-effort, exactly like the other providers: fundamentals are optional
  // and a failure here must never break a price answer.
  try { return await backendFetchJson('fundamentals', { symbol: ticker }); }
  catch(e){ return null; }
}

export async function backendSearchSymbol(queryText){
  // Deliberately NOT wrapped in a try/catch that returns [].
  //
  // An empty array means "I searched, and this is not a company." A backend
  // that could not be reached has said no such thing, and collapsing the two
  // is what made the stock page answer "I couldn't find a company by that
  // name" whenever the API was down — blaming the visitor's spelling for an
  // outage. In local dev that is the normal state (Vite serves the SPA shell
  // for /api/market/*, so every search 200s with HTML), which is exactly how
  // the bug stayed invisible.
  //
  // Fundamentals above still swallow their failure, and should: they are
  // optional enrichment on an answer that succeeds without them. A search is
  // not optional — it IS the answer.
  const json = await backendFetchJson('search', { q: queryText });
  return Array.isArray(json) ? json : (json && json.data) || [];
}

// Satisfies the MarketDataProvider contract in provider-interface.js.
export const BackendProvider = {
  id: 'chartlab-backend',
  isDemo: false,
  sourceLabel: 'Chart Lab API',
  hasApiKey: () => !!backendApiBase(),   // "configured", not "holds a secret"
  getQuote: backendGetQuote,
  getHistory: backendGetHistory,
  getFundamentals: backendGetFundamentals,
  searchSymbol: backendSearchSymbol
};

