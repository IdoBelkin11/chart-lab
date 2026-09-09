// ---------------------------------------------------------------------------
// Stock-specific intent classification and answer assembly.
//
// Mirrors the precision principle used for conceptual questions (a facet
// request gets only that facet, not the whole topic): "what is Apple's P/E"
// gets P/E only; "analyze Apple" gets the broad view. The company name
// resolves via TICKER_MAP; the facet resolves via the patterns below.
// ---------------------------------------------------------------------------
const STOCK_FACET_PATTERNS = [
  { facet:'rsi', kw:['rsi','ה rsi','מה ה rsi'] },
  { facet:'pe', kw:['p/e','pe ratio','price to earnings','מכפיל רווח','מכפיל הרווח'] },
  { facet:'change', kw:['last month','past month','last week','over the past','how has it changed','how did it change','חודש האחרון','שבוע האחרון','השתנתה ב','השתנה ב','שינוי ב'] },
  { facet:'trend', kw:['trend','uptrend','downtrend','in an uptrend','מגמה','מגמת עלייה','מגמת ירידה','במגמת עלייה','במגמת ירידה'] },
  { facet:'risks', kw:['risk','risks','main risks','key risks','drawback','drawbacks','disadvantage','disadvantages','downside','downsides','סיכון','סיכונים','הסיכונים','חיסרון','חסרונות','החסרונות'] },
  { facet:'technical', kw:['technical','technical analysis','technical status','טכני','המצב הטכני','ניתוח טכני'] },
  { facet:'fundamental', kw:['fundamental','fundamental analysis','fundamentals','פונדמנטלי','פונדומנטלי','המצב הפונדמנטלי','ניתוח פונדמנטלי','ניתוח פונדומנטלי'] },
  { facet:'full', kw:['analyze','analysis of','give me an analysis','תנתח','נתח לי','תן לי ניתוח','ניתוח מלא','נתח את'] },
  { facet:'price', kw:['price','current price','what is the price','stock price','המחיר','מה המחיר','כמה עולה','שווי המניה'] },
];
function classifyStockIntent(norm){
  for(const p of STOCK_FACET_PATTERNS){
    if(p.kw.some(k => norm.includes(normalizeText(k)))) return p.facet;
  }
  return 'snapshot'; // ticker recognized but no specific facet phrase — a light default, not the full report
}

// ---------------------------------------------------------------------------
// Freshness phrasing. Never implies real-time; always names the actual
// as-of date, per the "don't say 'now' unless it truly is" requirement.
// ---------------------------------------------------------------------------
function asOfLine(data, he){
  return he
    ? `נכון לסגירת המסחר בתאריך ${data.asOf} (${data.source}, לא בזמן אמת).`
    : `As of the close on ${data.asOf} (${data.source}, not real-time).`;
}
function fmtNum(n, digits){
  if(n == null || isNaN(n)) return null;
  return n.toFixed(digits != null ? digits : 2);
}
function fmtPct(n){
  if(n == null || isNaN(n)) return null;
  const sign = n > 0 ? '+' : '';
  return sign + n.toFixed(2) + '%';
}

function formatPrice(data, name, he){
  const dir = data.change >= 0 ? (he?'עלייה':'up') : (he?'ירידה':'down');
  return he
    ? `${name.he}: $${fmtNum(data.price)}. ${dir} של ${fmtNum(Math.abs(data.change))} (${fmtPct(data.changePct)}) מהסגירה הקודמת. ${asOfLine(data, true)}`
    : `${name.en}: $${fmtNum(data.price)}. ${dir} ${fmtNum(Math.abs(data.change))} (${fmtPct(data.changePct)}) from the previous close. ${asOfLine(data, false)}`;
}

