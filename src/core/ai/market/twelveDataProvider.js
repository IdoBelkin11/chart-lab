// ---------------------------------------------------------------------------
// TwelveDataProvider — the live MarketDataProvider implementation.
//
// Rejected alternatives, and why, are recorded in docs/MARKET_DATA.md — this
// isn't the first source tried; Yahoo (no CORS), Finnhub (no CORS),
// IEX Cloud (discontinued), marketdata.app (license forbids public sites),
// and Stooq (started requiring a CAPTCHA-issued key in April 2026) were all
// ruled out first. Don't re-litigate that search without new evidence that
// one of them changed.
//
// SECURITY — the key is NOT in this file and must never be.
//
// This module ships inside a public static site. A key written here is
// readable by every visitor via view-source, and on Twelve Data's free plan
// the quota is shared site-wide (800/day, 8/min TOTAL), so an exposed key is
// both a credential leak and a denial-of-service vector. A real key WAS
// previously hardcoded here; it has been removed and must be treated as
// compromised and rotated at the provider.
//
// Credentials are now resolved at runtime, in this order:
//   1. A backend proxy base URL (preferred). The browser calls our own API
//      and the secret stays server-side. See marketApiBase below.
//   2. An explicitly injected key, for LOCAL DEVELOPMENT ONLY, supplied by
//      the host page rather than committed here.
//   3. Nothing — in which case this provider reports itself unavailable and
//      the app runs on DemoProvider, which is the public default.
//
// A regression test (tests/market/no-secrets.test.js) fails the build if a
// secret-like key reappears in dist/index.html.
// ---------------------------------------------------------------------------

// Runtime configuration, supplied by the host page or a backend-rendered
// template — never committed. Shape:
//   window.CHART_LAB_CONFIG = {
//     marketApiBase: '/api/market',   // preferred: our own backend proxy
//     twelveDataKey:  '...'           // local dev escape hatch only
//   }
// Resolved from globalThis rather than `window` so the same code path works
// in a browser, a worker, and the test sandbox — `window` does not exist in
// all three, and a config that silently reads as empty would make a
// misconfigured deployment look like a deliberate demo-mode choice.
export function marketRuntimeConfig(){
  const g = (typeof globalThis !== 'undefined') ? globalThis : null;
  return (g && g.CHART_LAB_CONFIG) || {};
}
// Preferred path: our own backend. The frontend is deliberately NOT coupled
// to Twelve Data's URL shape here — see backend-provider.js, which speaks
// Chart Lab's own /api/market/* contract.
export function marketApiBase(){
  const base = marketRuntimeConfig().marketApiBase;
  return (typeof base === 'string' && base) ? base.replace(/\/$/, '') : null;
}
// Local-development-only direct key. Absent in any public build.
export function twelveDataKey(){
  const k = marketRuntimeConfig().twelveDataKey;
  return (typeof k === 'string' && k) ? k : null;
}
export function twelveDataConfigured(){
  return !!(marketApiBase() || twelveDataKey());
}
// Builds a request URL: through our backend when configured, otherwise
// directly against the provider using a dev-supplied key.
// Chart Lab's own path names, mapped to the vendor's when talking to it
// directly. Keeping our names at the call sites is what lets a backend proxy
// drop in later without editing this provider's callers — but the direct
// path must still use Twelve Data's real endpoint names, or every request
// 404s. (That mismatch was a real bug introduced during this refactor and
// caught by the market tests.)
export const TWELVE_DATA_PATHS = {
  quote:       'quote',
  history:     'time_series',
  statistics:  'statistics',
  search:      'symbol_search'
};
export function twelveDataUrl(path, params){
  const base = marketApiBase();
  if(base){
    const qs = Object.keys(params)
      .filter(k => params[k] != null && params[k] !== '')
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    return base + '/' + path + (qs ? '?' + qs : '');
  }
  const key = twelveDataKey();
  if(!key) throw new Error('market_provider_unconfigured');
  const vendorPath = TWELVE_DATA_PATHS[path] || path;
  const vendorParams = Object.assign({}, params);
  delete vendorParams.q;                       // our search param; vendor uses `symbol`
  const qs = Object.keys(vendorParams)
    .filter(k => vendorParams[k] != null && vendorParams[k] !== '')
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(vendorParams[k]))
    .join('&');
  return 'https://api.twelvedata.com/' + vendorPath + '?' + qs + '&apikey=' + encodeURIComponent(key);
}
export async function twelveDataGetQuote(ticker){
  const url = twelveDataUrl('quote', { symbol: ticker });
  const res = await fetch(url, { cache: 'no-store' });
  if(!res.ok) throw new Error('twelvedata_http_' + res.status);
  const data = await res.json();
  if(data.status === 'error' || data.code) throw new Error('twelvedata_quote_error');
  return {
    price: data.close != null ? parseFloat(data.close) : null,
    change: data.change != null ? parseFloat(data.change) : null,
    changePct: data.percent_change != null ? parseFloat(data.percent_change) : null,
    asOf: data.datetime || null,
    previousClose: data.previous_close != null ? parseFloat(data.previous_close) : null,
    week52: data.fifty_two_week
      ? { high: parseFloat(data.fifty_two_week.high), low: parseFloat(data.fifty_two_week.low) }
      : null
  };
}

export async function twelveDataGetHistory(ticker, days){
  days = days || 260; // enough for a 200-day SMA plus headroom
  const url = twelveDataUrl('history', { symbol: ticker, interval: '1day', outputsize: days });
  const res = await fetch(url, { cache: 'no-store' });
  if(!res.ok) throw new Error('twelvedata_http_' + res.status);
  const data = await res.json();
  if(data.status === 'error' || data.code || !Array.isArray(data.values)) throw new Error('twelvedata_history_error');
  // Twelve Data returns newest-first; every field arrives as a string.
  return data.values
    .map(v => ({
      date: v.datetime,
      open: parseFloat(v.open), high: parseFloat(v.high), low: parseFloat(v.low),
      close: parseFloat(v.close), volume: parseFloat(v.volume)
    }))
    .reverse();
}

export async function twelveDataGetFundamentals(ticker){
  if(!twelveDataConfigured()) return null;
  try{
    const url = twelveDataUrl('statistics', { symbol: ticker });
    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) return null;
    const data = await res.json();
    if(data.status === 'error' || data.code) return null;
    return data;
  }catch(e){ return null; } // fundamentals are always best-effort, never fatal
}

export async function twelveDataSearchSymbol(queryText){
  const url = twelveDataUrl('search', { symbol: queryText, q: queryText });
  const res = await fetch(url, { cache: 'no-store' });
  // Same rule as BackendProvider's search: a request that failed has not told
  // us the company doesn't exist, so it must not return the empty array that
  // means exactly that. A rate-limited or expired key hits this path.
  if(!res.ok) throw new Error('twelvedata_http_' + res.status);
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

// Satisfies the MarketDataProvider contract in provider-interface.js.
export const TwelveDataProvider = {
  id: 'twelvedata',
  isDemo: false,
  sourceLabel: 'Twelve Data',
  hasApiKey: twelveDataConfigured,
  getQuote: twelveDataGetQuote,
  getHistory: twelveDataGetHistory,
  getFundamentals: twelveDataGetFundamentals,
  searchSymbol: twelveDataSearchSymbol
};
