// Reusable mock fetch() for Twelve Data's three endpoints. Every market-data
// test built its own ad-hoc mock during development; this is the one
// version, shared, so a change to the real response shape only needs
// updating here.
function genHistory(days, startPrice){
  days = days || 260; startPrice = startPrice || 150;
  const values = [];
  const start = new Date('2025-08-01');
  for(let i = 0; i < days; i++){
    const d = new Date(start); d.setDate(d.getDate() + i);
    const close = startPrice + (i/days)*20 + Math.sin(i/15)*0.5;
    values.push({
      datetime: d.toISOString().slice(0,10),
      open: (close-0.3).toFixed(2), high: (close+0.5).toFixed(2),
      low: (close-0.6).toFixed(2), close: close.toFixed(2), volume: '41000000'
    });
  }
  return values.reverse(); // Twelve Data returns newest-first
}

// `symbolSearchResults` maps a lowercase substring of the query to the
// `data` array Twelve Data would return for it (see fixtures/*.json for
// realistic examples pulled from real companies).
function createTwelveDataMock({ symbolSearchResults = {}, quoteOverrides = {} } = {}){
  let searchCallCount = 0;
  const mock = async (url) => {
    if(url.includes('/symbol_search')){
      searchCallCount++;
      const q = decodeURIComponent(new URL(url).searchParams.get('symbol') || '').toLowerCase();
      for(const key of Object.keys(symbolSearchResults)){
        if(q.includes(key.toLowerCase())) return { ok:true, json: async () => ({ data: symbolSearchResults[key] }) };
      }
      return { ok:true, json: async () => ({ data: [] }) };
    }
    if(url.includes('/quote')){
      return { ok:true, json: async () => Object.assign({
        datetime:'2026-09-06', close:'171.20', previous_close:'169.42',
        change:'1.78', percent_change:'1.05',
        fifty_two_week:{ high:'182.50', low:'142.10' }
      }, quoteOverrides) };
    }
    if(url.includes('/time_series')){
      return { ok:true, json: async () => ({ meta:{}, values: genHistory() }) };
    }
    return { ok:false, status:404 };
  };
  mock.getSearchCallCount = () => searchCallCount;
  return mock;
}

module.exports = { createTwelveDataMock, genHistory };
