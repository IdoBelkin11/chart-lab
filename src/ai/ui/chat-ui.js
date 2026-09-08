const aiHistory = [];
let aiSending = false;
let lastTopicId = null;
// Entity memory (active company, comparison target, active metric) —
// separate from lastTopicId, which only tracks KB-concept topics. See
// docs/AI_ENGINE.md "Conversation context" for why these are two axes,
// not one.
const aiConversationContext = createConversationContext();

const AI_EXAMPLE_KEYS = ['aiEx1','aiEx2','aiEx3','aiEx4'];
const BROWSE_LABEL = { he:'📚 עיין בכל הנושאים', en:'📚 Browse all topics' };

function renderAiExamples(){
  const box = document.getElementById('ai-examples');
  if(!box) return;
  box.innerHTML = '';
  AI_EXAMPLE_KEYS.forEach(key=>{
    const b = document.createElement('button');
    b.className = 'ai-example-btn';
    b.textContent = t[lang][key];
    b.onclick = function(){ askAiExample(t[lang][key]); };
    box.appendChild(b);
  });
  const browseBtn = document.createElement('button');
  browseBtn.className = 'ai-example-btn';
  browseBtn.textContent = BROWSE_LABEL[lang];
  browseBtn.onclick = function(){ renderTopicCategories(); };
  box.appendChild(browseBtn);
}

// Mobile keyboard handling: on iOS Safari, `body{overflow:hidden}` alone does
// NOT stop the page behind a fixed overlay from scrolling, and `inset:0`
// keeps sizing the overlay to the full layout viewport even after the
// keyboard shrinks the visual viewport — which is why the site behind used
// to peek out and scroll under the chat once the keyboard opened. The fix
// has two halves: a real scroll lock (position:fixed on body, restored on
// close), and syncing the overlay's height to visualViewport while open.
let aiSavedScrollY = 0;

function syncAiOverlayHeight(){
  const overlay = document.getElementById('ai-overlay');
  if(!overlay || !overlay.classList.contains('open')) return;
  const vv = window.visualViewport;
  if(vv){
    // Size to the *visible* area, and offset by however far the visual
    // viewport has been pushed down, so the composer sits on the keyboard.
    overlay.style.height = vv.height + 'px';
    overlay.style.transform = 'translateY(' + (vv.offsetTop || 0) + 'px)';
  } else {
    overlay.style.height = '';
    overlay.style.transform = '';
  }
}

function openAiChat(){
  const overlay = document.getElementById('ai-overlay');
  aiSavedScrollY = window.scrollY || window.pageYOffset || 0;
  overlay.classList.add('open');
  document.body.classList.add('ai-lock');
  document.body.style.top = (-aiSavedScrollY) + 'px';
  renderAiExamples();
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', syncAiOverlayHeight);
    window.visualViewport.addEventListener('scroll', syncAiOverlayHeight);
  }
  syncAiOverlayHeight();
  setTimeout(()=>{ const inp=document.getElementById('ai-input'); if(inp) inp.focus(); syncAiOverlayHeight(); }, 250);
}

function closeAiChat(){
  const overlay = document.getElementById('ai-overlay');
  overlay.classList.remove('open');
  overlay.style.height = '';
  overlay.style.transform = '';
  document.body.classList.remove('ai-lock');
  document.body.style.top = '';
  if(window.visualViewport){
    window.visualViewport.removeEventListener('resize', syncAiOverlayHeight);
    window.visualViewport.removeEventListener('scroll', syncAiOverlayHeight);
  }
  window.scrollTo(0, aiSavedScrollY);
}
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && document.getElementById('ai-overlay').classList.contains('open')) navigateTo('');
});
registerRoute('ai', { onEnter: openAiChat, onLeave: closeAiChat });

function askAiExample(text){
  const inp = document.getElementById('ai-input');
  inp.value = text;
  sendAiMessage();
}

// Direct, 100%-reliable topic display: bypasses keyword matching entirely,
// used by the topic browser so a click always shows the right answer.
function askAiTopic(id){
  const entry = kbById(id);
  if(!entry) return;
  const label = chipLabelFor(id, lang);
  appendAiBubble('user', label);
  aiHistory.push({role:'user', content:label});
  appendAiBubble('assistant', entry[lang]);
  aiHistory.push({role:'assistant', content:entry[lang]});
  lastTopicId = id;
  appendRelatedChips((entry.related||[]).slice(0,2));
}

