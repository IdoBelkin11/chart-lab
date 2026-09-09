// ---------------------------------------------------------------------------
// Stock View UI — search a company, see its data, chart, and metrics.
//
// Reuses, never duplicates: resolveTicker/resolveTickerDynamic (entity
// resolution, Phase 2/3), getMarketData (Phase 2 provider abstraction),
// drawChart (the site's own existing candlestick renderer, already used by
// all 8 lessons). This file's own job is just: take a search string, get a
// resolved company, get its data, and render it — the same "answer the
// question, don't reinvent the plumbing" principle used throughout.
// ---------------------------------------------------------------------------
function stockT(he, en){ return (typeof lang !== 'undefined' && lang === 'he') ? he : en; }

// Maps this project's market-data history shape ({open,high,low,close,
// volume,date}) to what drawChart() actually expects ({o,h,l,c,v,t} with a
// real Date object) — see site-template.html's drawChart/tooltip code for
// why this exact shape is required.
function adaptHistoryForChart(history){
  return history.map(bar => ({
    o: bar.open, h: bar.high, l: bar.low, c: bar.close, v: bar.volume,
    t: new Date(bar.date)
  }));
}

function openStockView(){
  let overlay = document.getElementById('stock-view-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'stock-view-overlay';
    overlay.className = 'app-overlay';
    document.body.appendChild(overlay);
  }
  renderStockSearchShell(overlay);
  overlay.classList.add('open');
}
function closeStockView(){
  const overlay = document.getElementById('stock-view-overlay');
  if(overlay) overlay.classList.remove('open');
}

function renderStockSearchShell(overlay){
  overlay.innerHTML = `
    <div class="app-overlay-header">
      <button class="app-overlay-close" aria-label="close" onclick="navigateTo('')">&times;</button>
      <div class="app-overlay-title">
        <div class="quiz-title">${stockT('חיפוש מניה', 'Stock Search')}</div>
      </div>
    </div>
    <div class="app-overlay-content">
      <div class="stock-search-box">
        <input type="text" id="stock-search-input" class="calc-input" aria-label="${stockT('חיפוש חברה או טיקר', 'Search company or ticker')}" placeholder="${stockT('חברה או טיקר, למשל Apple או AAPL', 'Company or ticker, e.g. Apple or AAPL')}">
        <button class="quiz-next-btn" id="stock-search-btn">${stockT('חפש', 'Search')}</button>
      </div>
      <div id="stock-search-results"></div>
    </div>
  `;
  const input = overlay.querySelector('#stock-search-input');
  const btn = overlay.querySelector('#stock-search-btn');
  const runSearch = () => performStockSearch(overlay, input.value.trim());
  btn.addEventListener('click', runSearch);
  input.addEventListener('keydown', e => { if(e.key === 'Enter') runSearch(); });
  input.focus();
}

async function performStockSearch(overlay, query){
  if(!query) return;
  const results = overlay.querySelector('#stock-search-results');
  results.innerHTML = `<div class="stock-view-loading">${stockT('מחפש…', 'Searching…')}</div>`;

  const norm = normalizeText(query);
  let company = resolveTicker(norm);
  if(!company) company = await resolveTickerDynamic(query);

  if(!company){
    results.innerHTML = `<div class="stock-view-empty">${stockT('לא נמצאה חברה מתאימה. נסה שם או טיקר אחר.', 'No matching company found. Try a different name or ticker.')}</div>`;
    return;
  }
  if(company.ambiguous){
    results.innerHTML = `<div class="stock-view-empty">${stockT('נמצאו כמה התאמות — נסה להיות ספציפי יותר (למשל כלול את הטיקר).', 'Found a few matches — try being more specific (e.g. include the ticker).')}</div>`;
    return;
  }
  await renderStockDataView(overlay, company);
}