function formatRSI(data, name, he){
  if(data.rsi14 == null) return he ? 'אין מספיק היסטוריה כדי לחשב RSI כרגע.' : 'Not enough history to compute RSI right now.';
  const r = data.rsi14;
  const read = r >= 70 ? (he?'נחשב "קניית יתר" (Overbought)':'considered "overbought"')
             : r <= 30 ? (he?'נחשב "מכירת יתר" (Oversold)':'considered "oversold"')
             : (he?'נמצא בטווח ניטרלי':'sits in a neutral range');
  return he
    ? `ה-RSI (14 ימים) של ${name.he} עומד על ${fmtNum(r,1)}, ${read}. ${asOfLine(data, true)}`
    : `The 14-day RSI for ${name.en} is ${fmtNum(r,1)}, which ${read}. ${asOfLine(data, false)}`;
}

function formatPE(data, name, he){
  const fd = data.fundamentals;
  const pe = fd && (fd.pe_ratio || fd.trailing_pe || (fd.valuations_metrics && fd.valuations_metrics.trailing_pe));
  if(pe == null){
    return he
      ? `אין לי כרגע נתון P/E זמין עבור ${name.he} — נתונים פונדמנטליים (P/E, שווי שוק, הכנסות) דורשים מסלול תשלום מול מקור הנתונים שלא נרכש כאן, זו לא רק שאלה של הגדרה. יש לי מחיר, ממוצעים נעים, RSI ומגמה מהנתונים הזמינים, אם זה יעזור.`
      : `I don't have a P/E figure available for ${name.en} right now — fundamental data (P/E, market cap, revenue) sits behind a paid tier of the data provider that isn't purchased here, not just a missing setting. I do have price, moving averages, RSI, and trend from the data that is available, if that helps.`;
  }
  return he
    ? `מכפיל הרווח (P/E) של ${name.he} הוא ${fmtNum(pe,1)}. ${asOfLine(data, true)}`
    : `The P/E ratio for ${name.en} is ${fmtNum(pe,1)}. ${asOfLine(data, false)}`;
}

function formatFundamental(data, name, he){
  const fd = data.fundamentals;
  if(!fd){
    return he
      ? `אין לי כרגע נתונים פונדמנטליים (P/E, שווי שוק, הכנסות וכו') עבור ${name.he} — הנתונים האלה דורשים מסלול תשלום מול מקור הנתונים, לא רק הגדרה שאפשר להפעיל. אני כן יכול לתת לך תמונה טכנית אמיתית (מחיר, ממוצעים נעים, RSI, מגמה) אם זה מעניין.`
      : `I don't have fundamental data (P/E, market cap, revenue, etc.) for ${name.en} right now — that data sits behind a paid tier of the data provider, not something that can just be turned on. I can give you a real technical picture instead (price, moving averages, RSI, trend) if that's useful.`;
  }
  // Best-effort field extraction; Twelve Data's /statistics shape varies by plan.
  const vm = fd.valuations_metrics || {};
  const parts = [];
  if(vm.trailing_pe != null) parts.push(he?`P/E: ${fmtNum(vm.trailing_pe,1)}`:`P/E: ${fmtNum(vm.trailing_pe,1)}`);
  if(vm.market_capitalization != null) parts.push(he?`שווי שוק: ${vm.market_capitalization}`:`Market cap: ${vm.market_capitalization}`);
  if(!parts.length) return he ? `קיבלתי נתונים פונדמנטליים חלקיים בלבד עבור ${name.he}, לא מספיק כדי להציג תמונה מלאה.` : `I only got partial fundamental data for ${name.en} — not enough for a full picture.`;
  return (he?`נתונים פונדמנטליים עבור ${name.he}: `:`Fundamental data for ${name.en}: `) + parts.join(he?', ':', ') + '. ' + asOfLine(data, he);
}

