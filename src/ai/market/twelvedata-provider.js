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
// IMPORTANT — read before setting the key below: this file ships inside a
// public static site, so the key is visible to, and shared by, every
// visitor (view-source is enough). Twelve Data's free plan is 800
// requests/day and 8/minute TOTAL across all visitors, not per visitor —
// each stock question costs 2-3 requests (quote + history, optionally
// fundamentals), so roughly 250-400 stock questions/day site-wide before
// the shared quota resets. That's generous for an education site's normal
// traffic; under a real spike it degrades to the honest "couldn't fetch"
// answer rather than breaking anything else.
// ---------------------------------------------------------------------------
const TWELVE_DATA_API_KEY = 'c9a2ecebe83c4207bee448ce6b5eef88';

async function twelveDataGetQuote(ticker){
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(ticker)}&apikey=${encodeURIComponent(TWELVE_DATA_API_KEY)}`;
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

async function twelveDataGetHistory(ticker, days){
  days = days || 260; // enough for a 200-day SMA plus headroom
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(ticker)}&interval=1day&outputsize=${days}&apikey=${encodeURIComponent(TWELVE_DATA_API_KEY)}`;
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

async function twelveDataGetFundamentals(ticker){
  if(!TWELVE_DATA_API_KEY) return null;
  try{
    const url = `https://api.twelvedata.com/statistics?symbol=${encodeURIComponent(ticker)}&apikey=${encodeURIComponent(TWELVE_DATA_API_KEY)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) return null;
    const data = await res.json();
    if(data.status === 'error' || data.code) return null;
    return data;
  }catch(e){ return null; } // fundamentals are always best-effort, never fatal
}

async function twelveDataSearchSymbol(queryText){
  const url = `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(queryText)}&apikey=${encodeURIComponent(TWELVE_DATA_API_KEY)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if(!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

// Satisfies the MarketDataProvider contract in provider-interface.js.
const TwelveDataProvider = {
  id: 'twelvedata',
  isDemo: false,
  sourceLabel: 'Twelve Data',
  hasApiKey: () => !!TWELVE_DATA_API_KEY,
  getQuote: twelveDataGetQuote,
  getHistory: twelveDataGetHistory,
  getFundamentals: twelveDataGetFundamentals,
  searchSymbol: twelveDataSearchSymbol
};
