// ---------------------------------------------------------------------------
// Company/ticker recognition.
//
// Maps a name a user might actually type — English, Hebrew, phonetic Hebrew,
// or a common misspelling — to a stock ticker. This is intentionally a fixed
// table rather than a general fuzzy search: guessing a wrong ticker for a
// real financial question is worse than not recognizing it at all, so only
// names we're confident about are included.
//
// Longer aliases are checked before shorter ones by the resolver so "מיקרוסופט
// אופיס" (a product, not the stock) doesn't accidentally resolve — this table
// only lists the company-name forms.
// ---------------------------------------------------------------------------
const TICKER_MAP = [
  { ticker:'AAPL', exchange:'NASDAQ', name:{he:'אפל (Apple)', en:'Apple'},
    aliases:['apple','aapl','אפל','אפפל'] },
  { ticker:'NVDA', exchange:'NASDAQ', name:{he:'אנבידיה (NVIDIA)', en:'NVIDIA'},
    aliases:['nvidia','nvda','אנבידיה','אנווידיה','אנסידיה','נבידיה','אינבידיה','אנבדיה','נוידיה'] },
  { ticker:'TSLA', exchange:'NASDAQ', name:{he:'טסלה (Tesla)', en:'Tesla'},
    aliases:['tesla','tsla','טסלה','טסלא'] },
  { ticker:'MSFT', exchange:'NASDAQ', name:{he:'מיקרוסופט (Microsoft)', en:'Microsoft'},
    aliases:['microsoft','msft','מיקרוסופט','מיקרוסופ'] },
  { ticker:'AMZN', exchange:'NASDAQ', name:{he:'אמזון (Amazon)', en:'Amazon'},
    aliases:['amazon','amzn','אמזון','אמאזון'] },
  { ticker:'GOOGL', exchange:'NASDAQ', name:{he:'גוגל / אלפאבט (Google)', en:'Google (Alphabet)'},
    aliases:['google','alphabet','googl','goog','גוגל','אלפאבית','אלפבית'] },
  { ticker:'META', exchange:'NASDAQ', name:{he:'מטא (Meta / Facebook)', en:'Meta (Facebook)'},
    aliases:['meta','facebook','fb','מטא','פייסבוק','פייסבוקק'] },
  { ticker:'NFLX', exchange:'NASDAQ', name:{he:'נטפליקס (Netflix)', en:'Netflix'},
    aliases:['netflix','nflx','נטפליקס','נטפליקסס'] },
  { ticker:'PLTR', exchange:'NYSE', name:{he:'פלנטיר (Palantir)', en:'Palantir'},
    aliases:['palantir','pltr','פלנטיר','פלאנטיר'] },
  { ticker:'AMD', exchange:'NASDAQ', name:{he:'AMD', en:'AMD'},
    aliases:['amd','איי אם די','איי-אם-די'] },
  { ticker:'INTC', exchange:'NASDAQ', name:{he:'אינטל (Intel)', en:'Intel'},
    aliases:['intel','intc','אינטל'] },
  { ticker:'AVGO', exchange:'NASDAQ', name:{he:'ברודקום (Broadcom)', en:'Broadcom'},
    aliases:['broadcom','avgo','ברודקום'] },
  { ticker:'QCOM', exchange:'NASDAQ', name:{he:'קוואלקום (Qualcomm)', en:'Qualcomm'},
    aliases:['qualcomm','qcom','קוואלקום'] },
  { ticker:'CRM', exchange:'NYSE', name:{he:'סיילספורס (Salesforce)', en:'Salesforce'},
    aliases:['salesforce','crm','סיילספורס'] },
  { ticker:'ORCL', exchange:'NYSE', name:{he:'אורקל (Oracle)', en:'Oracle'},
    aliases:['oracle','orcl','אורקל'] },
  { ticker:'ADBE', exchange:'NASDAQ', name:{he:'אדובי (Adobe)', en:'Adobe'},
    aliases:['adobe','adbe','אדובי'] },
  { ticker:'IBM', exchange:'NYSE', name:{he:'IBM', en:'IBM'},
    aliases:['ibm','איי בי אם'] },
  { ticker:'UBER', exchange:'NYSE', name:{he:'אובר (Uber)', en:'Uber'},
    aliases:['uber','אובר'] },
  { ticker:'ABNB', exchange:'NASDAQ', name:{he:'אירבנב (Airbnb)', en:'Airbnb'},
    aliases:['airbnb','abnb','אירבנב','אייר בי אנד בי'] },
  { ticker:'SHOP', exchange:'NYSE', name:{he:'שופיפיי (Shopify)', en:'Shopify'},
    aliases:['shopify','shop','שופיפיי'] },
  { ticker:'PYPL', exchange:'NASDAQ', name:{he:'פייפאל (PayPal)', en:'PayPal'},
    aliases:['paypal','pypl','פייפאל','פייפל'] },
  { ticker:'SQ', exchange:'NYSE', name:{he:'בלוק / סקוור (Block)', en:'Block (Square)'},
    aliases:['block','square','סקוור','בלוק'] },
  { ticker:'HOOD', exchange:'NASDAQ', name:{he:'רובינהוד (Robinhood)', en:'Robinhood'},
    aliases:['robinhood','hood','רובינהוד','רובין הוד'] },
  { ticker:'COIN', exchange:'NASDAQ', name:{he:'קוינבייס (Coinbase)', en:'Coinbase'},
    aliases:['coinbase','coin','קוינבייס','קוינבס'] },
  { ticker:'SOFI', exchange:'NASDAQ', name:{he:'SoFi', en:'SoFi'},
    aliases:['sofi','סופיי','סופי'] },
  { ticker:'JPM', exchange:'NYSE', name:{he:'ג\'יי.פי מורגן (JPMorgan)', en:'JPMorgan Chase'},
    aliases:['jpmorgan','jpm','ג\'יי פי מורגן','גיי פי מורגן'] },
  { ticker:'BAC', exchange:'NYSE', name:{he:'בנק אוף אמריקה (Bank of America)', en:'Bank of America'},
    aliases:['bank of america','bac','בנק אוף אמריקה'] },
  { ticker:'GS', exchange:'NYSE', name:{he:'גולדמן זאקס (Goldman Sachs)', en:'Goldman Sachs'},
    aliases:['goldman sachs','goldman','gs','גולדמן זאקס','גולדמן סאקס'] },
  { ticker:'V', exchange:'NYSE', name:{he:'ויזה (Visa)', en:'Visa'},
    aliases:['visa','ויזה'] },
  { ticker:'MA', exchange:'NYSE', name:{he:'מאסטרקארד (Mastercard)', en:'Mastercard'},
    aliases:['mastercard','מאסטרקארד','מאסטרקרד'] },
  { ticker:'DIS', exchange:'NYSE', name:{he:'דיסני (Disney)', en:'Disney'},
    aliases:['disney','dis','דיסני'] },
  { ticker:'WMT', exchange:'NYSE', name:{he:'וולמארט (Walmart)', en:'Walmart'},
    aliases:['walmart','wmt','וולמארט','וולמרט'] },
  { ticker:'COST', exchange:'NASDAQ', name:{he:'קוסטקו (Costco)', en:'Costco'},
    aliases:['costco','cost','קוסטקו'] },
  { ticker:'TGT', exchange:'NYSE', name:{he:'טארגט (Target)', en:'Target'},
    aliases:['target','tgt','טארגט','טרגט'] },
  { ticker:'KO', exchange:'NYSE', name:{he:'קוקה קולה (Coca-Cola)', en:'Coca-Cola'},
    aliases:['coca cola','coca-cola','coke','קוקה קולה'] },
  { ticker:'PEP', exchange:'NASDAQ', name:{he:'פפסיקו (PepsiCo)', en:'PepsiCo'},
    aliases:['pepsi','pepsico','פפסי','פפסיקו'] },
  { ticker:'MCD', exchange:'NYSE', name:{he:'מקדונלד\'ס (McDonald\'s)', en:'McDonald\'s'},
    aliases:['mcdonalds','mcdonald\'s','מקדונלדס','מקדונלד\'ס'] },
  { ticker:'SBUX', exchange:'NASDAQ', name:{he:'סטארבקס (Starbucks)', en:'Starbucks'},
    aliases:['starbucks','sbux','סטארבקס'] },
  { ticker:'NKE', exchange:'NYSE', name:{he:'נייקי (Nike)', en:'Nike'},
    aliases:['nike','nke','נייקי'] },
  { ticker:'BA', exchange:'NYSE', name:{he:'בואינג (Boeing)', en:'Boeing'},
    aliases:['boeing','ba','בואינג'] },
  { ticker:'F', exchange:'NYSE', name:{he:'פורד (Ford)', en:'Ford'},
    aliases:['ford','פורד'] },
  { ticker:'GM', exchange:'NYSE', name:{he:'ג\'נרל מוטורס (GM)', en:'General Motors'},
    aliases:['general motors','gm','ג\'נרל מוטורס'] },
  { ticker:'RIVN', exchange:'NASDAQ', name:{he:'ריביאן (Rivian)', en:'Rivian'},
    aliases:['rivian','rivn','ריביאן'] },
  { ticker:'LCID', exchange:'NASDAQ', name:{he:'לוסיד (Lucid)', en:'Lucid'},
    aliases:['lucid','lcid','לוסיד'] },
  { ticker:'BABA', exchange:'NYSE', name:{he:'עלי בבא (Alibaba)', en:'Alibaba'},
    aliases:['alibaba','baba','עלי באבא','עלי בבא'] },
  { ticker:'PDD', exchange:'NASDAQ', name:{he:'פינדואודו (PDD / Temu)', en:'PDD Holdings (Temu)'},
    aliases:['pdd','temu','טמו','פינדואודו'] },
  { ticker:'SPOT', exchange:'NYSE', name:{he:'ספוטיפיי (Spotify)', en:'Spotify'},
    aliases:['spotify','spot','ספוטיפיי','ספוטיפי'] },
  { ticker:'SNAP', exchange:'NYSE', name:{he:'סנאפצ\'אט (Snap)', en:'Snap (Snapchat)'},
    aliases:['snapchat','snap','סנאפצ\'אט','סנאפ'] },
  { ticker:'PINS', exchange:'NYSE', name:{he:'פינטרסט (Pinterest)', en:'Pinterest'},
    aliases:['pinterest','pins','פינטרסט'] },
  { ticker:'RBLX', exchange:'NYSE', name:{he:'רובלוקס (Roblox)', en:'Roblox'},
    aliases:['roblox','rblx','רובלוקס'] },
  { ticker:'U', exchange:'NYSE', name:{he:'יוניטי (Unity)', en:'Unity'},
    aliases:['unity software','unity','יוניטי'] },
  { ticker:'EA', exchange:'NASDAQ', name:{he:'אלקטרוניק ארטס (EA)', en:'Electronic Arts'},
    aliases:['electronic arts','ea','אלקטרוניק ארטס'] },
  { ticker:'TTWO', exchange:'NASDAQ', name:{he:'טייק-טו (Take-Two)', en:'Take-Two Interactive'},
    aliases:['take two','take-two','ttwo','טייק טו'] },
  { ticker:'XOM', exchange:'NYSE', name:{he:'אקסון מובil (ExxonMobil)', en:'ExxonMobil'},
    aliases:['exxon','exxonmobil','xom','אקסון'] },
  { ticker:'CVX', exchange:'NYSE', name:{he:'שברון (Chevron)', en:'Chevron'},
    aliases:['chevron','cvx','שברון'] },
  { ticker:'PFE', exchange:'NYSE', name:{he:'פייזר (Pfizer)', en:'Pfizer'},
    aliases:['pfizer','pfe','פייזר'] },
  { ticker:'JNJ', exchange:'NYSE', name:{he:'ג\'ונסון אנד ג\'ונסון (J&J)', en:'Johnson & Johnson'},
    aliases:['johnson & johnson','johnson and johnson','jnj','גונסון אנד גונסון'] },
  { ticker:'MRNA', exchange:'NASDAQ', name:{he:'מודרנה (Moderna)', en:'Moderna'},
    aliases:['moderna','mrna','מודרנה'] },
  { ticker:'LLY', exchange:'NYSE', name:{he:'אלי לילי (Eli Lilly)', en:'Eli Lilly'},
    aliases:['eli lilly','lly','אלי לילי'] },
  { ticker:'UNH', exchange:'NYSE', name:{he:'יונייטד הלת\' (UnitedHealth)', en:'UnitedHealth'},
    aliases:['unitedhealth','unh','יונייטד הלת\''] },
  { ticker:'T', exchange:'NYSE', name:{he:'AT&T', en:'AT&T'},
    aliases:['at&t','att','איי טי אנד טי'] },
  { ticker:'VZ', exchange:'NYSE', name:{he:'ורייזון (Verizon)', en:'Verizon'},
    aliases:['verizon','vz','ורייזון'] },
  { ticker:'SMCI', exchange:'NASDAQ', name:{he:'סופר מיקרו (Super Micro)', en:'Super Micro Computer'},
    aliases:['super micro','smci','סופר מיקרו'] },
  { ticker:'MU', exchange:'NASDAQ', name:{he:'מיקרון (Micron)', en:'Micron'},
    aliases:['micron','mu','מיקרון'] },
  { ticker:'ARM', exchange:'NASDAQ', name:{he:'ARM Holdings', en:'ARM Holdings'},
    aliases:['arm holdings','arm','ארם'] },
  { ticker:'SNOW', exchange:'NYSE', name:{he:'סנואופלייק (Snowflake)', en:'Snowflake'},
    aliases:['snowflake','snow','סנואופלייק'] },
  { ticker:'NOW', exchange:'NYSE', name:{he:'סרביסנאו (ServiceNow)', en:'ServiceNow'},
    aliases:['servicenow','סרביסנאו'] },
  { ticker:'PANW', exchange:'NASDAQ', name:{he:'פאלו אלטו נטוורקס (Palo Alto)', en:'Palo Alto Networks'},
    aliases:['palo alto networks','palo alto','panw','פאלו אלטו'] },
  { ticker:'CRWD', exchange:'NASDAQ', name:{he:'קראודסטרייק (CrowdStrike)', en:'CrowdStrike'},
    aliases:['crowdstrike','crwd','קראודסטרייק'] },
  { ticker:'DDOG', exchange:'NASDAQ', name:{he:'דאטאדוג (Datadog)', en:'Datadog'},
    aliases:['datadog','ddog','דאטאדוג'] },
  { ticker:'GME', exchange:'NYSE', name:{he:'גיימסטופ (GameStop)', en:'GameStop'},
    aliases:['gamestop','gme','גיימסטופ'] },
  { ticker:'AMC', exchange:'NYSE', name:{he:'AMC', en:'AMC Entertainment'},
    aliases:['amc entertainment','amc','איי אם סי'] },
];

