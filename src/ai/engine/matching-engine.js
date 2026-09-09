
// Maps each on-site lesson section to the KB topic it's about, so "explain
// this chart to me" can respond with whatever the visitor is actually
// looking at right now.
const LESSON_TOPIC = { l0:'trend', l1:'support-resistance', l2:'breakout-retest', l3:'moving-averages', l4:'candlestick', l5:'fibonacci', l6:'rsi', l7:'chart-patterns' };

function currentLessonTopicId(){
  const active = document.querySelector('.lesson-nav a.active');
  if(!active) return null;
  const href = active.getAttribute('href') || '';
  const id = href.replace('#','');
  return LESSON_TOPIC[id] || null;
}

function normalizeText(s){
  return (s || '')
    .toLowerCase()
    .replace(/[°'"׳״.,!?;:()\[\]{}\-–—/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


// ---------------------------------------------------------------------------
// Fuzzy matching for typos: catches common misspellings of single-word
// English financial terms (e.g. "divdend", "resistence", "flucutation")
// that wouldn't otherwise substring-match any keyword.
// ---------------------------------------------------------------------------
function levenshtein(a, b){
  if(a === b) return 0;
  if(!a.length) return b.length;
  if(!b.length) return a.length;
  let prev = Array.from({length:b.length+1}, (_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const cur = [i];
    for(let j=1;j<=b.length;j++){
      const cost = a[i-1]===b[j-1] ? 0 : 1;
      cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

// One canonical (short, single/double-word, alphabetic) term per entry,
// used only for fuzzy typo matching — not the main phrase matcher. A
// minimum length of 6 is required: for very short words (4-5 letters,
// e.g. "gold"), a 1-character edit distance is a huge fraction of the
// word and much more likely to land on a coincidental different real word
// ("good") than an actual typo — which is exactly what happened before
// this fix ("good news" was fuzzy-matched as a typo of "gold").
const FUZZY_TERMS = [];
const HEB_FUZZY_TERMS = [];
(function buildFuzzyTerms(){
  for(const entry of KB){
    for(const raw of entry.kw){
      const k = raw.toLowerCase().trim();
      if(/^[a-z][a-z\s]{5,14}$/.test(k) && k.split(' ').length <= 2){
        FUZZY_TERMS.push({ term:k, id:entry.id });
      }
      // Hebrew single-word terms get the same typo tolerance. Beginners
      // routinely mistype these ("ממומע" for "ממוצע", "פיסונאצי" for
      // "פיבונאצ'י"), and without this they fell through to the generic
      // fallback. Minimum length 4 keeps short Hebrew words — where a
      // one-letter edit often lands on a different real word — out of it.
      if(/^[\u0590-\u05FF]{4,14}$/.test(k)){
        HEB_FUZZY_TERMS.push({ term:k, id:entry.id });
      }
    }
  }
})();

function fuzzyBonus(norm){
  const bonus = {};
  const words = norm.split(' ').filter(w => /^[a-z]{4,15}$/.test(w));
  // Hebrew pass: same edit-distance idea, run over Hebrew tokens.
  for(const w of norm.split(' ').filter(x => /^[\u0590-\u05FF]{4,15}$/.test(x))){
    for(const ft of HEB_FUZZY_TERMS){
      if(Math.abs(ft.term.length - w.length) > 1) continue;
      if(w === ft.term) continue;
      if(levenshtein(w, ft.term) <= 1){
        bonus[ft.id] = (bonus[ft.id] || 0) + 2;
      }
    }
  }
  for(const w of words){
    for(const ft of FUZZY_TERMS){
      if(ft.term.includes(' ')) continue; // only single-word fuzzy compare
      if(Math.abs(ft.term.length - w.length) > 2) continue;
      if(w === ft.term) continue; // exact match already scored elsewhere
      const maxDist = ft.term.length >= 7 ? 2 : 1;
      if(levenshtein(w, ft.term) <= maxDist){
        bonus[ft.id] = (bonus[ft.id] || 0) + 2;
      }
    }
  }
  return bonus;
}

function kbById(id){ return KB.find(e => e.id === id); }
function kbTextFor(id, langCode){
  const entry = kbById(id);
  return entry ? entry[langCode] : null;
}

// ---------------------------------------------------------------------------
// Scoring: every KB entry against the normalized question. Longer / more
// specific keyword phrases score higher than short generic ones.
// ---------------------------------------------------------------------------
function scoreAllEntries(norm){
  const scores = [];
  const fuzzy = fuzzyBonus(norm);
  const padded = ' ' + norm + ' ';
  for(const entry of KB){
    let score = 0;
    for(const raw of entry.kw){
      const k = normalizeText(raw);
      if(!k) continue;
      // A short (<=3 char) pure-ASCII acronym like "iv", "fed", or "rsi" is
      // extremely likely to appear as a silent substring inside an unrelated
      // English word ("passIVe", "diveRSIfication", "ninetyFED..."), so for
      // these specifically the match itself (not just the scoring bonus
      // below) requires a word boundary. This check never touches Hebrew
      // keywords, which legitimately need substring matching to work with
      // Hebrew's attached prefixes (e.g. "gap" found inside "בגאפ").
      const isRiskyAsciiToken = /^[a-z]{1,3}$/i.test(raw);
      const matched = isRiskyAsciiToken ? padded.includes(' ' + k + ' ') : norm.includes(k);
      if(matched){
        score += k.split(' ').length + (k.length > 3 ? 1 : 0);
        // Short jargon acronyms (P/E, ROE, RSI, EPS, PEG, ETF, IPO...) are
        // highly diagnostic despite their short normalized length, unlike a
        // short common word — without this they'd tie with (and sometimes
        // lose to) a generic keyword like "stock" on pure length scoring.
        // The bonus (only the bonus, not the base match) requires a word
        // boundary: "rsi" must appear as its own token, not as a silent
        // substring inside an unrelated longer word like "diversification".
        if(/^[a-z0-9/&]{2,10}$/i.test(raw) && (raw.includes('/') || raw.length <= 4)){
          if(padded.includes(' ' + k + ' ')) score += 2;
        }
      }
    }
    if(fuzzy[entry.id]) score += fuzzy[entry.id];
    // Dedicated single-concept entries (priority) outrank broad umbrella
    // entries that merely mention the same term in passing.
    if(score > 0 && entry.priority) score += entry.priority;
    if(score > 0) scores.push({ entry, score });
  }
  scores.sort((a,b) => b.score - a.score);
  return scores;
}

// ---------------------------------------------------------------------------
// Compound-question composition: if the question seems to touch more than
// one topic with comparable strength (e.g. it combines two concepts, or uses
// connector words like "and", "difference", "if... then"), combine the top
// matching entries into one answer instead of only returning the single best
// match.
// ---------------------------------------------------------------------------
const COMPOUND_HINTS = ['difference between','compare','vs','advantages and disadvantages','if ','then ','אם ',' לעומת ','מה ההבדל','יתרונות וחסרונות','מה עדיף'];

function looksCompound(norm){
  return COMPOUND_HINTS.some(h => norm.includes(normalizeText(h)));
}

const CONNECTORS_HE = ['בנוסף, ', 'כדאי גם לזכור ש', 'וכן: '];
const CONNECTORS_EN = ['Also, ', "It's also worth noting: ", 'On top of that: '];

function composeAnswer(scored, langCode){
  if(!scored.length) return null;
  const top = scored[0];
  const picked = [top];
  for(let i=1; i<scored.length && picked.length<3; i++){
    const cand = scored[i];
    if(cand.entry.id === top.entry.id) continue;
    if(cand.score >= Math.max(3, top.score*0.5)){
      picked.push(cand);
    } else {
      break;
    }
  }
  if(picked.length === 1){
    return { text: top.entry[langCode], relatedIds: (top.entry.related || []).slice(0,2) };
  }
  const connectors = langCode === 'he' ? CONNECTORS_HE : CONNECTORS_EN;
  let text = picked[0].entry[langCode];
  for(let i=1;i<picked.length;i++){
    const connector = connectors[(i-1) % connectors.length];
    text += '\n\n' + connector + picked[i].entry[langCode];
  }
  const relatedIds = [];
  picked.forEach(p => (p.entry.related||[]).forEach(r => { if(!relatedIds.includes(r) && !picked.some(pp=>pp.entry.id===r)) relatedIds.push(r); }));
  return { text, relatedIds: relatedIds.slice(0,2) };
}

// ---------------------------------------------------------------------------
// Specific-company / live-data guard: if someone names a known company or
// ticker together with an opinion/"current data" style question, don't
// invent numbers — explain that there's no live data connection instead.
// ---------------------------------------------------------------------------
const KNOWN_COMPANIES = ['nvidia','nvda','apple','aapl','tesla','tsla','microsoft','msft','amazon','amzn','google','alphabet','googl','meta','facebook','netflix','nflx','palantir','pltr','טבע','בזק','לאומי','פועלים','אמזון','טסלה','אפל','אנבידיה','אנווידיה','אנסידיה','נבידיה','אינבידיה','מיקרוסופט','מטא','גוגל','נטפליקס','פלנטיר'];
const OPINION_HINTS = ['what do you think of','should i buy','should i sell','is it worth buying','current price of','current p/e of','give me an analysis of','give me a fundamental analysis','give me a technical analysis','analyze the stock','analyze this stock','analysis of the company','מה דעתך על','כדאי לקנות','כדאי למכור','מה ה-p/e הנוכחי','מה המחיר הנוכחי','שווה לקנות','תן לי ניתוח','תן לי סקירה','נתח לי את','תנתח לי את','תנתח את','נתח את המניה','ניתוח פונדמנטלי של','ניתוח פונדומנטלי','ניתוח טכני של','סקירה על','מה המצב של','איך נראית המניה'];

function mentionsKnownCompanyWithOpinion(norm){
  const hasCompany = KNOWN_COMPANIES.some(c => norm.includes(normalizeText(c)));
  const hasOpinionAsk = OPINION_HINTS.some(h => norm.includes(normalizeText(h)));
  return hasCompany && hasOpinionAsk;
}

// ---------------------------------------------------------------------------
// User-supplied numeric metrics analyzer: if the visitor pastes their own
// numbers ("P/E 32, Revenue Growth 15%, ROIC 28%"), extract and comment on
// each recognized metric using general benchmark thresholds. This is
// explicitly NOT live market data — only numbers the user typed themselves.
// ---------------------------------------------------------------------------
const METRIC_PATTERNS = [
  { id:'pe', re:/\bp\W?e\b\D{0,15}?(\d+(?:\.\d+)?)/i, label:{he:'P/E', en:'P/E'},
    comment(v, he){ if(v<15) return he?'יחסית נמוך — יכול לרמז על הזדמנות או על ציפיות צמיחה נמוכות; שווה לבדוק מול חברות דומות בענף.':'Relatively low — could hint at a bargain or low growth expectations; worth comparing to similar companies in the industry.';
      if(v<=25) return he?'טווח סביר יחסית לממוצע השוק.':'A fairly typical range relative to the broad market average.';
      return he?'גבוה יחסית — השוק מצפה לצמיחה משמעותית; כדאי לבדוק גם PEG וקצב הצמיחה בפועל.':'Relatively high — the market is pricing in significant growth; worth also checking PEG and the actual growth rate.'; } },
  { id:'peg', re:/\bpeg\D{0,15}?(\d+(?:\.\d+)?)/i, label:{he:'PEG', en:'PEG'},
    comment(v, he){ if(v<1) return he?'מתחת ל-1 — יכול לרמז שהמניה זולה יחסית לקצב הצמיחה שלה.':'Below 1 — can hint the stock is cheap relative to its growth rate.';
      if(v<=2) return he?'סביב 1-2 — מחיר סביר יחסית לצמיחה.':'Around 1-2 — a fairly reasonable price relative to growth.';
      return he?'מעל 2 — יקרה יחסית לקצב הצמיחה שלה, גם אם ה-P/E הבודד נראה סביר.':'Above 2 — expensive relative to its own growth rate, even if the standalone P/E looks reasonable.'; } },
  { id:'roe', re:/\broe\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'ROE', en:'ROE'},
    comment(v, he){ if(v>15) return he?'נחשב חזק ברוב הענפים — אך שווה לבדוק אם זה נובע ממינוף גבוה.':'Considered strong in most industries — but worth checking whether it comes from high leverage.';
      if(v>=5) return he?'טווח סביר.':'A reasonable range.';
      return he?'חלש יחסית — כדאי להבין למה.':'Relatively weak — worth understanding why.'; } },
  { id:'roa', re:/\broa\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'ROA', en:'ROA'},
    comment(v, he){ if(v>8) return he?'חזק יחסית — שימוש יעיל בנכסי החברה.':'Relatively strong — efficient use of the company\'s assets.';
      if(v>=3) return he?'טווח סביר.':'A reasonable range.';
      return he?'חלש יחסית.':'Relatively weak.'; } },
  { id:'roic', re:/\broic\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'ROIC', en:'ROIC'},
    comment(v, he){ if(v>15) return he?'חזק יחסית — יכול לרמז על יתרון תחרותי אמיתי (Moat) אם זה נשמר עקבי לאורך זמן.':'Relatively strong — can hint at a real competitive moat if sustained consistently over time.';
      if(v>=5) return he?'טווח סביר.':'A reasonable range.';
      return he?'חלש יחסית ביחס לעלות ההון הטיפוסית.':'Relatively weak versus a typical cost of capital.'; } },
  { id:'revenue-growth', re:/(?:revenue growth|צמיחת הכנסות)\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'צמיחת הכנסות', en:'Revenue growth'},
    comment(v, he){ if(v>20) return he?'צמיחה מהירה.':'Fast growth.';
      if(v>=5) return he?'צמיחה בינונית.':'Moderate growth.';
      return he?'צמיחה איטית — יכול לרמז על שוק בשל יותר.':'Slow growth — can hint at a more mature market.'; } },
  { id:'net-margin', re:/(?:net margin|שולי רווח נקי)\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'שולי רווח נקי', en:'Net margin'},
    comment(v, he){ if(v>20) return he?'רווחיות גבוהה יחסית.':'Relatively high profitability.';
      if(v>=5) return he?'טווח סביר, תלוי מאוד בענף.':'A reasonable range, though highly industry-dependent.';
      return he?'נמוכה יחסית — שווה לבדוק את מבנה העלויות.':'Relatively low — worth examining the cost structure.'; } },
  { id:'debt-equity', re:/(?:debt\W?equity|d\/e|חוב להון)\D{0,15}?(\d+(?:\.\d+)?)/i, label:{he:'Debt/Equity', en:'Debt/Equity'},
    comment(v, he){ if(v>2) return he?'מינוף גבוה יחסית — שווה לבדוק את היכולת לשרת את החוב (Interest Coverage).':'Relatively high leverage — worth checking the ability to service the debt (interest coverage).';
      if(v>=0.5) return he?'טווח סביר, תלוי בענף.':'A reasonable range, industry-dependent.';
      return he?'מאזן שמרני יחסית.':'A relatively conservative balance sheet.'; } },
  { id:'dividend-yield', re:/(?:dividend yield|תשואת דיבידנד)\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'תשואת דיבידנד', en:'Dividend yield'},
    comment(v, he){ if(v>5) return he?'גבוהה יחסית — שווה לוודא שהיא בת-קיימא ולא רק תוצאה של ירידת מחיר חדה.':'Relatively high — worth confirming it\'s sustainable and not just the result of a sharp price drop.';
      if(v>=1) return he?'טווח נפוץ.':'A common range.';
      return he?'נמוכה — החברה כנראה משקיעה יותר בצמיחה מאשר בחלוקת רווחים.':'Low — the company is probably reinvesting more in growth than distributing profit.'; } },
  { id:'ps', re:/\bp\W?s\b\D{0,15}?(\d+(?:\.\d+)?)/i, label:{he:'P/S', en:'P/S'},
    comment(v, he){ if(v<2) return he?'יחסית נמוך.':'Relatively low.';
      if(v<=8) return he?'טווח סביר לחברות צמיחה רבות.':'A fairly typical range for many growth companies.';
      return he?'גבוה יחסית — נפוץ בחברות צמיחה מהירה שעדיין לא רווחיות.':'Relatively high — common among fast-growing, not-yet-profitable companies.'; } },
  { id:'pb', re:/\bp\W?b\b\D{0,15}?(\d+(?:\.\d+)?)/i, label:{he:'P/B', en:'P/B'},
    comment(v, he){ if(v<1) return he?'מתחת ל-1 — נסחרת מתחת לשווי הנכסים שלה על הנייר.':'Below 1 — trading below its stated asset value on paper.';
      if(v<=3) return he?'טווח סביר.':'A reasonable range.';
      return he?'גבוה יחסית ביחס לנכסים בספרים.':'Relatively high versus book assets.'; } },
  { id:'current-ratio', re:/current ratio\D{0,15}?(\d+(?:\.\d+)?)/i, label:{he:'Current Ratio', en:'Current ratio'},
    comment(v, he){ if(v<1) return he?'מתחת ל-1 — יכול לרמז על בעיית נזילות בטווח הקצר.':'Below 1 — can hint at a short-term liquidity issue.';
      if(v<=3) return he?'נחשב בריא.':'Generally considered healthy.';
      return he?'גבוה מאוד — יכול גם לרמז על שימוש לא יעיל בנכסים שוטפים.':'Very high — can also hint at inefficient use of current assets.'; } },
  { id:'interest-coverage', re:/interest coverage\D{0,15}?(\d+(?:\.\d+)?)/i, label:{he:'כיסוי ריבית', en:'Interest coverage'},
    comment(v, he){ if(v<2) return he?'נמוך — יכול להיות קשה לעמוד בתשלומי החוב אם הרווח יורד.':'Low — could struggle to service debt if profit falls.';
      if(v<=5) return he?'טווח סביר.':'A reasonable range.';
      return he?'גבוה — נוחות רבה בעמידה בתשלומי הריבית.':'High — plenty of comfort servicing interest payments.'; } },
  { id:'gross-margin', re:/gross margin\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'שולי רווח גולמי', en:'Gross margin'},
    comment(v, he){ if(v>50) return he?'גבוהים יחסית — נפוץ בתוכנה ומותגים חזקים.':'Relatively high — common in software and strong brands.';
      if(v>=20) return he?'טווח סביר, תלוי מאוד בענף.':'A reasonable range, though highly industry-dependent.';
      return he?'נמוכים יחסית — נפוץ בענפים תחרותיים כמו קמעונאות.':'Relatively low — common in competitive industries like retail.'; } },
  { id:'operating-margin', re:/operating margin\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'שולי רווח תפעולי', en:'Operating margin'},
    comment(v, he){ if(v>20) return he?'חזקים יחסית.':'Relatively strong.';
      if(v>=5) return he?'טווח סביר.':'A reasonable range.';
      return he?'נמוכים יחסית — שווה לבדוק את מבנה ההוצאות התפעוליות.':'Relatively low — worth examining the operating expense structure.'; } },
  { id:'payout-ratio', re:/payout ratio\D{0,15}?(\d+(?:\.\d+)?)\s*%?/i, label:{he:'יחס חלוקה', en:'Payout ratio'},
    comment(v, he){ if(v>80) return he?'גבוה — הדיבידנד עלול להיות פחות בר-קיימא אם הרווח ייפגע.':'High — the dividend may be less sustainable if profit takes a hit.';
      if(v>=30) return he?'טווח סביר.':'A reasonable range.';
      return he?'נמוך — משאיר לחברה מקום לצמוח או להגדיל דיבידנד בעתיד.':'Low — leaves room for the company to grow or raise the dividend later.'; } },
  { id:'beta', re:/\bbeta\D{0,15}?(\d+(?:\.\d+)?)/i, label:{he:'בטא', en:'Beta'},
    comment(v, he){ if(v<0.8) return he?'נמוכה מ-1 — תנודתית פחות מהשוק הכללי.':'Below 1 — less volatile than the overall market.';
      if(v<=1.2) return he?'קרובה ל-1 — תנודתיות דומה בערך לשוק.':'Close to 1 — volatility roughly similar to the market.';
      return he?'מעל 1 — תנודתית יותר מהשוק הכללי, לשני הכיוונים.':'Above 1 — more volatile than the overall market, in both directions.'; } }
];