function appendAiBubble(role, text){
  document.getElementById('ai-empty').style.display = 'none';
  const wrap = document.getElementById('ai-messages');
  const row = document.createElement('div');
  row.className = 'ai-msg ' + role;
  const bubble = document.createElement('div');
  bubble.className = 'ai-bubble';
  bubble.textContent = text;
  row.appendChild(bubble);
  wrap.appendChild(row);
  document.getElementById('ai-body').scrollTop = document.getElementById('ai-body').scrollHeight;
  return bubble;
}

// ---------------------------------------------------------------------------
// Stock card + full-screen detail view.
//
// The card itself is built from data this chat already fetched (no extra
// network call). Tapping it opens a dedicated full-screen overlay with
// tabs — TradingView's widgets are built for a wide dashboard panel, not an
// 80%-width chat bubble, so squeezing all four inline caused the cramped,
// overflowing layout seen on a real device. Giving them the full viewport
// width, one at a time, is what actually renders them properly on both
// mobile and desktop.
// ---------------------------------------------------------------------------
function appendStockCard(card){
  const wrap = document.getElementById('ai-messages');
  const row = document.createElement('div');
  row.className = 'ai-msg assistant';
  const box = document.createElement('div');
  box.className = 'stock-card';
  const up = card.changePct >= 0;
  const pctStr = (up?'+':'') + card.changePct.toFixed(2) + '%';
  box.innerHTML = `
    <div class="stock-card-top">
      <div class="stock-card-name">${escapeHtml(card.name[lang] || card.name.en)}</div>
      <div class="stock-card-ticker">${escapeHtml(card.exchange)}: ${escapeHtml(card.ticker)}</div>
    </div>
    <div class="stock-card-bottom">
      <div class="stock-card-price">$${card.price.toFixed(2)}</div>
      <div class="stock-card-change ${up?'up':'down'}">${pctStr}</div>
    </div>
    <div class="stock-card-hint">${lang==='he' ? 'הקש לגרף וניתוח מלא' : 'Tap for full chart & analysis'}</div>
  `;
  box.addEventListener('click', () => openStockDetail(card));
  row.appendChild(box);
  wrap.appendChild(row);
  document.getElementById('ai-body').scrollTop = document.getElementById('ai-body').scrollHeight;
}

function tvSymbol(card){ return card.exchange + ':' + card.ticker; }

function mountTradingViewWidget(container, scriptSrc, config){
  container.innerHTML = '';
  const widgetDiv = document.createElement('div');
  widgetDiv.className = 'tradingview-widget-container';
  const inner = document.createElement('div');
  inner.className = 'tradingview-widget-container__widget';
  widgetDiv.appendChild(inner);
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = scriptSrc;
  script.async = true;
  script.text = JSON.stringify(config);
  widgetDiv.appendChild(script);
  container.appendChild(widgetDiv);
}

const STOCK_DETAIL_TABS = [
  { id:'chart', label:{he:'גרף', en:'Chart'},
    build:(container, card, theme) => mountTradingViewWidget(container,
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
      { symbol: tvSymbol(card), width:'100%', height:'100%', theme, style:'1', locale: lang==='he'?'he_IL':'en', hide_side_toolbar:false, allow_symbol_change:false }) },
  { id:'technical', label:{he:'ניתוח טכני', en:'Technical'},
    build:(container, card, theme) => mountTradingViewWidget(container,
      'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js',
      { symbol: tvSymbol(card), width:'100%', height:'100%', theme, locale: lang==='he'?'he_IL':'en', interval:'1D' }) },
  { id:'profile', label:{he:'פרופיל', en:'Profile'},
    build:(container, card, theme) => mountTradingViewWidget(container,
      'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js',
      { symbol: tvSymbol(card), width:'100%', height:'100%', theme, locale: lang==='he'?'he_IL':'en' }) },
  { id:'news', label:{he:'חדשות', en:'News'},
    build:(container, card, theme) => mountTradingViewWidget(container,
      'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js',
      { symbol: tvSymbol(card), width:'100%', height:'100%', theme, locale: lang==='he'?'he_IL':'en', displayMode:'regular' }) }
];

let stockDetailLoaded = {};