// ---------------------------------------------------------------------------
// Dynamic fallback: when the curated list above doesn't recognize a company,
// try to pull a candidate name out of the message and look it up via Twelve
// Data's symbol_search endpoint. This is what makes the assistant work for
// "any" company rather than only the ~70 curated ones — the curated list
// stays as the instant, no-extra-request path for the companies people ask
// about constantly (with good Hebrew phonetic coverage); this is the
// safety net for everything else.
// ---------------------------------------------------------------------------

// Jargon that might appear in Latin script inside an otherwise-Hebrew
// question and must never be mistaken for a company name candidate.
const LATIN_CANDIDATE_STOPWORDS = new Set(['pe','p e','roe','roa','roic','rsi','macd','sma','ema','etf','ipo','eps','peg','ma','dca','gdp','cpi','fed','tp','sl','ytm','ohlc']);

function extractLatinCandidate(rawText){
  const matches = rawText.match(/[A-Za-z][A-Za-z&.'-]*(?:\s+[A-Za-z][A-Za-z&.'-]*){0,3}/g);
  if(!matches) return null;
  const candidates = matches
    .map(m => m.trim())
    .filter(m => m.length >= 2 && !LATIN_CANDIDATE_STOPWORDS.has(m.toLowerCase()));
  if(!candidates.length) return null;
  // Prefer the longest candidate — more likely to be a real company name
  // than a short incidental English word sitting in the sentence.
  candidates.sort((a,b) => b.length - a.length);
  return candidates[0];
}