function extractMetricAnalysis(rawText, langCode){
  const he = langCode === 'he';
  const found = [];
  let firstId = null;
  for(const m of METRIC_PATTERNS){
    const match = rawText.match(m.re);
    if(match){
      const value = parseFloat(match[1]);
      if(!isNaN(value)){
        found.push(`${m.label[langCode]}: ${value} — ${m.comment(value, he)}`);
        if(!firstId) firstId = m.id;
      }
    }
  }
  if(!found.length) return null;
  const intro = he
    ? 'בהתבסס על הנתונים שסיפקת (לא נתוני שוק חיים):'
    : "Based on the numbers you provided (not live market data):";
  const outro = he
    ? 'זו פרשנות כללית מול רמות ייחוס נפוצות בשוק, לא ייעוץ השקעות — כדאי גם להשוות מול חברות דומות באותו ענף.'
    : "This is a general read against common market benchmarks, not investment advice — it's also worth comparing against similar companies in the same industry.";
  return { text: intro + '\n' + found.map(f => '• ' + f).join('\n') + '\n\n' + outro, topicId: firstId };
}

// A handful of phrasings ("explain this chart", "what's on screen") get a
// dynamic answer based on whichever lesson section the visitor is currently
// scrolled to, instead of one fixed piece of text.
const CHART_QUERY_KW = ['explain this chart','explain the chart','what does this chart show','תסביר לי את הגרף','תסביר את הגרף','מה הגרף הזה מראה'];
function isChartQuery(norm){
  return CHART_QUERY_KW.some(k => norm.includes(normalizeText(k)));
}


