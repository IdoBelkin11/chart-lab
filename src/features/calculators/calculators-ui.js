// ---------------------------------------------------------------------------
// Calculators UI — reuses the generic .app-overlay + tabs pattern (same as
// the stock-detail view). All math is in calculators/calculations.js and
// is unit-tested there; this file only builds forms and formats output.
// ---------------------------------------------------------------------------
function calcT(he, en){ return (typeof lang !== 'undefined' && lang === 'he') ? he : en; }
function calcFmt(n){ return n.toLocaleString(undefined, { maximumFractionDigits: 2 }); }
// Renders a result row as a label/value pair so the CSS can space them to
// opposite edges (a cleaner, more scannable "spec sheet" look than a single
// "label: value" string).
function calcLine(label, value){
  return `<div class="calc-result-line"><span class="calc-line-label">${label}</span><span class="calc-line-value">${value}</span></div>`;
}

const CALCULATOR_TABS = [
  { id:'compound', label:{he:'ריבית דריבית', en:'Compound Interest'}, build:buildCompoundInterestCalc },
  { id:'dca', label:{he:'DCA', en:'DCA'}, build:buildDcaCalc },
  { id:'return', label:{he:'תשואה %', en:'% Return'}, build:buildReturnCalc },
  { id:'pnl', label:{he:'רווח/הפסד', en:'Profit/Loss'}, build:buildPnlCalc }
];
let calcActiveTab = 'compound';

function openCalculatorsView(){
  let overlay = document.getElementById('calculators-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'calculators-overlay';
    overlay.className = 'app-overlay';
    document.body.appendChild(overlay);
  }
  renderCalculatorsShell(overlay);
  overlay.classList.add('open');
}
function closeCalculatorsView(){
  const overlay = document.getElementById('calculators-overlay');
  if(overlay) overlay.classList.remove('open');
}

function renderCalculatorsShell(overlay){
  overlay.innerHTML = `
    <div class="app-overlay-header">
      <button class="app-overlay-close" aria-label="close" onclick="navigateTo('')">&times;</button>
      <div class="app-overlay-title">
        <div class="quiz-title">${calcT('מחשבונים', 'Calculators')}</div>
        <div class="quiz-subtitle">${calcT('כלים חינוכיים — לא ייעוץ השקעות', 'Educational tools — not investment advice')}</div>
      </div>
    </div>
    <div class="app-overlay-tabs" id="calc-tabs"></div>
    <div class="app-overlay-content"><div id="calc-body" class="quiz-body calc-body"></div></div>
  `;
  const tabsBar = overlay.querySelector('#calc-tabs');
  CALCULATOR_TABS.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'app-overlay-tab' + (tab.id === calcActiveTab ? ' active' : '');
    btn.textContent = tab.label[(typeof lang !== 'undefined') ? lang : 'en'];
    btn.addEventListener('click', () => { calcActiveTab = tab.id; renderCalculatorsShell(overlay); });
    tabsBar.appendChild(btn);
  });
  const tab = CALCULATOR_TABS.find(t => t.id === calcActiveTab);
  tab.build(overlay.querySelector('#calc-body'));
}

// A small, reusable "labeled number input" builder — every calculator form
// is built from a few of these plus a result box, so this is the one place
// that input styling/behavior lives.
function calcNumField(container, id, labelHe, labelEn, defaultValue){
  const wrap = document.createElement('div');
  wrap.className = 'calc-field';
  const label = document.createElement('label');
  label.textContent = calcT(labelHe, labelEn);
  label.htmlFor = id;
  const input = document.createElement('input');
  input.type = 'number'; input.id = id; input.className = 'calc-input';
  input.value = defaultValue;
  wrap.appendChild(label); wrap.appendChild(input);
  container.appendChild(wrap);
  return input;
}

function buildCompoundInterestCalc(body){
  body.innerHTML = '';
  const principal = calcNumField(body, 'ci-principal', 'סכום התחלתי', 'Starting amount', 10000);
  const rate = calcNumField(body, 'ci-rate', 'תשואה שנתית משוערת (%)', 'Assumed annual return (%)', 7);
  const years = calcNumField(body, 'ci-years', 'שנים', 'Years', 20);
  const yearly = calcNumField(body, 'ci-yearly', 'הפקדה שנתית נוספת (אופציונלי)', 'Additional yearly contribution (optional)', 0);
  const result = document.createElement('div');
  result.className = 'calc-result';
  body.appendChild(result);
  function update(){
    const r = compoundInterest(+principal.value||0, +rate.value||0, Math.max(0,Math.min(100,+years.value||0)), +yearly.value||0);
    result.innerHTML = `
      <div class="calc-result-big">$${calcFmt(r.futureValue)}</div>
      ${calcLine(calcT('סה"כ הופקד', 'Total contributed'), '$'+calcFmt(r.totalContributed))}
      ${calcLine(calcT('סה"כ צמיחה', 'Total growth'), '$'+calcFmt(r.totalGrowth))}
      <div class="calc-note">${calcT('זוהי הדגמה חינוכית עם תשואה קבועה מדומה — לא תחזית אמיתית לשוק.', 'This is an educational illustration with an assumed constant return — not a real market forecast.')}</div>
    `;
  }
  [principal,rate,years,yearly].forEach(el => el.addEventListener('input', update));
  update();
}