const HEBREW_COMPANY_TRIGGERS = [
  'מניית','מניה של','חברת','חברה בשם','כמה עולה','מה המחיר של','מה המצב של',
  'תנתח לי את','תנתח את','נתח לי את','מה המגמה של','מה הסיכונים של','מה ה-p/e של','מה הפי-אי של'
];
// A curated list of common filler/question words to strip before treating
// whatever remains as a candidate company name. This exists because trying
// to anticipate every possible way someone phrases "tell me about X" as its
// own trigger phrase above is a losing game — "תן לי מידע על X" or "ספר לי
// על X" have no company-specific trigger word in them at all, so the
// specific-trigger extractor above never fires for them. This is the more
// general fallback: strip the filler, keep whatever's left.
const HEBREW_FILLER_WORDS = new Set([
  'תן','תני','תנו','לי','לו','לה','להם','לנו','אתה','את','אני','אנחנו','מה','זה','זו','אלו','של','על','עם','גם','או','אם',
  'כדאי','אפשר','בבקשה','נא','מידע','פרטים','נתונים','סקירה','ניתוח','מצב','ספר','תספר','ספרי',
  'מניה','מניית','חברה','חברת','המניה','החברה','כמה','עולה','עולה','קורה','נראה','נראית','איך',
  'מחיר','מחירה','שווה','לגבי','בקשר','בנוגע','בו','בה','הוא','היא','יש','אין'
]);
function extractHebrewCandidate(rawText){
  for(const trigger of HEBREW_COMPANY_TRIGGERS){
    const idx = rawText.indexOf(trigger);
    if(idx === -1) continue;
    let tail = rawText.slice(idx + trigger.length).trim();
    tail = tail.replace(/^(מניית|מניה של|חברת)\s+/,'').replace(/[?？!.,]+$/,'').trim();
    if(tail.length >= 2 && /[\u0590-\u05FF]/.test(tail)) return tail;
  }
  // General fallback: no specific trigger phrase matched, so strip common
  // filler words (and a single attached ה/ב/ל/מ/ו/כ/ש prefix from what's
  // left) and use whatever Hebrew content remains.
  const words = rawText.replace(/[?？!.,]/g, ' ').split(/\s+/).filter(Boolean);
  const kept = words.filter(w => {
    if(!/[\u0590-\u05FF]/.test(w)) return true; // keep any Latin text too
    // The stripped form is used ONLY to decide whether this word is a
    // prefixed filler ("והמניה" = "and the stock"), never to alter the
    // word actually kept — blindly stripping a leading letter from every
    // surviving word corrupted real company names that legitimately start
    // with one of these letters (e.g. "מובילאיי"/Mobileye lost its מ).
    const stripped = w.replace(/^[הבלמוכש](?=.{2,})/, '');
    return !HEBREW_FILLER_WORDS.has(w) && !HEBREW_FILLER_WORDS.has(stripped);
  });
  const fallback = kept.join(' ').trim();
  return fallback.length >= 2 ? fallback : null;
}