// ---------------------------------------------------------------------------
// Scenario detectors: some compound questions use very different wording
// than any single fixed phrase (e.g. "the stock broke resistance on high
// volume but RSI is already above 70" vs "פרצה התנגדות עם Volume גבוה").
// Instead of relying on one exact phrase, these fire when several distinct
// concept-groups are ALL present somewhere in the question, regardless of
// exact order or conjugation.
// ---------------------------------------------------------------------------
const SCENARIO_DETECTORS = [
  { id:'rate-growth-stocks-link', groups: [
      ['interest rate','rates rise','rate hike','ריבית עולה','ריבית עלתה','ריבית'],
      ['growth stock','growth stocks','מניות צמיחה','חברת צמיחה','חברות צמיחה']
  ]},
  { id:'high-pe-high-growth-peg-scenario', groups: [
      ['p/e','p e ratio','pe ratio','מכפיל רווח','מכפיל'],
      ['revenue growth','earnings growth','growth','צמיחה','צמיחת הכנסות','צמיחת רווחים']
  ]},
  { id:'breakout-volume-rsi-conflict-scenario', groups: [
      ['breakout','breakdown','broke resistance','broke through','פריצה','פרצה','שבירה','שבר'],
      ['volume','נפח'],
      ['rsi']
  ]},
  { id:'sp500-vs-nasdaq100', groups: [
      ['s&p 500','s&p500','sp500','ס אנד פי 500'],
      ['nasdaq','נאסד']
  ]}
];