function openStockDetail(card){
  let overlay = document.getElementById('stock-detail-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'stock-detail-overlay';
    overlay.className = 'app-overlay';
    document.body.appendChild(overlay);
  }
  stockDetailLoaded = {};
  const up = card.changePct >= 0;
  const pctStr = (up?'+':'') + card.changePct.toFixed(2) + '%';
  overlay.innerHTML = `
    <div class="app-overlay-header">
      <button class="app-overlay-close" aria-label="close">&times;</button>
      <div class="app-overlay-title">
        <div class="stock-detail-name">${escapeHtml(card.name[lang] || card.name.en)} <span class="stock-detail-ticker">${escapeHtml(card.exchange)}: ${escapeHtml(card.ticker)}</span></div>
        <div class="stock-detail-price">$${card.price.toFixed(2)} <span class="stock-card-change ${up?'up':'down'}">${pctStr}</span></div>
      </div>
    </div>
    <div class="app-overlay-tabs"></div>
    <div class="app-overlay-content"></div>
  `;
  const tabsBar = overlay.querySelector('.app-overlay-tabs');
  const content = overlay.querySelector('.app-overlay-content');
  STOCK_DETAIL_TABS.forEach((tab, i) => {
    const btn = document.createElement('button');
    btn.className = 'app-overlay-tab' + (i===0 ? ' active' : '');
    btn.textContent = tab.label[lang] || tab.label.en;
    btn.addEventListener('click', () => selectStockDetailTab(tab.id, card));
    btn.dataset.tabId = tab.id;
    tabsBar.appendChild(btn);
  });
  overlay.querySelector('.app-overlay-close').addEventListener('click', closeStockDetail);
  overlay.classList.add('open');
  selectStockDetailTab(STOCK_DETAIL_TABS[0].id, card);
}

function selectStockDetailTab(tabId, card){
  const overlay = document.getElementById('stock-detail-overlay');
  if(!overlay) return;
  overlay.querySelectorAll('.app-overlay-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tabId === tabId);
  });
  const content = overlay.querySelector('.app-overlay-content');
  const tab = STOCK_DETAIL_TABS.find(t => t.id === tabId);
  if(!tab) return;
  const paneId = 'stock-detail-pane-' + tabId;
  content.querySelectorAll('.app-overlay-pane').forEach(p => p.style.display = 'none');
  let pane = content.querySelector('#' + paneId);
  if(!pane){
    pane = document.createElement('div');
    pane.id = paneId;
    pane.className = 'app-overlay-pane';
    content.appendChild(pane);
  }
  pane.style.display = 'block';
  if(!stockDetailLoaded[tabId]){
    stockDetailLoaded[tabId] = true;
    const loader = document.createElement('div');
    loader.className = 'stock-detail-loader-wrap';
    loader.innerHTML = '<div class="stock-detail-loader"></div>';
    const widgetSlot = document.createElement('div');
    widgetSlot.className = 'stock-detail-widget-slot';
    pane.appendChild(loader);
    pane.appendChild(widgetSlot);
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    // TradingView's widget script renders asynchronously into the DOM it's
    // given; there's no load callback exposed, so the loader is removed
    // after a short delay long enough for the script to have taken over
    // the container — before that, showing a spinner beats a blank pane.
    setTimeout(() => loader.remove(), 600);
    tab.build(widgetSlot, card, isLight ? 'light' : 'dark');
  }
}

function closeStockDetail(){
  const overlay = document.getElementById('stock-detail-overlay');
  if(overlay) overlay.classList.remove('open');
}

function appendChipRow(buttons){
  const wrap = document.getElementById('ai-messages');
  const row = document.createElement('div');
  row.className = 'ai-msg assistant';
  const chipWrap = document.createElement('div');
  chipWrap.className = 'ai-examples';
  chipWrap.style.margin = '0 0 4px 0';
  buttons.forEach(({label, onClick})=>{
    const b = document.createElement('button');
    b.className = 'ai-example-btn';
    b.textContent = label;
    b.onclick = onClick;
    chipWrap.appendChild(b);
  });
  row.appendChild(chipWrap);
  wrap.appendChild(row);
  document.getElementById('ai-body').scrollTop = document.getElementById('ai-body').scrollHeight;
}