function formatTechnical(data, name, he){
  const trend = describeTrend(data.history.map(r=>r.close), he);
  const rsiLine = data.rsi14 != null ? (he?`RSI (14): ${fmtNum(data.rsi14,1)}.`:`RSI (14): ${fmtNum(data.rsi14,1)}.`) : '';
  const smaLine = he
    ? `ממוצע 50: ${fmtNum(data.sma50)}, ממוצע 200: ${data.sma200!=null?fmtNum(data.sma200):'אין מספיק היסטוריה'}.`
    : `SMA 50: ${fmtNum(data.sma50)}, SMA 200: ${data.sma200!=null?fmtNum(data.sma200):'not enough history'}.`;
  const volLine = data.volatility20 != null ? (he?`תנודתיות שנתית (20 יום): כ-${fmtNum(data.volatility20,0)}%.`:`Annualized volatility (20-day): ~${fmtNum(data.volatility20,0)}%.`) : '';
  const macdLine = data.macd && data.macd.macd != null ? (he?`MACD: ${fmtNum(data.macd.macd,2)}${data.macd.histogram!=null?` (היסטוגרמה ${data.macd.histogram>0?'חיובית':'שלילית'})`:''}.`:`MACD: ${fmtNum(data.macd.macd,2)}${data.macd.histogram!=null?` (histogram ${data.macd.histogram>0?'positive':'negative'})`:''}.`) : '';
  return [
    he ? `מצב טכני — ${name.he} (מחיר: $${fmtNum(data.price)}):` : `Technical status — ${name.en} (price: $${fmtNum(data.price)}):`,
    trend, smaLine, rsiLine, macdLine, volLine
  ].filter(Boolean).join(' ') + ' ' + asOfLine(data, he);
}

function formatTrend(data, name, he){
  const trend = describeTrend(data.history.map(r=>r.close), he);
  return (he?`מגמת ${name.he}: `:`Trend for ${name.en}: `) + trend + ' ' + asOfLine(data, he);
}

function formatChange(data, name, he){
  if(data.monthChangePct == null){
    return he ? `אין לי מספיק היסטוריה כדי לחשב שינוי לאורך חודש עבור ${name.he}.` : `I don't have enough history to compute a one-month change for ${name.en}.`;
  }
  return he
    ? `${name.he} השתנתה ב-${fmtPct(data.monthChangePct)} בערך ב-21 ימי המסחר האחרונים (כחודש). ${asOfLine(data, true)}`
    : `${name.en} has moved ${fmtPct(data.monthChangePct)} over roughly the last 21 trading days (about a month). ${asOfLine(data, false)}`;
}

function formatRisks(data, name, he){
  const volNote = data.volatility20 != null
    ? (he
       ? `מבחינת נתונים: התנודתיות השנתית (20 יום) של ${name.he} היא כ-${fmtNum(data.volatility20,0)}%, ${data.volatility20>40?'שנחשבת גבוהה יחסית':'שנחשבת בטווח סביר'}.`
       : `From the data: ${name.en}'s annualized 20-day volatility is about ${fmtNum(data.volatility20,0)}%, ${data.volatility20>40?'on the higher side':'in a fairly typical range'}.`)
    : '';
  const generic = he
    ? `מעבר לנתונים: הסיכונים הכלליים ששווה לבדוק לכל חברה כוללים תלות בלקוח/מוצר יחיד, רמת חוב ביחס לענף, שחיקת שולי רווח, ותחרות — אין לי נתוני חוב או רווחיות ל${name.he} כרגע כדי לקבוע את אלה במפורש.`
    : `Beyond the numbers: general risks worth checking for any company include dependence on a single customer or product, debt levels relative to the industry, eroding margins, and competition — I don't have debt or profitability data for ${name.en} right now to speak to those specifically.`;
  // Every other facet formatter ends with asOfLine() — the as-of date AND,
  // critically, the Demo Mode label when applicable. This one didn't, so a
  // demo-derived volatility number could be shown with no indication it
  // wasn't real. Only append it when there's actually a data-derived
  // number in the answer (volNote) — the fully-generic fallback (no
  // volatility data at all) has no data point to attribute, so a
  // provenance line there would be a non sequitur, not a safety net.
  const dateLine = data.volatility20 != null ? asOfLine(data, he) : '';
  return [volNote, generic, dateLine].filter(Boolean).join(' ');
}

