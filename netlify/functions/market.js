// ---------------------------------------------------------------------------
// Chart Lab market-data proxy — Netlify Functions edition.
//
// Same contract as the Firebase Cloud Function in functions/src/index.js,
// and it reuses that same functions/src/normalize.js (cache, rate limiting,
// Twelve Data -> Chart Lab normalisation) so there is exactly one copy of
// that logic, tested once, used from either host:
//
//   GET /api/market/quote?symbol=AAPL
//   GET /api/market/history?symbol=AAPL&interval=1day&outputsize=260
//   GET /api/market/search?q=Apple
//
// WHY THIS FILE EXISTS: Firebase Cloud Functions + Secret Manager require
// the Blaze (pay-as-you-go) plan, which requires a billing card on file even
// for usage that stays entirely inside the free quota. Netlify Functions +
// environment variables give the same guarantee — the key lives server-side,
// never reaches the browser — on a plan that needs no card at all.
//
// THE CREDENTIAL: set in the Netlify UI (Site settings -> Environment
// variables -> TWELVE_DATA_API_KEY), or via `netlify env:set`. Never in this
// repo, never in the client bundle.
// ---------------------------------------------------------------------------

const {
  TTL_MS, cacheGet, cacheSet, rateLimited, vendorFetch,
  normalizeQuote, normalizeHistory, normalizeSearch, normalizeFundamentals
} = require('../../functions/src/normalize.js');

const ROUTES = {
  quote:        { vendorPath: 'quote',         ttl: TTL_MS.quote,        normalize: normalizeQuote },
  history:      { vendorPath: 'time_series',   ttl: TTL_MS.history,      normalize: normalizeHistory },
  search:       { vendorPath: 'symbol_search', ttl: TTL_MS.search,       normalize: normalizeSearch },
  fundamentals: { vendorPath: 'statistics',    ttl: TTL_MS.fundamentals, normalize: normalizeFundamentals }
};

// Same-origin in production (Netlify serves the built site and this function
// together), but CORS stays open so local dev against a deployed function
// keeps working without extra configuration.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'method_not_allowed' });
  }

  // Works whether Netlify hands us the pre-redirect path
  // (/api/market/quote) or the function's own path
  // (/.netlify/functions/market/quote) — only the last segment matters.
  const segment = (event.path || '').split('/').filter(Boolean).pop();
  const route = ROUTES[segment];
  if (!route) return json(404, { error: 'unknown_endpoint' });

  const headers = event.headers || {};
  const ip = headers['x-nf-client-connection-ip']
    || (headers['x-forwarded-for'] || '').split(',')[0]
    || 'unknown';
  if (rateLimited(ip)) {
    return json(429, { error: 'rate_limited' }, { 'Retry-After': '60' });
  }

  const q = event.queryStringParameters || {};
  const symbol = (q.symbol || q.q || '').toString().trim();
  if (!symbol) return json(400, { error: 'missing_symbol' });

  const params = { symbol };
  if (segment === 'history') {
    params.interval = (q.interval || '1day').toString();
    params.outputsize = Math.min(Number(q.outputsize) || 260, 5000);
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    // Misconfigured deployment (env var not set) — fail the same way an
    // upstream outage would, so the frontend's existing Demo Mode fallback
    // handles it without needing to know the difference.
    return json(503, { error: 'market_data_unavailable' });
  }

  const cacheKey = segment + ':' + JSON.stringify(params);
  const cached = cacheGet(cacheKey);
  if (cached) {
    return json(200, cached, {
      'X-Cache': 'HIT',
      'Cache-Control': `public, max-age=${Math.floor(route.ttl / 1000)}`
    });
  }

  try {
    const raw = await vendorFetch(route.vendorPath, params, apiKey);
    const normalized = route.normalize(raw);
    cacheSet(cacheKey, normalized, route.ttl);
    return json(200, normalized, {
      'X-Cache': 'MISS',
      'Cache-Control': `public, max-age=${Math.floor(route.ttl / 1000)}`
    });
  } catch (err) {
    // Never leak upstream detail — some Twelve Data error shapes echo the
    // key back, same reasoning as the Firebase version.
    const message = String((err && err.message) || '');
    const status = message.startsWith('upstream_4') ? 502 : 503;
    return json(status, { error: 'market_data_unavailable' });
  }
};

function json(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: Object.assign({ 'Content-Type': 'application/json' }, CORS_HEADERS, extraHeaders || {}),
    body: JSON.stringify(body)
  };
}
