// ---------------------------------------------------------------------------
// Comparison UI — two companies, side by side. Reuses resolveTicker/
// resolveTickerDynamic and getMarketData exactly as the Stock View does;
// this file's own job is only the two-column rendering and the
// never-fabricate-a-winner rule.
// ---------------------------------------------------------------------------
function cmpT(he, en){ return (typeof lang !== 'undefined' && lang === 'he') ? he : en; }

function openCompareView(){
  let overlay = document.getElementById('compare-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'compare-overlay';
    overlay.className = 'app-overlay';
    document.body.appendChild(overlay);
  }
  renderCompareShell(overlay);
  overlay.classList.add('open');
}
function closeCompareView(){
  const overlay = document.getElementById('compare-overlay');
  if(overlay) overlay.classList.remove('open');
}

function renderCompareShell(overlay){
  overlay.innerHTML = `
    <div class="app-overlay-header">
      <button class="app-overlay-close" aria-label="close" onclick="navigateTo('')">&times;</button>
      <div class="app-overlay-title"><div class="quiz-title">${cmpT('השוואת חברות', 'Compare Companies')}</div></div>
    </div>
    <div class="app-overlay-content">
      <div class="cmpview-inputs">
        <input type="text" id="compare-input-a" class="calc-input" aria-label="${cmpT('חברה ראשונה להשוואה', 'First company to compare')}" placeholder="${cmpT('חברה A, למשל NVIDIA', 'Company A, e.g. NVIDIA')}">
        <span class="cmpview-vs">${cmpT('מול', 'vs')}</span>
        <input type="text" id="compare-input-b" class="calc-input" aria-label="${cmpT('חברה שנייה להשוואה', 'Second company to compare')}" placeholder="${cmpT('חברה B, למשל AMD', 'Company B, e.g. AMD')}">
        <button class="quiz-next-btn" id="compare-btn">${cmpT('השווה', 'Compare')}</button>
      </div>
      <div id="compare-results"></div>
    </div>
  `;
  const btn = overlay.querySelector('#compare-btn');
  const run = () => runComparison(overlay);
  btn.addEventListener('click', run);
  overlay.querySelector('#compare-input-a').addEventListener('keydown', e => { if(e.key==='Enter') run(); });
  overlay.querySelector('#compare-input-b').addEventListener('keydown', e => { if(e.key==='Enter') run(); });
}

async function resolveCompanyForCompare(query){
  const norm = normalizeText(query);
  let company = resolveTicker(norm);
  if(!company) company = await resolveTickerDynamic(query);
  return (company && !company.ambiguous) ? company : null;
}