function formatSnapshot(data, name, he){
  const dir = data.change >= 0 ? (he?'עלייה':'up') : (he?'ירידה':'down');
  const trendShort = data.sma50 != null ? (data.price > data.sma50 ? (he?'מעל ממוצע 50 יום':'above its 50-day average') : (he?'מתחת לממוצע 50 יום':'below its 50-day average')) : '';
  return he
    ? `${name.he}: $${fmtNum(data.price)} (${dir} של ${fmtPct(data.changePct)} מהסגירה הקודמת)${trendShort?', '+trendShort:''}. ${asOfLine(data, true)}`
    : `${name.en}: $${fmtNum(data.price)} (${dir} ${fmtPct(data.changePct)} from the previous close)${trendShort?', '+trendShort:''}. ${asOfLine(data, false)}`;
}

function formatFull(data, name, he){
  return [
    formatSnapshot(data, name, he),
    formatTechnical(data, name, he),
    formatFundamental(data, name, he)
  ].join('\n\n');
}

const STOCK_FACET_FORMATTERS = {
  price: formatPrice, rsi: formatRSI, pe: formatPE, fundamental: formatFundamental,
  technical: formatTechnical, trend: formatTrend, change: formatChange,
  risks: formatRisks, full: formatFull, snapshot: formatSnapshot
};

// ---------------------------------------------------------------------------
// Top-level: try to answer a stock-data question. Returns null if no ticker
// was recognized (so normal KB flow continues untouched); otherwise always
// returns a real answer or an honest, specific failure message — never a
// guessed number.
// ---------------------------------------------------------------------------
// Fast path only: static curated list, no network call. Used early in the
// pipeline so a clearly-recognized company wins immediately.
//
// `conversationContext` is optional everywhere in this file — every
// existing call site that doesn't pass one gets exactly the old behavior
// (no entity memory, resolves fresh from the message every time).
async function tryStockDataAnswerStatic(norm, langCode, conversationContext){
  const company = resolveTicker(norm);
  if(!company) return null;
  return answerForCompany(company, norm, langCode, conversationContext);
}

// Full path including the dynamic symbol_search fallback (costs an extra
// network call), used only as a last resort after normal topic matching and
// every other fallback has already failed to find anything — see the call
// site in generateAiReply for why.
async function tryStockDataAnswerDynamic(norm, langCode, rawText, conversationContext){
  const company = await resolveTickerDynamic(rawText);
  if(!company) return null;
  if(company.ambiguous) return answerAmbiguousCompany(company.candidates, langCode);
  return answerForCompany(company, norm, langCode, conversationContext);
}

// Low-confidence resolution: several real, different companies matched
// about equally well and nothing disambiguated between them. A short
// clarification question is safer than confidently answering about the
// wrong one — this never fabricates a pick. `clarificationCandidates`
// lets the UI offer tappable choices instead of making the user re-type
// the company name with more detail.
function answerAmbiguousCompany(candidates, langCode){
  const he = langCode === 'he';
  const names = candidates.map(c => `${c.instrument_name} (${c.symbol})`);
  const text = he
    ? `לא הייתי בטוח לאיזו חברה בדיוק התכוונת — מצאתי כמה התאמות: ${names.join(', ')}. איזו מהן?`
    : `I wasn't sure exactly which company you meant — I found a few matches: ${names.join(', ')}. Which one?`;
  return {
    text, topicId: 'how-to-analyze', relatedIds: [],
    clarificationCandidates: candidates.map(c => ({
      label: `${c.instrument_name} (${c.symbol})`,
      // The ticker itself is an unambiguous exact-match query — see
      // searchAndRankSymbol's exactTickerHit path — so tapping a candidate
      // is guaranteed to resolve to THAT one, not risk re-triggering the
      // same ambiguity.
      query: `${c.instrument_name} ${c.symbol}`
    }))
  };
}

