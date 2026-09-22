// ---------------------------------------------------------------------------
// Chart Lab market-data proxy (Cloud Function).
//
// This is the server side of the seam BackendProvider already speaks to. The
// frontend calls OUR contract:
//
//   GET /api/market/quote?symbol=AAPL
//   GET /api/market/history?symbol=AAPL&interval=1day&outputsize=260
//   GET /api/market/search?q=Apple
//
// and this function translates to whichever provider we happen to use. Two
// things follow from that, and both are the point of the exercise:
//
//   1. THE CREDENTIAL NEVER REACHES THE BROWSER. It lives in the function's
//      environment. Previously a real key was compiled into the public
//      bundle, readable by any visitor via view-source; on Twelve Data's free
//      plan the quota is shared site-wide (800/day, 8/min TOTAL), so that was
//      both a credential leak and a trivial denial-of-service vector.
//      That key must be treated as compromised and rotated.
//
//   2. THE PROVIDER IS REPLACEABLE. Response shaping happens here, so
//      swapping Twelve Data for something else — or blending sources — is a
//      change to this file alone, with nothing to do on the frontend.
//
// Caching is in-memory and per-instance on purpose: it costs nothing, needs
// no extra service, and is enough to keep a handful of concurrent readers
// inside a small free-tier quota. If traffic ever outgrows it, the upgrade is
// Firestore or Redis behind this same interface — again, without touching
// the frontend.
// ---------------------------------------------------------------------------

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

// Set with:  firebase functions:secrets:set TWELVE_DATA_API_KEY
// Never committed, never bundled, never sent to the client.
const TWELVE_DATA_API_KEY = defineSecret('TWELVE_DATA_API_KEY');

const {
  TTL_MS, cacheGet, cacheSet, rateLimited, vendorFetch,
  normalizeQuote, normalizeHistory, normalizeSearch, normalizeFundamentals
} = require('./normalize.js');

// --- Handler ---------------------------------------------------------------
const ROUTES = {
  quote:        { vendorPath: 'quote',         ttl: TTL_MS.quote,        normalize: normalizeQuote },
  history:      { vendorPath: 'time_series',   ttl: TTL_MS.history,      normalize: normalizeHistory },
  search:       { vendorPath: 'symbol_search', ttl: TTL_MS.search,       normalize: normalizeSearch },
  fundamentals: { vendorPath: 'statistics',    ttl: TTL_MS.fundamentals, normalize: normalizeFundamentals }
};

exports.market = onRequest(
  { secrets: [TWELVE_DATA_API_KEY], cors: true, region: 'us-central1' },
  async (req, res) => {
    // Read-only API.
    if(req.method !== 'GET'){
      res.set('Allow', 'GET');
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    const segment = (req.path || '').split('/').filter(Boolean).pop();
    const route = ROUTES[segment];
    if(!route) return res.status(404).json({ error: 'unknown_endpoint' });

    const ip = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown';
    if(rateLimited(ip)){
      res.set('Retry-After', '60');
      return res.status(429).json({ error: 'rate_limited' });
    }

    const symbol = (req.query.symbol || req.query.q || '').toString().trim();
    if(!symbol) return res.status(400).json({ error: 'missing_symbol' });

    const params = { symbol };
    if(segment === 'history'){
      params.interval   = (req.query.interval || '1day').toString();
      params.outputsize = Math.min(Number(req.query.outputsize) || 260, 5000);
    }

    const cacheKey = segment + ':' + JSON.stringify(params);
    const cached = cacheGet(cacheKey);
    if(cached){
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `public, max-age=${Math.floor(route.ttl / 1000)}`);
      return res.json(cached);
    }

    try {
      const raw = await vendorFetch(route.vendorPath, params, TWELVE_DATA_API_KEY.value());
      const normalized = route.normalize(raw);
      cacheSet(cacheKey, normalized, route.ttl);
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${Math.floor(route.ttl / 1000)}`);
      return res.json(normalized);
    } catch(err){
      // Never leak upstream detail (it can contain the key in some error
      // shapes). The frontend falls back to Demo Mode on failure, which is
      // exactly the degraded behaviour we want.
      const message = String(err && err.message || '');
      const status = message.startsWith('upstream_4') ? 502 : 503;
      return res.status(status).json({ error: 'market_data_unavailable' });
    }
  }
);

// Exported for unit tests without deploying.
exports._internal = { normalizeQuote, normalizeHistory, normalizeSearch, normalizeFundamentals, cacheGet, cacheSet, rateLimited };