// Best-effort Hebrew→Latin transliteration for a phonetically-spelled
// company name (e.g. "סאן דיסק" -> "san disk", "וויקס" -> "viks"). Twelve
// Data's symbol_search matches against English company names and tickers —
// it has no idea what to do with the literal Hebrew string, so without this
// step every Hebrew-only company mention was guaranteed to fail no matter
// how large the underlying database is. This can't be perfect (Hebrew
// doesn't mark vowels), so it returns a couple of plausible variants and
// the caller tries each; "וו" is handled as the standard digraph for a
// consonant V/W sound (Wix, Waze, ...) before the single-letter map runs,
// since otherwise it reads as two vowels and mangles the result.
const HEBREW_TO_LATIN_MAP = {
  'א':'a','ב':'b','ג':'g','ד':'d','ה':'h','ז':'z','ח':'h','ט':'t',
  'י':'i','כ':'k','ך':'k','ל':'l','מ':'m','ם':'m','נ':'n','ן':'n','ס':'s',
  'ע':'','פ':'p','ף':'p','צ':'tz','ץ':'tz','ק':'k','ר':'r','ש':'sh','ת':'t'
};
function transliterateHebrewToLatin(text){
  const withDigraphs = text.replace(/וו/g, '\u0001');
  const chars = withDigraphs.split('');
  const isFinal = i => i === chars.length - 1 || chars[i+1] === ' ';
  // Several Hebrew letters are genuinely ambiguous in undotted phonetic
  // spelling — the diacritic that would disambiguate them is essentially
  // never used when Israelis write a foreign brand name in Hebrew letters.
  //
  // Crucially, a single name often needs SEVERAL of these resolved at once:
  // "גאוזי" -> Gauzy needs vav='u' AND final-yod='y' simultaneously, and
  // "פייבר" -> Fiverr needs peh='f' AND bet='v'. Flipping one ambiguity at
  // a time (the previous approach) systematically missed exactly these
  // cases, so this builds the full combination set over whichever ambiguous
  // letters actually occur in the input. The axis count is small (<=5), and
  // the result is capped, so this stays a handful of candidates rather than
  // an unbounded explosion.
  const axes = [];
  if(text.includes('ו')) axes.push({ key:'vav', options:['o','u'] });
  if(/י(?=\s|$)/.test(text)) axes.push({ key:'finalYod', options:['i','y'] });
  if(/ה(?=\s|$)/.test(text)) axes.push({ key:'finalHeh', options:['','a'] });
  if(text.includes('פ') || text.includes('ף')) axes.push({ key:'peh', options:['p','f'] });
  if(text.includes('ב')) axes.push({ key:'bet', options:['b','v'] });

  function transliterateChar(ch, i, o){
    if(ch === '\u0001') return 'v';
    if(ch === 'ו') return o.vav !== undefined ? o.vav : 'o';
    if(ch === 'י' && isFinal(i)) return o.finalYod !== undefined ? o.finalYod : 'i';
    if(ch === 'ה' && isFinal(i)) return o.finalHeh !== undefined ? o.finalHeh : '';
    if(ch === 'פ' || ch === 'ף') return o.peh !== undefined ? o.peh : 'p';
    if(ch === 'ב') return o.bet !== undefined ? o.bet : 'b';
    if(ch === ' ') return ' ';
    return HEBREW_TO_LATIN_MAP[ch] !== undefined ? HEBREW_TO_LATIN_MAP[ch] : '';
  }
  // Cartesian product over the ambiguity axes present.
  let combos = [{}];
  for(const axis of axes){
    const next = [];
    for(const base of combos){
      for(const opt of axis.options){
        next.push(Object.assign({}, base, { [axis.key]: opt }));
      }
    }
    combos = next;
  }
  const variants = combos.map(o => chars.map((ch,i) => transliterateChar(ch,i,o)).join(''));
  // Cap the number of lookups actually attempted so a long name with many
  // ambiguous letters can't fire a large burst of API requests.
  return [...new Set(variants)].filter(s => s.trim().length >= 2).slice(0, 8);
}