// Entity comparison ("who is more profitable, A or B") — only reachable
// when the message names no company at all but two are already in context.
// Checked before the pronoun-reference fallback below: "who is more
// profitable" would otherwise also loosely match nothing and fall through.
async function tryEntityComparisonAnswer(norm, langCode, conversationContext){
  if(!conversationContext) return null;
  if(!looksLikeEntityComparison(norm)) return null;
  const a = conversationContext.activeEntity, b = conversationContext.previousEntity;
  if(a && b && a.ticker !== b.ticker){
    touchEntityContext(conversationContext);
    return answerEntityComparison(a, b, langCode);
  }
  // Looks like a comparison question, but there isn't a second company to
  // compare against yet — asking which one is safer than silently falling
  // through to the generic "I don't have a good answer for that" fallback,
  // which answered NOTHING about the comparison the user clearly asked
  // for. Only fires when the message actually reads as a comparison in
  // the first place (looksLikeEntityComparison above), so an ordinary
  // unrelated question is never turned into this prompt.
  const he = langCode === 'he';
  if(a){
    const text = he
      ? `מי יותר מה, בהשוואה למי? ${a.name.he} מול איזו חברה?`
      : `More what, compared to which company? ${a.name.en} vs which one?`;
    return { text, topicId: 'how-to-analyze', relatedIds: [] };
  }
  const text = he
    ? `אשמח להשוות — אילו שתי חברות בדיוק?`
    : `Happy to compare — which two companies did you mean?`;
  return { text, topicId: 'how-to-analyze', relatedIds: [] };
}

// Pronoun-reference fallback ("מה ה-P/E שלה?", "זה גבוה?") — only reachable
// when the message names no company at all but one is already active.
// Shared by tryPronounEntityAnswer and answerForCompany so the "what facet
// does this message actually resolve to" logic exists in exactly one
// place — computing it twice (and possibly letting the two copies drift)
// is exactly the kind of duplication that caused bugs elsewhere in this
// project.
function resolveEffectiveStockIntent(norm, conversationContext){
  let intent = classifyStockIntent(norm);
  // "זה גבוה?" (is THAT high?) names no metric at all — it only makes sense
  // relative to whatever metric was just discussed for this entity. Without
  // this, classifyStockIntent() has nothing to match and falls back to the
  // generic 'snapshot' facet, silently ignoring what was actually asked.
  if(conversationContext && conversationContext.activeMetric && looksLikeMetricImplicitReference(norm)){
    intent = conversationContext.activeMetric;
  }
  return intent;
}

async function tryPronounEntityAnswer(norm, langCode, conversationContext){
  if(!conversationContext || !conversationContext.activeEntity) return null;
  if(!looksLikeEntityPronounReference(norm)) return null;
  // The pronoun matched, but that only means the message refers back to
  // the active entity — it doesn't mean the message names a specific
  // facet this layer recognizes. Two different situations land here, and
  // they need different handling:
  //   - A message that SOUNDS specific but isn't recognized (e.g. "מה
  //     החסרונות שלה?" before 'risks' learned "drawbacks" as a synonym)
  //     — answering with a single wrong specific guess (a bare price
  //     snapshot) is actively misleading, worse than not answering.
  //   - A genuinely GENERIC "tell me more / help me understand it"
  //     follow-up (e.g. "what info can you give me about its condition
  //     and nature?") — here the bare default facet ('snapshot') is too
  //     narrow, but so is bailing out entirely: that fell through to
  //     normal KB scoring, which matched a totally generic "what is a
  //     stock" definition and threw away the active company entirely —
  //     confirmed as a real reported bug, not a hypothetical.
  // Since there's no reliable way to tell these apart from keywords alone,
  // and the downside of 'full' (a broad, multi-facet, genuinely on-topic
  // answer) being "not laser-focused" is far smaller than either a wrong
  // narrow guess or losing the entity entirely, unresolved pronoun
  // follow-ups get the comprehensive facet instead of a snapshot or a
  // fall-through.
  const intent = resolveEffectiveStockIntent(norm, conversationContext);
  return answerForCompany(conversationContext.activeEntity, norm, langCode, conversationContext, intent === 'snapshot' ? 'full' : null);
}