function matchesGroups(norm, groups){
  return groups.every(group => group.some(k => norm.includes(normalizeText(k))));
}

function findScenarioMatch(norm){
  for(const sc of SCENARIO_DETECTORS){
    if(matchesGroups(norm, sc.groups)) return sc.id;
  }
  return null;
}


// ---------------------------------------------------------------------------
// Simple built-in calculators: when the visitor gives two raw numbers and
// asks to compute something (rather than stating the ratio directly), do
// the actual arithmetic instead of just defining the term. Best-effort text
// parsing — if the phrasing isn't recognized, the numeric-metric analyzer or
// normal KB matching still applies.
// ---------------------------------------------------------------------------
function tryCalculators(rawText, langCode){
  const he = langCode === 'he';
  const lower = rawText.toLowerCase();
  const wantsCalc = /calculate|compute|what.?s the|חשב|תחשב|כמה יוצא/i.test(lower) || true; // permissive: numbers+labels are enough signal

  // P/E from price + EPS
  let m1 = lower.match(/price\D{0,12}?(\d+(?:\.\d+)?).{0,50}?eps\D{0,12}?(\d+(?:\.\d+)?)/i) ||
           lower.match(/eps\D{0,12}?(\d+(?:\.\d+)?).{0,50}?price\D{0,12}?(\d+(?:\.\d+)?)/i);
  let mHe1 = rawText.match(/מחיר\D{0,12}?(\d+(?:\.\d+)?).{0,50}?רווח למניה\D{0,12}?(\d+(?:\.\d+)?)/) ||
             rawText.match(/רווח למניה\D{0,12}?(\d+(?:\.\d+)?).{0,50}?מחיר\D{0,12}?(\d+(?:\.\d+)?)/);
  if((m1 || mHe1) && /\beps\b|רווח למניה/i.test(rawText) && /price|מחיר/i.test(rawText)){
    let price, eps;
    const m = m1 || mHe1;
    const priceFirst = /price\D{0,12}?\d/i.test(lower) || /מחיר\D{0,12}?\d/.test(rawText);
    if(m1){ if(/^price/i.test(lower.match(/price|eps/i)[0]) || lower.search(/price/i) < lower.search(/eps/i)){ price=parseFloat(m1[1]); eps=parseFloat(m1[2]); } else { eps=parseFloat(m1[1]); price=parseFloat(m1[2]); } }
    else { if(rawText.search('מחיר') < rawText.search('רווח למניה')){ price=parseFloat(mHe1[1]); eps=parseFloat(mHe1[2]); } else { eps=parseFloat(mHe1[1]); price=parseFloat(mHe1[2]); } }
    if(eps > 0 && price > 0){
      const { pe } = peRatio(price, eps);
      const peRounded = pe.toFixed(1);
      const peComment = METRIC_PATTERNS.find(p=>p.id==='pe').comment(pe, he);
      return { text: he
        ? `מחיר ${price} חלקי רווח למניה ${eps} נותן מכפיל רווח (P/E) של ${peRounded}. ${peComment}`
        : `Price ${price} divided by EPS ${eps} gives a P/E ratio of ${peRounded}. ${peComment}`, topicId: 'pe' };
    }
  }

  // Dividend yield from price + dividend amount
  let m2 = lower.match(/price\D{0,12}?(\d+(?:\.\d+)?).{0,50}?dividend\D{0,12}?(\d+(?:\.\d+)?)/i) ||
           lower.match(/dividend\D{0,12}?(\d+(?:\.\d+)?).{0,50}?price\D{0,12}?(\d+(?:\.\d+)?)/i);
  let mHe2 = rawText.match(/מחיר\D{0,12}?(\d+(?:\.\d+)?).{0,50}?דיבידנד\D{0,12}?(\d+(?:\.\d+)?)/) ||
             rawText.match(/דיבידנד\D{0,12}?(\d+(?:\.\d+)?).{0,50}?מחיר\D{0,12}?(\d+(?:\.\d+)?)/);
  if((m2 || mHe2) && !/\beps\b|רווח למניה/i.test(rawText)){
    let price, div;
    if(m2){ if(lower.search(/price/i) < lower.search(/dividend/i)){ price=parseFloat(m2[1]); div=parseFloat(m2[2]); } else { div=parseFloat(m2[1]); price=parseFloat(m2[2]); } }
    else { if(rawText.search('מחיר') < rawText.search('דיבידנד')){ price=parseFloat(mHe2[1]); div=parseFloat(mHe2[2]); } else { div=parseFloat(mHe2[1]); price=parseFloat(mHe2[2]); } }
    if(price > 0 && div >= 0){
      const { yieldPct } = dividendYield(price, div);
      const yieldRounded = yieldPct.toFixed(2);
      const ydComment = METRIC_PATTERNS.find(p=>p.id==='dividend-yield').comment(yieldPct, he);
      return { text: he
        ? `דיבידנד שנתי ${div} חלקי מחיר ${price} נותן תשואת דיבידנד של ${yieldRounded}%. ${ydComment}`
        : `Annual dividend ${div} divided by price ${price} gives a dividend yield of ${yieldRounded}%. ${ydComment}`, topicId: 'dividend-yield' };
    }
  }

  // Compound interest / future value: amount, rate%, years
  const ciMatch = rawText.match(/(\d[\d,]*(?:\.\d+)?)\D{0,15}?(\d+(?:\.\d+)?)\s*%\D{0,20}?(\d+)\s*(?:years|year|שנים|שנה)/i);
  if(ciMatch && /compound|invest|ריבית דריבית|תשקיע|growth of|future value/i.test(lower + rawText)){
    const principal = parseFloat(ciMatch[1].replace(/,/g,''));
    const rate = parseFloat(ciMatch[2]) / 100;
    const years = parseInt(ciMatch[3], 10);
    if(principal > 0 && rate > 0 && years > 0 && years <= 100){
      const { futureValue } = compoundInterest(principal, rate*100, years, 0);
      const fvRounded = futureValue.toLocaleString(undefined, {maximumFractionDigits:0});
      return { text: he
        ? `${principal.toLocaleString()} בריבית דריבית של ${(rate*100).toFixed(1)}% למשך ${years} שנים יגיע ל-כ-${fvRounded} — כלומר גידול של פי ${(futureValue/principal).toFixed(1)}. זה ממחיש למה התחלה מוקדמת משנה כל כך: רוב הגידול מגיע מהשנים המאוחרות, אחרי שהריבית "מצטברת על ריבית" לאורך זמן.`
        : `${principal.toLocaleString()} compounding at ${(rate*100).toFixed(1)}% for ${years} years grows to roughly ${fvRounded} — about ${(futureValue/principal).toFixed(1)}x. This illustrates why starting early matters so much: most of the growth comes in the later years, once interest has been "compounding on interest" for a while.`, topicId: 'compound-interest' };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Browse-all-topics: an explicit escape hatch from free-text matching. If
// the visitor asks what topics are covered, the UI renders clickable
// category chips instead of relying on keyword matching at all.
// ---------------------------------------------------------------------------
const BROWSE_TOPICS_KW = ['list of topics','what topics do you cover','browse topics','all topics','topic list','רשימת נושאים','אילו נושאים אתה מכסה','כל הנושאים','עיין בנושאים','רשימת המושגים'];
function isBrowseTopicsRequest(norm){
  return BROWSE_TOPICS_KW.some(k => norm.includes(normalizeText(k)));
}

// ---------------------------------------------------------------------------
// Lightweight follow-up handling: short continuation questions ("ומה לגבי
// אג\"ח?", "what about bonds?") that alone might not score well can lean on
// the previous topic for context.
// ---------------------------------------------------------------------------
const CONTINUATION_KW = ['what about','and what about','also what about','ומה לגבי','מה עם','וגם מה עם','ומה עם'];
function isContinuation(norm){
  return CONTINUATION_KW.some(k => norm.includes(normalizeText(k)));
}

// "Explain that simpler" / "go deeper" — meta follow-ups about HOW to explain
// the previous topic, not new questions on their own, so they only make
// sense together with lastTopicId.
const SIMPLER_KW = ['simpler','more simply','in simple terms','beginner','like i\'m 5','like i am 5','like im 5','like i\'m 10','like i am 10','like im 10','בפשטות','יותר פשוט','כאילו אני בן','תפשט','למתחיל','בן 10','בן חמש','בן עשר'];
const DEEPER_KW = ['go deeper','dive deeper','more depth','more detail','elaborate on that','tell me more about that','תעמיק','להעמיק','תרחיב על זה','תרחיב יותר','עוד פרטים על זה','פרט יותר'];
// "Is that high/low?", "why?", "does that mean it's a lot?", "should I buy
// then?" — a whole family of short pronoun-reference follow-ups to whatever
// was just discussed (a number, a verdict, a concept). They don't name the
// topic themselves at all, so they only make sense together with
// lastTopicId, and are restricted to short messages so they never shadow a
// real new question that happens to share a word with this list.
const ISHIGHLOW_KW = ['is that high','is that low','is it high','is it low','is this high','is this low','is that a lot','is that good','is that bad','so is that good or bad','what should i do','what do i do now','why','why is that','why though','what does that mean','so what does that mean','should i buy then','is it worth buying then','זה גבוה','זה נמוך','האם זה גבוה','האם זה נמוך','האם זה טוב','זה טוב','זה רע','זה טוב או רע','אז זה טוב או רע','זה נחשב גבוה','זה נחשב נמוך','זה נחשב הרבה','זה הרבה','למה','למה זה','אז למה','מה זה אומר','אז מה זה אומר','אז כדאי','אז כדאי לקנות','כדאי לקנות אז','מה עושים','אז מה עושים','מה עושים עכשיו'];
function isSimplerRequest(norm){ return SIMPLER_KW.some(k => norm.includes(normalizeText(k))); }
function isDeeperRequest(norm){ return DEEPER_KW.some(k => norm.includes(normalizeText(k))); }
function isHighLowFollowup(norm){ return norm.split(' ').length <= 6 && ISHIGHLOW_KW.some(k => norm.includes(normalizeText(k))); }
// "And if it's 20 instead?" — a bare new number referring back to whatever
// metric was just being discussed (only meaningful when lastTopicId is
// itself one of the known numeric-ratio entries, e.g. after a P/E
// analysis). Re-runs that same metric's own comment() logic on the new
// number instead of just re-serving the old text unchanged.
function tryContextualNumberFollowup(rawText, langCode, lastTopicId){
  if(!lastTopicId) return null;
  const pattern = METRIC_PATTERNS.find(p => p.id === lastTopicId);
  if(!pattern) return null;
  const words = normalizeText(rawText).split(' ');
  if(words.length > 8) return null; // only short "what if it's X" style messages
  const numMatch = rawText.match(/-?\d+(?:\.\d+)?/);
  if(!numMatch) return null;
  const value = parseFloat(numMatch[0]);
  if(isNaN(value)) return null;
  const he = langCode === 'he';
  const preface = he ? `בהקשר של ${pattern.label.he} ${value}:\n\n` : `In the context of a ${pattern.label.en} of ${value}:\n\n`;
  return { text: preface + pattern.comment(value, he), topicId: lastTopicId };
}
// A short, simpler-reading version of an entry: just its first sentence
// (up to the first ". " or Hebrew equivalent), which is genuinely shorter
// and less jargon-dense than the full explanation, not just relabeled.
function firstSentence(text){
  const match = text.match(/^.*?[.!?](?:"|”)?(?=\s|$)/);
  return match ? match[0] : text;
}

// ---------------------------------------------------------------------------
// Intent / scope classification.
//
// A question names a TOPIC and asks for a FACET of it. Previously only the
// topic was resolved, so "what are the drawbacks of X" and "what is X" both
// returned the entry's whole text — the over-answering problem. Detecting the
// facet lets the engine answer the question that was actually asked.
//
// Detection is deliberately conservative: if no facet phrase is present the
// intent is 'full' and behaviour is exactly as before, so this can never make
// an existing answer worse — only narrower when narrowing was requested.
// ---------------------------------------------------------------------------
const FACET_PATTERNS = [
  { facet:'cons', kw:['disadvantage','disadvantages','drawback','drawbacks','downside','downsides','cons of','weakness','weaknesses','limitation','limitations',"what's bad about",'problems with','חסרון','חסרונות','מגרעות','בעיות של','למה זה בעייתי','מה רע ב','הבעיות של'] },
  { facet:'pros', kw:['advantage','advantages','benefit','benefits','upside','pros of','why use','strength','strengths','יתרון','יתרונות','למה כדאי להשתמש','מה טוב ב','התועלת של'] },
];
// A comparison question ("difference between X and Y") should be answered by
// a dedicated comparison entry when one exists, not by whichever single
// concept happened to score highest.
const COMPARISON_KW = ['difference between','vs','versus','compared to','ההבדל בין','מה ההבדל','לעומת','מול'];
function looksComparison(norm){
  return COMPARISON_KW.some(k => norm.includes(normalizeText(k)));
}
// Order-independent comparison detection: a comparison entry that declares
// `sides: [idA, idB]` is matched whenever BOTH side entries' own keywords
// appear in the message, regardless of which order they're written in —
// derived entirely from keywords those entries already need for standalone
// matching, so there's nothing extra to keep in sync.
function findComparisonBySides(norm){
  const comparisonEntries = KB.filter(e => e.cat === 'comparisons' && Array.isArray(e.sides));
  for(const entry of comparisonEntries){
    const [idA, idB] = entry.sides;
    const a = kbById(idA), b = kbById(idB);
    if(!a || !b) continue;
    const matches = e2 => e2.kw.some(k => norm.includes(normalizeText(k)));
    if(matches(a) && matches(b)) return entry;
  }
  return null;
}
function detectFacet(norm){
  for(const p of FACET_PATTERNS){
    if(p.kw.some(k => norm.includes(normalizeText(k)))) return p.facet;
  }
  return null;
}
// Pull just the requested facet out of an entry, when it has one. Returns null
// when the entry has no such facet, so the caller falls back to full text.
function facetTextFor(entry, facet, langCode){
  if(!facet || !entry.facets) return null;
  const f = entry.facets[facet];
  return (f && f[langCode]) ? f[langCode] : null;
}

// ---------------------------------------------------------------------------
// Period-specific moving averages: "ממוצע 150" and "ממוצע 20" are different
// questions. Detect the MA term plus a number and answer for that exact
// period, instead of returning the one generic moving-average entry.
//
// The MA word itself is matched with a 1-edit tolerance so typos like
// "ממומע" / "ממוצא" / "moving avarage" still resolve.
// ---------------------------------------------------------------------------
const MA_WORDS_HE = ['ממוצע','ממוצעים','סמא','אמא'];
const MA_WORDS_EN = ['ma','sma','ema','average','averages','moving'];
function mentionsMovingAverage(norm){
  const toks = norm.split(' ').filter(Boolean);
  for(const t of toks){
    if(MA_WORDS_EN.includes(t)) return true;
    for(const w of MA_WORDS_HE){
      if(t === w) return true;
      if(Math.abs(t.length - w.length) <= 1 && t.length >= 4 && levenshtein(t, w) <= 1) return true;
    }
  }
  return false;
}
function tryMovingAveragePeriod(rawText, langCode){
  const norm = normalizeText(rawText);
  if(!mentionsMovingAverage(norm)) return null;
  // Take the first standalone 1-3 digit number in the message as the period.
  const m = norm.match(/(?:^|\s)(\d{1,3})(?:\s|$)/);
  if(!m) return null;
  const n = parseInt(m[1], 10);
  if(!(n >= 2 && n <= 400)) return null;
  const he = langCode === 'he';
  const exact = MA_PERIODS[n];
  const body = exact ? exact[langCode] : maBandDescription(n, he);
  return { text: body, topicId: 'moving-averages' };
}

async function generateAiReply(userText, langCode, lastTopicId, conversationContext){
  const norm = normalizeText(userText);
  // Entity-context bookkeeping happens right here, before any routing:
  // count this as one more turn that hasn't touched the active entity yet
  // (touchEntityContext during this same call, from recordActiveEntity or
  // a successful comparison, will reset it back to 0 if it turns out this
  // turn IS about the entity) — and expire stale context from PRIOR turns
  // before the pronoun/comparison paths below get a chance to use it.
  noteTurnPassed(conversationContext);
  expireEntityContextIfStale(conversationContext);

  // Greetings are matched on the WHOLE message, never as a substring. Short
  // Hebrew greetings are substrings of ordinary words ("הי" sits inside
  // "להיות"), which previously made unrelated questions answer with a
  // greeting, so they cannot go in the keyword list.
  const GREETING_EXACT = ['hi','hey','hello','yo','שלום','היי','הי','אהלן','הלו'];
  if(GREETING_EXACT.includes(norm)){
    const g = kbById('greeting');
    if(g) return { text: g[langCode], relatedIds: [], topicId: g.id };
  }

  // 1) Explicit request to browse the whole topic list.
  if(isBrowseTopicsRequest(norm)){
    return {
      text: langCode === 'he'
        ? 'בטח — הנה קטגוריות הנושאים שאני מכיר. תבחר אחת כדי לראות רשימת נושאים בתוכה.'
        : "Sure — here are the topic categories I know. Pick one to see the list of topics inside it.",
      relatedIds: [], browse: true
    };
  }

  // 2) A calculation from raw numbers (price+EPS, price+dividend, compound
  //    interest) — different from just being handed an already-computed ratio.
  const calcResult = tryCalculators(userText, langCode);
  if(calcResult){
    return { text: calcResult.text, relatedIds: [], topicId: calcResult.topicId };
  }

  // 3) User supplied their own already-computed metrics to analyze.
  const numericAnalysis = extractMetricAnalysis(userText, langCode);
  if(numericAnalysis){
    return { text: numericAnalysis.text, relatedIds: [], topicId: numericAnalysis.topicId };
  }

  // 4) "Explain this chart" — dynamic, based on the active lesson.
  if(isChartQuery(norm)){
    const topicId = currentLessonTopicId();
    if(topicId) return { text: kbTextFor(topicId, langCode), relatedIds: [] };
    return {
      text: langCode === 'he'
        ? 'גלול לאחד השיעורים באתר (מגמה, תמיכה/התנגדות, ממוצעים נעים, נרות, פיבונאצ\'י, RSI או תבניות גרף) ואז תשאל אותי שוב "תסביר לי את הגרף" — אסביר בדיוק את הנושא של אותו שיעור.'
        : 'Scroll to one of the lessons on this site (trend, support/resistance, moving averages, candlesticks, Fibonacci, RSI, or chart patterns) and ask me again — I\'ll explain exactly the topic that lesson covers.',
      relatedIds: []
    };
  }

  // 5) Scenario detectors: compound concept-group matches take priority
  //    over generic single-keyword scoring, since exact phrasing varies a lot.
  const scenarioId = findScenarioMatch(norm);
  if(scenarioId){
    const scenarioEntry = kbById(scenarioId);
    return { text: scenarioEntry[langCode], relatedIds: (scenarioEntry.related || []).slice(0,2), topicId: scenarioEntry.id };
  }

  // 6) A recognized company ticker: try to fetch and format real market
  //     data for exactly the facet asked (price/PE/technical/fundamental/
  //     trend/change/risks/full). Returns null if no ticker is recognized,
  //     so an unrelated question naturally falls through to normal KB
  //     matching below. Also records the entity into conversationContext
  //     (when provided) so a LATER message with no company name at all —
  //     "מה ה-P/E שלה?", "זה גבוה?" — can still resolve.
  const stockAnswer = await tryStockDataAnswerStatic(norm, langCode, conversationContext);
  if(stockAnswer) return stockAnswer;

  // 7) Dynamic company lookup for anything not in the curated list above.
  //     Placed here — before generic KB scoring — because a specific-company
  //     question like "מה המחיר של מניית Zillow" would otherwise lose to the
  //     generic "what is a stock" entry, which matches on the bare word
  //     "מניה" that's also present in the sentence. This is safe to run
  //     unconditionally at this point because extractLatinCandidate/
  //     extractHebrewCandidate only return something for messages that
  //     contain an explicit company-question trigger phrase or a proper-
  //     noun-shaped token — an ordinary conceptual question like "מה זה
  //     מניה" or "what is a stock" matches neither and never reaches the
  //     network call.
  const dynamicStockAnswer = await tryStockDataAnswerDynamic(norm, langCode, userText, conversationContext);
  if(dynamicStockAnswer) return dynamicStockAnswer;

  // 7b) Entity comparison ("who is more profitable, A or B") and pronoun
  //     reference ("her P/E", "is that high?") — reachable only once steps
  //     6-7 already failed to find a company NAMED in this message, and
  //     only meaningful with conversationContext carrying entity memory
  //     from earlier turns. Comparison checked first: it requires two
  //     distinct entities in context, a strictly narrower condition than
  //     the pronoun path's single active entity, so it should win when both
  //     could theoretically apply.
  const entityComparisonAnswer = await tryEntityComparisonAnswer(norm, langCode, conversationContext);
  if(entityComparisonAnswer) return entityComparisonAnswer;

  const pronounEntityAnswer = await tryPronounEntityAnswer(norm, langCode, conversationContext);
  if(pronounEntityAnswer) return pronounEntityAnswer;

  // 8) Normal (possibly compound) topic matching. Checked BEFORE the meta
  //    follow-ups below: a real question like "what is an ETF for
  //    beginners?" must win on its own content even if it happens to
  //    contain a word like "beginner" and a previous topic is in context.
  // 8b) A moving average with an explicit period gets a period-specific
  //     answer. Checked before generic scoring, since the generic
  //     moving-averages entry would otherwise win and ignore the number.
  const maAnswer = tryMovingAveragePeriod(userText, langCode);
  if(maAnswer){
    return { text: maAnswer.text, relatedIds: ['trend','support-resistance'], topicId: maAnswer.topicId };
  }

  let scored = scoreAllEntries(norm);
  if(scored.length){
    const compound = looksCompound(norm);
    // Comparison questions: promote a comparison-category entry if one also
    // matched, so "difference between a bear and a bull market" answers the
    // comparison rather than just one of the two concepts.
    //
    // Two mechanisms, because a comparison phrase's word order varies a lot
    // ("X vs Y" vs "Y vs X") and hand-listing every order as its own keyword
    // is exactly the one-off-patch trap this project already fell into twice
    // (SanDisk, Fiverr, on the entity-resolution side). The general fix: if
    // a comparison entry declares which two entries it compares (`sides`),
    // it's promoted whenever BOTH sides' own keywords are present in the
    // message, in EITHER order — no per-order phrase needed. Entries without
    // a clean pair of standalone "side" entries keep using explicit keyword
    // phrases (still checked first below).
    if(looksComparison(norm)){
      const bySides = findComparisonBySides(norm);
      const byKeyword = scored.find(s => s.entry.cat === 'comparisons');
      const cmp = byKeyword || (bySides ? scored.find(s => s.entry.id === bySides.id) || { entry: bySides } : null);
      if(cmp && cmp !== scored[0]){
        scored = [cmp].concat(scored.filter(s => s !== cmp));
      }
    }
    const facet = detectFacet(norm);
    const facetText = facet ? facetTextFor(scored[0].entry, facet, langCode) : null;
    // A facet request is inherently narrow, so it never triggers the
    // multi-topic compound composition below — answering "drawbacks of X"
    // with X plus two neighbouring topics is exactly the behaviour this is
    // meant to prevent.
    const composed = facetText
      ? { text: facetText, relatedIds: (scored[0].entry.related||[]).slice(0,2) }
      : (compound ? composeAnswer(scored, langCode) : { text: scored[0].entry[langCode], relatedIds: (scored[0].entry.related||[]).slice(0,2) });
    composed.topicId = scored[0].entry.id;
    return composed;
  }

  // 10) Meta follow-ups about the previous answer itself ("explain simpler",
  //    "go deeper") — checked only once normal scoring above has already
  //    failed to find a real topic match, so a genuine question that
  //    happens to contain a word like "beginner" is never shadowed by this.
  if(lastTopicId && isSimplerRequest(norm)){
    const prevEntry = kbById(lastTopicId);
    if(prevEntry){
      const short = firstSentence(prevEntry[langCode]);
      const preface = langCode === 'he' ? 'בקצרה, הרעיון המרכזי:\n\n' : 'In short, the core idea:\n\n';
      const offer = langCode === 'he' ? '\n\nרוצה שאפרט יותר?' : '\n\nWant me to expand on that?';
      return { text: preface + short + offer, relatedIds: (prevEntry.related||[]).slice(0,2), topicId: prevEntry.id };
    }
  }
  if(lastTopicId){
    // A bare new number ("and if it's 20?", "ואם הוא 20?") referring back to
    // whatever metric was just discussed gets a real recalculated verdict,
    // checked independently of the phrase list below since it's identified
    // by shape (short message + a number) rather than fixed wording.
    const numericFollowup = tryContextualNumberFollowup(userText, langCode, lastTopicId);
    if(numericFollowup) return { text: numericFollowup.text, relatedIds: [], topicId: numericFollowup.topicId };
  }
  if(lastTopicId && isHighLowFollowup(norm)){
    const prevEntry = kbById(lastTopicId);
    if(prevEntry){
      const preface = langCode === 'he' ? 'בהתייחס למספר שהזכרת:\n\n' : "Regarding the number you mentioned:\n\n";
      return { text: preface + prevEntry[langCode], relatedIds: (prevEntry.related||[]).slice(0,2), topicId: prevEntry.id };
    }
  }
  if(lastTopicId && isDeeperRequest(norm)){
    const prevEntry = kbById(lastTopicId);
    const relatedEntries = prevEntry && (prevEntry.related||[]).map(kbById).filter(Boolean);
    if(relatedEntries && relatedEntries.length){
      const preface = langCode === 'he' ? 'להעמקה נוספת בנושאים הקשורים:\n\n' : 'Going deeper, into related topics:\n\n';
      const body = relatedEntries.map(e => e[langCode]).join('\n\n');
      return { text: preface + body, relatedIds: [], topicId: relatedEntries[0].id };
    }
    if(prevEntry){
      const note = langCode === 'he'
        ? 'זה כבר ההסבר המלא שיש לי על הנושא הזה — אין לי לפניך פרטים נוספים ברמה עמוקה יותר, אבל אשמח לענות על שאלת המשך ממוקדת אם יש כזו.'
        : "That's already the full explanation I have on this topic — I don't have further depth beyond it, but I'm happy to answer a more specific follow-up question if you have one.";
      return { text: note, relatedIds: [], topicId: prevEntry.id };
    }
  }

  // 11) Short follow-up ("what about bonds?") that didn't score on its own —
  //     lean on whatever topic was just discussed.
  if(lastTopicId && isContinuation(norm)){
    const prevEntry = kbById(lastTopicId);
    const nextId = prevEntry && prevEntry.related && prevEntry.related[0];
    const nextEntry = nextId && kbById(nextId);
    if(nextEntry){
      const preface = langCode === 'he' ? 'בהמשך לנושא הקודם:\n\n' : 'Following up on the previous topic:\n\n';
      return { text: preface + nextEntry[langCode], relatedIds: (nextEntry.related||[]).slice(0,2), topicId: nextEntry.id };
    }
  }

  // 12) General short contextual follow-up. If the visitor is mid-conversation
  //     and sends something short that matched no topic on its own ("אז מה
  //     עדיף?", "is 85 high?", "ומה החסרונות?", "זה תמיד עובד?"), it is
  //     almost certainly still about the topic just discussed rather than a
  //     new subject. Re-serving that topic is far more useful than the
  //     off-topic fallback. This is deliberately the LAST resort before the
  //     fallback, so it can never shadow a question that matched a topic on
  //     its own merits. The word cap keeps it from swallowing genuine new
  //     long questions that simply aren't covered by the KB.
  if(lastTopicId && norm.split(' ').filter(Boolean).length <= 7){
    const prevEntry = kbById(lastTopicId);
    if(prevEntry){
      const preface = langCode === 'he' ? 'בהמשך למה שדיברנו עליו:\n\n' : 'Continuing on what we were discussing:\n\n';
      const offer = langCode === 'he'
        ? '\n\nאם התכוונת לשאלה אחרת, נסח אותה קצת יותר במפורש ואענה עליה.'
        : "\n\nIf you meant something different, phrase it a little more explicitly and I'll answer that.";
      return { text: preface + prevEntry[langCode] + offer, relatedIds: (prevEntry.related||[]).slice(0,2), topicId: prevEntry.id };
    }
  }

  // 13) Off-topic fallback.
  const fallback = langCode === 'he'
    ? 'אני מתמקד בנושאי שוק ההון והשיעורים באתר הזה, ואין לי תשובה טובה לשאלה הזו. נסה לשאול למשל על מניות, מדדים, P/E, ROIC, סיכון, ניתוח טכני או פונדמנטלי, מאקרו-כלכלה, אג"ח, או אפילו אופציות — או בקש ממני "רשימת נושאים" כדי לעיין בכל מה שאני מכסה.'
    : "I'm focused on stock-market topics and the lessons on this site, and I don't have a good answer for that. Try asking about things like stocks, indices, P/E, ROIC, risk, technical or fundamental analysis, macroeconomics, bonds, or even options — or ask me for a \"list of topics\" to browse everything I cover.";
  return { text: fallback, relatedIds: [] };
}