// ---------------------------------------------------------------------------
// Entity-aware follow-up chips — for a stock-data answer (relatedIds is
// always empty for these; there's no KB entry to derive chips from). Built
// from the same entityContext the answer already carries, plus whatever
// conversationContext knows, so a company answer gets suggestions like
// "what's her P/E?" instead of the generic KB-topic chips, and never
// hardcodes a specific company as an example — a comparison suggestion only
// appears when a real second company is actually in context.
// ---------------------------------------------------------------------------
function entityFollowupChips(entityContext, conversationContext, langCode){
  const he = langCode === 'he';
  const facet = entityContext.facet;
  const chips = [];
  if(facet !== 'pe') chips.push(he ? 'מה ה-P/E שלה?' : "What's its P/E?");
  if(facet !== 'technical' && facet !== 'full') chips.push(he ? 'מה המצב הטכני שלה?' : 'What does the technical picture look like?');
  if(facet !== 'risks') chips.push(he ? 'מה הסיכונים המרכזיים שלה?' : 'What are the main risks?');
  if(facet !== 'change') chips.push(he ? 'איך היא השתנתה בחודש האחרון?' : 'How has it changed over the last month?');
  const prev = conversationContext && conversationContext.previousEntity;
  if(prev && prev.ticker !== entityContext.ticker){
    const prevName = prev.name[langCode] || prev.name.en;
    chips.push(he ? `איך היא בהשוואה ל-${prevName}?` : `How does it compare to ${prevName}?`);
  }
  return chips.slice(0, 4);
}

function appendRelatedChips(relatedIds){
  if(!relatedIds || !relatedIds.length) return;
  appendChipRow(relatedIds.map(id => ({
    label: chipLabelFor(id, lang),
    onClick: function(){ askAiTopic(id); }
  })).filter(b => b.label));
}

function renderTopicCategories(){
  document.getElementById('ai-empty').style.display = 'none';
  appendChipRow(CATEGORY_ORDER.map(cat => ({
    label: (CATEGORY_LABELS[cat] && CATEGORY_LABELS[cat][lang]) || cat,
    onClick: function(){ renderTopicList(cat); }
  })));
}

function renderTopicList(cat){
  const topics = topicsInCategory(cat);
  appendChipRow(topics.map(entry => ({
    label: pickLabelTerm(entry.kw, lang === 'he'),
    onClick: function(){ askAiTopic(entry.id); }
  })));
}

function appendTypingIndicator(){
  const wrap = document.getElementById('ai-messages');
  const row = document.createElement('div');
  row.className = 'ai-msg assistant';
  row.id = 'ai-typing-row';
  const bubble = document.createElement('div');
  bubble.className = 'ai-bubble';
  bubble.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
  row.appendChild(bubble);
  wrap.appendChild(row);
  document.getElementById('ai-body').scrollTop = document.getElementById('ai-body').scrollHeight;
}
function removeTypingIndicator(){
  const row = document.getElementById('ai-typing-row');
  if(row) row.remove();
}

async function sendAiMessage(){
  if(aiSending) return;
  const inp = document.getElementById('ai-input');
  const text = inp.value.trim();
  if(!text) return;
  inp.value = '';
  inp.style.height = 'auto';
  aiSending = true;
  document.getElementById('ai-send').disabled = true;

  appendAiBubble('user', text);
  aiHistory.push({role:'user', content:text});
  appendTypingIndicator();

  // Small artificial delay so it still feels like a real chat exchange,
  // even though the "thinking" here is instant local lookup, not a network call.
  await new Promise(resolve => setTimeout(resolve, 350 + Math.random()*250));

  removeTypingIndicator();
  const reply = await generateAiReply(text, lang, lastTopicId, aiConversationContext);
  appendAiBubble('assistant', reply.text);
  aiHistory.push({role:'assistant', content:reply.text});
  if(reply.topicId) lastTopicId = reply.topicId;
  if(reply.stockCard) appendStockCard(reply.stockCard);
  if(reply.browse){
    renderTopicCategories();
  } else if(reply.clarificationCandidates){
    appendChipRow(reply.clarificationCandidates.map(c => ({
      label: c.label,
      onClick: function(){ askAiExample(c.query); }
    })));
  } else if(reply.entityContext){
    appendChipRow(entityFollowupChips(reply.entityContext, aiConversationContext, lang).map(text => ({
      label: text,
      onClick: function(){ askAiExample(text); }
    })));
  } else {
    appendRelatedChips(reply.relatedIds);
  }

  aiSending = false;
  document.getElementById('ai-send').disabled = false;
}

(function(){
  const inp = document.getElementById('ai-input');
  if(!inp) return;
  inp.addEventListener('input', function(){
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
  });
  inp.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      sendAiMessage();
    }
  });
})();
renderAiExamples();