async function answerForCompany(company, norm, langCode, conversationContext, forcedIntent){
  const he = langCode === 'he';
  const intent = forcedIntent || resolveEffectiveStockIntent(norm, conversationContext);

  let result;
  try{
    result = await getMarketData(company.ticker);
  }catch(e){
    result = { ok:false, reason:'exception' };
  }

  if(!result.ok){
    if(result.reason === 'no_api_key'){
      const text = he
        ? `כדי לענות עם נתוני שוק אמיתיים על ${company.name.he} אני צריך מפתח API חינמי (Twelve Data) שעדיין לא הוגדר באתר הזה. זה לוקח כמה דקות: הרשמה חינמית ב-twelvedata.com/register (בלי כרטיס אשראי), והדבקת המפתח בקובץ. בלי זה, אני יכול לענות רק על שאלות כלליות על מושגים בשוק ההון.`
        : `To answer with real market data for ${company.name.en} I need a free Twelve Data API key that isn't configured on this site yet. It takes a couple of minutes: free signup at twelvedata.com/register (no credit card), then paste the key into the site's code. Without it, I can only answer general questions about market concepts.`;
      return { text, topicId: 'how-to-analyze', relatedIds: [] };
    }
    const text = he
      ? `ניסיתי לשלוף נתוני שוק אמיתיים עבור ${company.name.he} ולא הצלחתי כרגע (ייתכן חסימת רשת, מכסת בקשות יומית שנוצלה, או שהשירות זמנית לא זמין). אני מעדיף להגיד את זה במפורש מאשר לנחש מספרים. אפשר לנסות שוב בעוד רגע, או לשאול אותי שאלה כללית על המושג במקום.`
      : `I tried to fetch real market data for ${company.name.en} and couldn't get it right now (possibly a network block, the daily request quota being used up, or a temporary outage on the data source). I'd rather say that plainly than guess numbers. Try again in a moment, or ask me a general question about the concept instead.`;
    return { text, topicId: 'how-to-analyze', relatedIds: [] };
  }

  if(conversationContext){
    recordActiveEntity(conversationContext, company);
    recordActiveMetric(conversationContext, intent);
  }

  const formatter = STOCK_FACET_FORMATTERS[intent] || formatSnapshot;
  const text = formatter(result.data, company.name, he);
  return {
    text,
    topicId: 'stock-data',
    relatedIds: [],
    stockCard: { ticker: company.ticker, exchange: company.exchange, name: company.name, price: result.data.price, changePct: result.data.changePct, asOf: result.data.asOf },
    entityContext: { ticker: company.ticker, facet: intent }
  };
}