async function runComparison(overlay){
  const qa = overlay.querySelector('#compare-input-a').value.trim();
  const qb = overlay.querySelector('#compare-input-b').value.trim();
  const results = overlay.querySelector('#compare-results');
  if(!qa || !qb) return;
  results.innerHTML = `<div class="stock-view-loading">${cmpT('מחפש את שתי החברות…', 'Looking up both companies…')}</div>`;

  const [companyA, companyB] = await Promise.all([resolveCompanyForCompare(qa), resolveCompanyForCompare(qb)]);
  const missingNames = [];
  if(!companyA) missingNames.push(qa);
  if(!companyB) missingNames.push(qb);
  if(missingNames.length){
    const escapedNames = missingNames.map(escapeHtml).join(', ');
    results.innerHTML = `<div class="stock-view-empty">${cmpT(
      `לא הצלחתי לזהות: ${escapedNames}. נסה שם או טיקר אחר.`,
      `Couldn't identify: ${escapedNames}. Try a different name or ticker.`
    )}</div>`;
    return;
  }

  let dataA, dataB;
  try{ [dataA, dataB] = await Promise.all([getMarketData(companyA.ticker), getMarketData(companyB.ticker)]); }
  catch(e){ dataA = {ok:false}; dataB = {ok:false}; }

  if(!dataA.ok || !dataB.ok){
    const missing = [!dataA.ok ? companyA.name[lang||'en'] : null, !dataB.ok ? companyB.name[lang||'en'] : null].filter(Boolean).map(escapeHtml).join(', ');
    results.innerHTML = `<div class="stock-view-empty">${cmpT(`לא הצלחתי לשלוף נתונים עבור: ${missing}.`, `Couldn't fetch data for: ${missing}.`)}</div>`;
    return;
  }
  renderComparisonTable(results, companyA, dataA.data, companyB, dataB.data);
}

// Each row states both values plainly. `directional:true` rows note which
// side is ahead (meaningful for price performance); metrics where "higher"
// isn't inherently better (P/E, volatility) are shown WITHOUT any winner
// framing — this is the same rule Phase 3's chat-based comparison follows,
// just rendered as a table instead of prose.
function buildComparisonRows(dA, dB, l){
  const rows = [];
  rows.push({ label: cmpT('מחיר', 'Price'), a: '$'+dA.price.toFixed(2), b: '$'+dB.price.toFixed(2) });
  rows.push({
    label: cmpT('שינוי יומי', 'Daily change'),
    a: (dA.changePct>=0?'+':'')+dA.changePct.toFixed(2)+'%', b: (dB.changePct>=0?'+':'')+dB.changePct.toFixed(2)+'%',
    directional: true, aVal: dA.changePct, bVal: dB.changePct
  });
  if(dA.monthChangePct != null && dB.monthChangePct != null){
    rows.push({
      label: cmpT('שינוי חודשי', 'Monthly change'),
      a: (dA.monthChangePct>=0?'+':'')+dA.monthChangePct.toFixed(1)+'%', b: (dB.monthChangePct>=0?'+':'')+dB.monthChangePct.toFixed(1)+'%',
      directional: true, aVal: dA.monthChangePct, bVal: dB.monthChangePct
    });
  }
  if(dA.rsi14 != null && dB.rsi14 != null) rows.push({ label:'RSI (14)', a: dA.rsi14.toFixed(1), b: dB.rsi14.toFixed(1) });
  if(dA.volatility20 != null && dB.volatility20 != null) rows.push({ label: cmpT('תנודתיות', 'Volatility'), a: dA.volatility20.toFixed(0)+'%', b: dB.volatility20.toFixed(0)+'%' });
  const peA = dA.fundamentals && dA.fundamentals.valuations_metrics && dA.fundamentals.valuations_metrics.trailing_pe;
  const peB = dB.fundamentals && dB.fundamentals.valuations_metrics && dB.fundamentals.valuations_metrics.trailing_pe;
  if(peA != null && peB != null) rows.push({ label: 'P/E', a: peA.toFixed(1), b: peB.toFixed(1) });
  return rows;
}

function renderComparisonTable(container, companyA, dA, companyB, dB){
  const l = (typeof lang !== 'undefined') ? lang : 'en';
  const rows = buildComparisonRows(dA, dB, l);
  const missingNote = (!dA.fundamentals || !dB.fundamentals)
    ? `<div class="cmpview-note">${cmpT('אין נתוני מכפיל רווח זמינים לשתי החברות — לכן הוא לא מוצג בהשוואה.', "P/E data isn't available for both companies, so it's left out of this comparison.")}</div>`
    : '';
  container.innerHTML = `
    <div class="cmpview-header-row">
      <div class="cmpview-col-name">${escapeHtml(companyA.name[l])}</div>
      <div></div>
      <div class="cmpview-col-name">${escapeHtml(companyB.name[l])}</div>
    </div>
    ${rows.map(r => `
      <div class="cmpview-row">
        <div class="cmpview-val ${r.directional && r.aVal>r.bVal ? 'ahead':''}">${r.a}</div>
        <div class="cmpview-label">${r.label}</div>
        <div class="cmpview-val ${r.directional && r.bVal>r.aVal ? 'ahead':''}">${r.b}</div>
      </div>
    `).join('')}
    ${missingNote}
    <button class="quiz-next-btn stock-view-ask-ai" id="compare-ask-ai">${escapeHtml(cmpT(`שאל את ה-AI על ${companyA.name.he} מול ${companyB.name.he}`, `Ask the AI about ${companyA.name.en} vs ${companyB.name.en}`))}</button>
  `;
  container.querySelector('#compare-ask-ai').addEventListener('click', () => {
    // Phase 3's entity-comparison mechanism (tryEntityComparisonAnswer)
    // triggers on conversationContext already holding two distinct
    // entities from earlier turns — naming both companies in one fresh
    // message doesn't go through that path at all (resolveTicker just
    // matches whichever one it finds first and answers about only that
    // one). Since this view has ALREADY resolved both companies, priming
    // aiConversationContext directly with them — in order, so companyA
    // becomes previousEntity and companyB stays active — makes the
    // handoff message a genuine two-entity comparison on the first turn,
    // not a shot in the dark hoping the AI infers it.
    recordActiveEntity(aiConversationContext, companyA);
    recordActiveEntity(aiConversationContext, companyB);
    navigateTo('ai');
    setTimeout(() => {
      const inp = document.getElementById('ai-input');
      if(inp){
        inp.value = cmpT('מי יותר רווחית?', 'Who is more profitable?');
        sendAiMessage();
      }
    }, 250);
  });
}

registerRoute('compare', { onEnter: openCompareView, onLeave: closeCompareView });