const dynamicTickerCache = {}; // candidate (lowercased) -> resolved company object or null

async function searchAndRankSymbol(queryText){
  // Ranking/filtering is entity-resolution business logic, not a
  // data-source concern — it stays here and just asks whichever provider
  // is currently active (Twelve Data, Demo, ...) for raw candidates via
  // the shared provider contract (see market/provider-interface.js).
  const matches = await getActiveMarketDataProvider().searchSymbol(queryText);
  if(!matches.length) return null;
  const majorExchange = m => ['NASDAQ','NYSE','AMEX'].includes(m.exchange) || m.exchange === 'DEMO';
  // Leveraged/inverse/derivative products (e.g. "Leverage Shares 3x Long
  // SanDisk ETP") often share a plain company's name and can otherwise
  // out-rank or masquerade as the real thing. Filtering these out before
  // ranking is what fixed a real case where asking about SanDisk's stock
  // surfaced a 3x-leveraged ETP on the SanDisk name instead of the actual
  // SanDisk Corporation stock.
  const looksLeveraged = m => /\b(?:[2-5]x|inverse|leveraged?|ultra|daily|bull|bear)\b/i.test(m.instrument_name || '') || /\betp\b|\betn\b/i.test(m.instrument_name || '');
  const clean = matches.filter(m => !looksLeveraged(m));
  // Deliberately do NOT fall back to the unfiltered list when nothing clean
  // remains: a 3x-leveraged ETP is a materially different instrument from
  // the underlying stock (completely different risk), so silently
  // substituting one for the other would be misleading rather than merely
  // imprecise. Better to report "not found."
  const pool = clean;
  // If the query text contains something that looks like a bare ticker (a
  // short token, e.g. "sndk" typed alongside the company name — case
  // doesn't matter, most people type lowercase on mobile), an exact symbol
  // match is the highest-confidence signal available and wins outright,
  // bypassing the ambiguity check below entirely — naming the ticker IS
  // disambiguating.
  const tickerLikeTokens = queryText.split(/\s+/).filter(w => /^[A-Za-z]{1,5}$/.test(w)).map(w => w.toUpperCase());
  const exactTickerHit = tickerLikeTokens.length
    ? pool.find(m => tickerLikeTokens.includes((m.symbol||'').toUpperCase()) && m.instrument_type === 'Common Stock')
    : null;
  if(exactTickerHit) return exactTickerHit;

  // Low confidence: multiple DIFFERENT companies (distinct tickers) both
  // look like reasonable matches, and nothing above disambiguates between
  // them. Guessing here risks confidently answering about the wrong
  // company — asking which one was meant is safer than picking pool[0]
  // silently, which is what this used to do.
  const strongCandidates = pool.filter(m => m.instrument_type === 'Common Stock' && majorExchange(m));
  const distinctTickers = [...new Set(strongCandidates.map(m => m.symbol))];
  if(distinctTickers.length >= 2){
    return { ambiguous: true, candidates: strongCandidates.slice(0, 3) };
  }

  const best = strongCandidates[0] || pool.find(m => majorExchange(m)) || pool[0];
  return best || null;
}