function buildDcaCalc(body){
  body.innerHTML = '';
  const amount = calcNumField(body, 'dca-amount', 'סכום לתקופה', 'Amount per period', 500);
  const periods = calcNumField(body, 'dca-periods', 'מספר תקופות (חודשים)', 'Number of periods (months)', 120);
  const rate = calcNumField(body, 'dca-rate', 'תשואה שנתית משוערת (%)', 'Assumed annual return (%)', 7);
  const result = document.createElement('div');
  result.className = 'calc-result';
  body.appendChild(result);
  function update(){
    const r = dollarCostAverage(+amount.value||0, Math.max(0,+periods.value||0), +rate.value||0, 12);
    result.innerHTML = `
      <div class="calc-result-big">$${calcFmt(r.futureValue)}</div>
      ${calcLine(calcT('סה"כ הופקד', 'Total contributed'), '$'+calcFmt(r.totalContributed))}
      ${calcLine(calcT('סה"כ צמיחה', 'Total growth'), '$'+calcFmt(r.totalGrowth))}
      <div class="calc-note">${calcT('מודל הדגמה עם תשואה חודשית קבועה מדומה — לא מדמה תנודתיות אמיתית של השוק.', 'An illustrative model with a constant assumed monthly return — it does not simulate real market volatility.')}</div>
    `;
  }
  [amount,periods,rate].forEach(el => el.addEventListener('input', update));
  update();
}

function buildReturnCalc(body){
  body.innerHTML = '';
  const initial = calcNumField(body, 'ret-initial', 'ערך התחלתי', 'Initial value', 1000);
  const final = calcNumField(body, 'ret-final', 'ערך סופי', 'Final value', 1200);
  const result = document.createElement('div');
  result.className = 'calc-result';
  body.appendChild(result);
  function update(){
    const r = percentageReturn(+initial.value||0, +final.value||0);
    if(!r.validInput){
      result.innerHTML = `<div class="calc-note">${calcT('ערך התחלתי חייב להיות שונה מאפס.', 'Initial value must be non-zero.')}</div>`;
      return;
    }
    const cls = r.percentChange >= 0 ? 'up' : 'down';
    result.innerHTML = `
      <div class="calc-result-big stock-card-change ${cls}">${r.percentChange>=0?'+':''}${r.percentChange.toFixed(2)}%</div>
      ${calcLine(calcT('שינוי מוחלט', 'Absolute change'), calcFmt(r.absoluteChange))}
    `;
  }
  [initial,final].forEach(el => el.addEventListener('input', update));
  update();
}

function buildPnlCalc(body){
  body.innerHTML = '';
  const buy = calcNumField(body, 'pnl-buy', 'מחיר קנייה', 'Buy price', 100);
  const sell = calcNumField(body, 'pnl-sell', 'מחיר מכירה', 'Sell price', 120);
  const shares = calcNumField(body, 'pnl-shares', 'מספר מניות', 'Number of shares', 10);
  const fees = calcNumField(body, 'pnl-fees', 'עמלות (סה"כ, אופציונלי)', 'Fees (total, optional)', 0);
  const result = document.createElement('div');
  result.className = 'calc-result';
  body.appendChild(result);
  function update(){
    const r = profitLoss(+buy.value||0, +sell.value||0, +shares.value||0, +fees.value||0, 0);
    const cls = r.netProfitLoss >= 0 ? 'up' : 'down';
    result.innerHTML = `
      <div class="calc-result-big stock-card-change ${cls}">${r.netProfitLoss>=0?'+':''}$${calcFmt(r.netProfitLoss)}</div>
      ${calcLine(calcT('עלות כוללת', 'Total cost'), '$'+calcFmt(r.totalCost))}
      ${calcLine(calcT('תמורה כוללת', 'Total proceeds'), '$'+calcFmt(r.totalProceeds))}
      ${r.percentReturn != null ? calcLine(calcT('תשואה', 'Return'), r.percentReturn.toFixed(2)+'%') : ''}
    `;
  }
  [buy,sell,shares,fees].forEach(el => el.addEventListener('input', update));
  update();
}

registerRoute('calculators', { onEnter: openCalculatorsView, onLeave: closeCalculatorsView });
