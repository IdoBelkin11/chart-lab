// ---------------------------------------------------------------------------
// Pure market-data logic: cache, rate limiting, and vendor->Chart Lab
// normalisation.
//
// Deliberately free of any Firebase import so it can be unit-tested with
// plain Node, with no SDK install and no emulator. index.js is then a thin
// HTTP shell around this.
//
// Normalisation living here is what makes the provider replaceable: the
// frontend only ever sees Chart Lab's shape, so swapping Twelve Data for
// another source is a change to this file and nothing else.
// ---------------------------------------------------------------------------

// --- Cache -----------------------------------------------------------------
// Quotes move constantly; daily history and symbol search barely do. Different
// TTLs rather than one compromise value.
const TTL_MS = { quote: 60 * 1000, history: 60 * 60 * 1000, search: 24 * 60 * 60 * 1000 };
const CACHE_MAX_ENTRIES = 500;
const cache = new Map();

function cacheGet(key){
  const hit = cache.get(key);
  if(!hit) return null;
  if(Date.now() > hit.expires){ cache.delete(key); return null; }
  return hit.value;
}
function cacheSet(key, value, ttl){
  // Bounded so a long-lived instance cannot grow without limit. Map preserves
  // insertion order, so the first key is the oldest.
  if(cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(key, { value, expires: Date.now() + ttl });
}

// --- Rate limiting ---------------------------------------------------------
// Protects the shared upstream quota from a single noisy client. Per-instance
// and approximate, which is the right trade here: it is a guard rail, not
// billing.
const RATE_LIMIT = { windowMs: 60 * 1000, max: 30 };
const callers = new Map();

function rateLimited(ip){
  const now = Date.now();
  const entry = callers.get(ip);
  if(!entry || now > entry.reset){
    callers.set(ip, { count: 1, reset: now + RATE_LIMIT.windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

// --- Vendor calls ----------------------------------------------------------
// Defined here (not just in index.js) so this module works standalone —
// any HTTP shell that imports it (Firebase, Netlify, etc.) gets a working
// vendorFetch without redeclaring the vendor's base URL itself.
const VENDOR_BASE = 'https://api.twelvedata.com';

async function vendorFetch(path, params, apiKey){
  const qs = new URLSearchParams(
    Object.assign({}, params, { apikey: apiKey })
  ).toString();
  const res = await fetch(`${VENDOR_BASE}/${path}?${qs}`, { cache: 'no-store' });
  if(!res.ok) throw new Error(`upstream_${res.status}`);
  const json = await res.json();
  // Twelve Data signals errors with a 200 body, so status alone is not enough.
  if(json && json.status === 'error') throw new Error(json.message || 'upstream_error');
  return json;
}

// Normalisation: the frontend's shape, not the vendor's. Keeping this here is
// what lets the provider change without a frontend release.
function normalizeQuote(raw){
  if(!raw || raw.close == null) return null;
  return {
    symbol: raw.symbol,
    name: raw.name,
    exchange: raw.exchange,
    price: Number(raw.close),
    previousClose: raw.previous_close != null ? Number(raw.previous_close) : null,
    changePct: raw.percent_change != null ? Number(raw.percent_change) : null,
    currency: raw.currency || 'USD',
    asOf: raw.datetime || null,
    isDemo: false,
    source: 'Twelve Data'
  };
}
function normalizeHistory(raw){
  const values = (raw && raw.values) || [];
  // Oldest-first is what the chart renderers expect.
  return values.slice().reverse().map(v => ({
    date: v.datetime,
    open: Number(v.open), high: Number(v.high),
    low: Number(v.low),  close: Number(v.close),
    volume: v.volume != null ? Number(v.volume) : null
  }));
}
function normalizeSearch(raw){
  const data = (raw && raw.data) || [];
  return data.slice(0, 20).map(d => ({
    symbol: d.symbol, name: d.instrument_name,
    exchange: d.exchange, country: d.country, currency: d.currency
  }));
}


module.exports = {
  TTL_MS, RATE_LIMIT,
  cacheGet, cacheSet,
  rateLimited,
  vendorFetch,
  normalizeQuote, normalizeHistory, normalizeSearch,
  _resetForTests: () => { cache.clear(); callers.clear(); }
};