async function resolveTickerDynamic(rawText){
  const latin = extractLatinCandidate(rawText);
  const hebrew = !latin ? extractHebrewCandidate(rawText) : null;
  const candidate = latin || hebrew;
  if(!candidate) return null;
  // A message that reads as a comparison ("who is more profitable?") or a
  // pronoun reference ("what's her P/E?") is never someone naming a new
  // company, even if candidate extraction above still pulled some leftover
  // text out of it. This must be checked here — BEFORE transliteration —
  // because a Hebrew candidate gets romanized into something like "mi iotr
  // rvhit" a few lines down, which no longer matches either the Hebrew or
  // English keyword lists; checking only inside a provider's searchSymbol
  // (where the resolution pipeline was actually caught fabricating a fake
  // company for exactly this case, in Demo Mode) is too late.
  const rawNorm = normalizeText(rawText);
  if(looksLikeEntityComparison(rawNorm) || looksLikeEntityPronounReference(rawNorm)) return null;
  const cacheKey = candidate.toLowerCase();
  if(cacheKey in dynamicTickerCache) return dynamicTickerCache[cacheKey];

  // A Latin candidate (or a ticker) is searched directly. A Hebrew-only
  // candidate is transliterated first, and each plausible variant is tried
  // in turn until one actually resolves to something.
  const queriesToTry = latin ? [latin] : transliterateHebrewToLatin(hebrew);

  let resolved = null;
  try{
    for(const q of queriesToTry){
      const best = await searchAndRankSymbol(q);
      if(best && best.ambiguous){
        // A real signal, not a miss — stop trying other transliteration
        // variants (they'd likely be even less precise) and surface the
        // ambiguity directly rather than silently guessing one candidate.
        resolved = best;
        break;
      }
      if(best){
        resolved = {
          ticker: best.symbol,
          exchange: best.exchange,
          name: { he: `${best.instrument_name} (${best.symbol})`, en: `${best.instrument_name} (${best.symbol})` }
        };
        break;
      }
    }
  }catch(e){ /* dynamic lookup failing just means we fall through to "not found" */ }

  dynamicTickerCache[cacheKey] = resolved;
  return resolved;
}


// Reverse index: alias (normalized) -> map entry, longest-alias-first so a
// longer, more specific alias always wins a substring check over a shorter
// coincidental one. Built lazily on first use rather than at load time,
// since normalizeText() is defined later in the concatenated script.
let _tickerAliasesSorted = null;
function tickerAliasesSorted(){
  if(_tickerAliasesSorted) return _tickerAliasesSorted;
  const list = [];
  TICKER_MAP.forEach(entry => {
    entry.aliases.forEach(a => list.push({ alias: normalizeText(a), entry }));
  });
  list.sort((a,b) => b.alias.length - a.alias.length);
  _tickerAliasesSorted = list;
  return list;
}

// Resolve a ticker mentioned in a message. Word-boundary matching (via the
// same padded-space technique used elsewhere in the engine) avoids a short
// alias firing inside an unrelated longer word.
function resolveTicker(norm){
  const padded = ' ' + norm + ' ';
  for(const { alias, entry } of tickerAliasesSorted()){
    if(padded.includes(' ' + alias + ' ')) return entry;
  }
  return null;
}