// ---------------------------------------------------------------------------
// Two-entity comparison. Uses only what's actually, reliably available from
// both fetches — never invents a "winner" on a dimension neither result
// has data for. Profitability specifically (the example in the product
// brief) needs fundamentals data that the free tier doesn't always return;
// when it's missing for either side, this says so plainly and compares
// what it does have (price trend, volatility) instead of guessing.
// ---------------------------------------------------------------------------
async function answerEntityComparison(entityA, entityB, langCode){
  const he = langCode === 'he';
  let dataA, dataB;
  try{
    [dataA, dataB] = await Promise.all([getMarketData(entityA.ticker), getMarketData(entityB.ticker)]);
  }catch(e){
    dataA = { ok:false }; dataB = { ok:false };
  }
  if(!dataA.ok || !dataB.ok){
    const missing = !dataA.ok && !dataB.ok ? `${entityA.name[langCode]} ${he?'וגם':'and'} ${entityB.name[langCode]}` : (!dataA.ok ? entityA.name[langCode] : entityB.name[langCode]);
    const text = he
      ? `רציתי להשוות בין ${entityA.name.he} ל-${entityB.name.he}, אבל לא הצלחתי לשלוף נתונים עבור ${missing} כרגע. אפשר לנסות שוב בעוד רגע.`
      : `I wanted to compare ${entityA.name.en} and ${entityB.name.en}, but couldn't fetch data for ${missing} right now. Try again in a moment.`;
    return { text, topicId: 'how-to-analyze', relatedIds: [] };
  }

  const a = dataA.data, b = dataB.data;
  const peA = a.fundamentals && a.fundamentals.valuations_metrics && a.fundamentals.valuations_metrics.trailing_pe;
  const peB = b.fundamentals && b.fundamentals.valuations_metrics && b.fundamentals.valuations_metrics.trailing_pe;

  const lines = [];
  lines.push(he
    ? `השוואה בין ${entityA.name.he} ל-${entityB.name.he}:`
    : `Comparing ${entityA.name.en} and ${entityB.name.en}:`);
  lines.push(he
    ? `מחיר: ${entityA.name.he} $${a.price.toFixed(2)} (${a.changePct>=0?'+':''}${a.changePct.toFixed(2)}%), ${entityB.name.he} $${b.price.toFixed(2)} (${b.changePct>=0?'+':''}${b.changePct.toFixed(2)}%).`
    : `Price: ${entityA.name.en} $${a.price.toFixed(2)} (${a.changePct>=0?'+':''}${a.changePct.toFixed(2)}%), ${entityB.name.en} $${b.price.toFixed(2)} (${b.changePct>=0?'+':''}${b.changePct.toFixed(2)}%).`);
  if(a.monthChangePct != null && b.monthChangePct != null){
    const diff = Math.abs(a.monthChangePct - b.monthChangePct);
    const better = diff < 0.05 ? null : (a.monthChangePct > b.monthChangePct ? entityA.name[langCode] : entityB.name[langCode]);
    lines.push(he
      ? `בחודש האחרון: ${entityA.name.he} ${a.monthChangePct>=0?'+':''}${a.monthChangePct.toFixed(1)}%, ${entityB.name.he} ${b.monthChangePct>=0?'+':''}${b.monthChangePct.toFixed(1)}%${better ? ` — ${better} עלתה יותר.` : ' — ביצועים דומים.'}`
      : `Over the last month: ${entityA.name.en} ${a.monthChangePct>=0?'+':''}${a.monthChangePct.toFixed(1)}%, ${entityB.name.en} ${b.monthChangePct>=0?'+':''}${b.monthChangePct.toFixed(1)}%${better ? ` — ${better} gained more.` : ' — roughly similar performance.'}`);
  }
  if(peA != null && peB != null){
    lines.push(he
      ? `מכפיל רווח (P/E): ${entityA.name.he} ${peA.toFixed(1)}, ${entityB.name.he} ${peB.toFixed(1)}.`
      : `P/E ratio: ${entityA.name.en} ${peA.toFixed(1)}, ${entityB.name.en} ${peB.toFixed(1)}.`);
  } else {
    // The honest gap: no fabricated "winner" on profitability/valuation
    // when the underlying fundamentals data isn't available for one or
    // both sides.
    lines.push(he
      ? `אין לי נתוני מכפיל רווח/רווחיות אמינים לשתי החברות כרגע כדי להשוות ביניהן על הבסיס הזה — יש לי רק נתוני מחיר ומגמה.`
      : `I don't have reliable P/E or profitability data for both companies right now to compare on that basis — only price and trend data.`);
  }
  lines.push(he ? asOfLine(a, true) : asOfLine(a, false));

  return {
    text: lines.join(' '),
    topicId: 'stock-data',
    relatedIds: [],
  };
}