async function renderStockDataView(overlay, company){
  const results = overlay.querySelector('#stock-search-results');
  results.innerHTML = `<div class="stock-view-loading">${stockT('טוען נתונים…', 'Loading data…')}</div>`;

  let marketResult;
  try{ marketResult = await getMarketData(company.ticker); }
  catch(e){ marketResult = { ok:false }; }

  if(!marketResult.ok){
    results.innerHTML = `<div class="stock-view-empty">${stockT(
      `לא הצלחתי לשלוף נתונים עבור ${escapeHtml(company.name.he)} כרגע.`,
      `Couldn't fetch data for ${escapeHtml(company.name.en)} right now.`
    )}</div>`;
    return;
  }

  const d = marketResult.data;
  const l = (typeof lang !== 'undefined') ? lang : 'en';
  const up = d.changePct >= 0;
  const demoNote = d.isDemo
    ? `<div class="stock-view-demo-badge">${stockT('הדגמה — לא נתונים אמיתיים', 'DEMO — not real data')}</div>`
    : '';

  results.innerHTML = `
    ${demoNote}
    <div class="stock-view-header">
      <div class="stock-view-name">${escapeHtml(company.name[l])}</div>
      <div class="stock-view-price">$${d.price.toFixed(2)} <span class="stock-card-change ${up?'up':'down'}">${up?'+':''}${d.changePct.toFixed(2)}%</span></div>
      <div class="stock-view-asof">${stockT('נכון ל', 'As of')} ${escapeHtml(d.asOf)} · ${escapeHtml(d.source)}</div>
    </div>
    <canvas id="stock-view-chart" class="stock-view-canvas"></canvas>
    <div class="stock-view-metrics" id="stock-view-metrics"></div>
    <button class="quiz-next-btn stock-view-ask-ai" id="stock-view-ask-ai">${escapeHtml(stockT('שאל את ה-AI על ' + company.name.he, 'Ask the AI about ' + company.name.en))}</button>
  `;

  // Real chart, real data — the same renderer every lesson candlestick
  // chart already uses.
  const canvas = results.querySelector('#stock-view-chart');
  const candles = adaptHistoryForChart(d.history);
  drawChart(canvas, null, candles, { height: 260, showVolume: true });

  renderStockMetrics(results.querySelector('#stock-view-metrics'), d, l);

  results.querySelector('#stock-view-ask-ai').addEventListener('click', () => {
    navigateTo('ai');
    setTimeout(() => {
      const inp = document.getElementById('ai-input');
      if(inp){ inp.value = stockT(`ספר לי על ${company.name.he}`, `Tell me about ${company.name.en}`); sendAiMessage(); }
    }, 250);
  });
}

// Plain-language metric explanations — a beginner shouldn't need to leave
// this view to know what RSI or a 52-week range even means.
function renderStockMetrics(container, d, l){
  const rows = [];
  if(d.rsi14 != null) rows.push({
    label: stockT('RSI (14 יום)', 'RSI (14-day)'), value: d.rsi14.toFixed(1),
    note: stockT('מעל 70 = קניית יתר, מתחת ל-30 = מכירת יתר', 'above 70 = overbought, below 30 = oversold')
  });
  if(d.sma50 != null) rows.push({
    label: stockT('ממוצע נע 50 יום', '50-day moving average'), value: '$'+d.sma50.toFixed(2),
    note: stockT('מגמת ביניים — מחיר מעליו נחשב חיובי', 'intermediate trend — price above it is generally read as positive')
  });
  if(d.week52) rows.push({
    label: stockT('טווח 52 שבועות', '52-week range'), value: `$${d.week52.low.toFixed(2)} – $${d.week52.high.toFixed(2)}`,
    note: stockT('המחיר הנמוך והגבוה ביותר בשנה האחרונה', 'the lowest and highest price over the last year')
  });
  if(d.volatility20 != null) rows.push({
    label: stockT('תנודתיות שנתית (20 יום)', 'Annualized volatility (20-day)'), value: d.volatility20.toFixed(0)+'%',
    note: stockT('גודל התנודות הצפוי, לא הכיוון שלהן', 'the expected size of price swings, not their direction')
  });
  const peFromFundamentals = d.fundamentals && d.fundamentals.valuations_metrics && d.fundamentals.valuations_metrics.trailing_pe;
  if(peFromFundamentals != null) rows.push({
    label: stockT('מכפיל רווח (P/E)', 'P/E ratio'), value: peFromFundamentals.toFixed(1),
    note: stockT('מחיר המניה חלקי הרווח השנתי למניה', "share price divided by annual earnings per share")
  });

  container.innerHTML = rows.map(r => `
    <div class="stock-metric-row">
      <div class="stock-metric-label">${r.label}</div>
      <div class="stock-metric-value">${r.value}</div>
      <div class="stock-metric-note">${r.note}</div>
    </div>
  `).join('') || `<div class="stock-view-empty">${stockT('אין נתוני מדדים זמינים כרגע.', 'No metric data available right now.')}</div>`;
}

registerRoute('stock', { onEnter: openStockView, onLeave: closeStockView });
