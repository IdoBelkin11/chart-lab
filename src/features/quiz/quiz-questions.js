// ---------------------------------------------------------------------------
// Quiz question bank — pure data. Adding a question means adding an object
// here; the engine and UI never need to change. Every question tests
// understanding of something the site actually teaches (KB entries, lesson
// content) — not disconnected trivia.
//
// Shape:
//   id: unique string
//   category: matches the site's existing lesson/KB groupings loosely
//   difficulty: 'beginner' | 'intermediate'
//   question: {he, en}
//   options: [{key, text:{he,en}}] — always 4, key is 'a'..'d'
//   correctKey: which option is right
//   explanation: {he, en} — shown after answering, whether right or wrong
// ---------------------------------------------------------------------------
const QUIZ_QUESTIONS = [
  {
    id:'q-pe-1', category:'fundamentals', difficulty:'beginner',
    question:{ he:'מכפיל רווח (P/E) גבוה במיוחד בהשוואה לענף עשוי להעיד על מה?', en:'A P/E ratio much higher than the industry average most likely suggests what?' },
    options:[
      { key:'a', text:{ he:'החברה בהכרח על סף פשיטת רגל', en:'The company is necessarily close to bankruptcy' } },
      { key:'b', text:{ he:'המשקיעים מצפים לצמיחה גבוהה, או שהמניה יקרה יחסית לרווחיה', en:'Investors expect high growth, or the stock is expensive relative to its earnings' } },
      { key:'c', text:{ he:'החברה לא מרוויחה כסף בכלל', en:'The company isn\'t making any money at all' } },
      { key:'d', text:{ he:'המניה בטוחה יותר מאשר מניה עם P/E נמוך', en:'The stock is safer than one with a lower P/E' } }
    ],
    correctKey:'b',
    explanation:{ he:'P/E גבוה אומר שהשוק משלם הרבה יחסית לרווח הנוכחי — לרוב כי מצפים לצמיחה מהירה, אבל זה גם אומר פחות מרווח לטעות אם הצמיחה לא תגיע.', en:'A high P/E means the market is paying a lot relative to current earnings — usually because fast growth is expected, but it also means less room for error if that growth doesn\'t show up.' }
  },
  {
    id:'q-rsi-1', category:'technical', difficulty:'beginner',
    question:{ he:'RSI מעל 70 בדרך כלל נחשב:', en:'An RSI above 70 is generally considered:' },
    options:[
      { key:'a', text:{ he:'קניית יתר (Overbought)', en:'Overbought' } },
      { key:'b', text:{ he:'מכירת יתר (Oversold)', en:'Oversold' } },
      { key:'c', text:{ he:'איתות קנייה חד-משמעי', en:'An unambiguous buy signal' } },
      { key:'d', text:{ he:'סימן שהחברה פושטת רגל', en:'A sign the company is going bankrupt' } }
    ],
    correctKey:'a',
    explanation:{ he:'RSI מעל 70 נחשב "קניית יתר" — לא הבטחה לירידה, אלא רמז שהמומנטום הקצר היה חזק מאוד ואולי מוגזם.', en:'Above 70 is considered "overbought" — not a guarantee of a drop, just a hint that short-term momentum has been very strong, possibly overextended.' }
  },
  {
    id:'q-diversification-1', category:'risk', difficulty:'beginner',
    question:{ he:'הפיזור (דיברסיפיקציה) בתיק השקעות עוזר בעיקר להקטין איזה סוג סיכון?', en:'Diversification in a portfolio mainly helps reduce which kind of risk?' },
    options:[
      { key:'a', text:{ he:'הסיכון הספציפי לחברה בודדת', en:'The risk specific to a single company' } },
      { key:'b', text:{ he:'הסיכון של השוק כולו לרדת', en:'The risk of the entire market falling' } },
      { key:'c', text:{ he:'אין לפיזור שום השפעה על סיכון', en:'Diversification has no effect on risk' } },
      { key:'d', text:{ he:'הסיכון שהברוקר שלך ייסגר', en:'The risk of your broker shutting down' } }
    ],
    correctKey:'a',
    explanation:{ he:'פיזור מקטין את הסיכון הספציפי לחברה בודדת (למשל דוחות גרועים) — אבל לא מגן מפני ירידה כללית של כל השוק (סיכון שיטתי).', en:'Diversification reduces the risk specific to any one company (e.g. a bad earnings report) — it does not protect against the whole market falling together (systematic risk).' }
  },
  {
    id:'q-support-1', category:'technical', difficulty:'beginner',
    question:{ he:'מה קורה כשמחיר "שובר" רמת תמיכה משמעותית?', en:'What typically happens when price "breaks" a significant support level?' },
    options:[
      { key:'a', text:{ he:'התמיכה תמיד עוצרת את המחיר לחלוטין', en:'Support always stops the price completely' } },
      { key:'b', text:{ he:'הרמה עלולה להפוך להתנגדות, ולעיתים זה מרמז על המשך ירידה', en:'The level can flip into resistance, and it often hints at further decline' } },
      { key:'c', text:{ he:'המניה מפסיקת להיסחר', en:'The stock stops trading' } },
      { key:'d', text:{ he:'זה תמיד איתות קנייה', en:'It\'s always a buy signal' } }
    ],
    correctKey:'b',
    explanation:{ he:'שבירת תמיכה יכולה לרמז על המשך ירידה, והרמה שנשברה הופכת לעיתים לרמת התנגדות חדשה. אבל תבניות מחיר הן רמזי הסתברות, לא ערבויות.', en:'Breaking support can hint at further decline, and the broken level often flips into a new resistance level. But price patterns are probabilistic hints, not guarantees.' }
  },
  {
    id:'q-diversif-2', category:'basics', difficulty:'beginner',
    question:{ he:'ETF שעוקב אחרי מדד רחב (כמו S&P 500) שונה מקנייה של מניה בודדת בעיקר ב:', en:'A broad-index ETF (like the S&P 500) differs from buying a single stock mainly in that it:' },
    options:[
      { key:'a', text:{ he:'תמיד מניב תשואה גבוהה יותר', en:'Always returns more' } },
      { key:'b', text:{ he:'מפזר את החשיפה על פני עשרות/מאות חברות בבת אחת', en:'Spreads exposure across dozens or hundreds of companies at once' } },
      { key:'c', text:{ he:'לא ניתן למכור אותו בשוק הפתוח', en:'Can\'t be sold on the open market' } },
      { key:'d', text:{ he:'מובטח על ידי הממשלה', en:'Is government-guaranteed' } }
    ],
    correctKey:'b',
    explanation:{ he:'ה-ETF עצמו לא מבטיח תשואה גבוהה יותר — היתרון המרכזי הוא פיזור מיידי, שמקטין את הסיכון שקשור לחברה בודדת.', en:'The ETF itself doesn\'t guarantee a higher return — its main advantage is instant diversification, which reduces single-company risk.' }
  },
  {
    id:'q-volatility-1', category:'risk', difficulty:'intermediate',
    question:{ he:'תנודתיות (Volatility) גבוהה במניה אומרת בעיקר:', en:'High volatility in a stock mainly means:' },
    options:[
      { key:'a', text:{ he:'המחיר תמיד יורד', en:'The price is always falling' } },
      { key:'b', text:{ he:'המחיר נע בטווח רחב יחסית, בשני הכיוונים', en:'The price moves through a relatively wide range, in both directions' } },
      { key:'c', text:{ he:'החברה בהכרח מסוכנת מבחינה עסקית', en:'The company is necessarily risky as a business' } },
      { key:'d', text:{ he:'אי אפשר לחשב אותה', en:'It can\'t be calculated' } }
    ],
    correctKey:'b',
    explanation:{ he:'תנודתיות מודדת את גודל התנועות, לא את הכיוון שלהן — מניה תנודתית יכולה לעלות חזק בדיוק כמו שהיא יכולה לרדת חזק.', en:'Volatility measures the SIZE of moves, not their direction — a volatile stock can rally hard just as easily as it can drop hard.' }
  },
  {
    id:'q-macd-1', category:'technical', difficulty:'intermediate',
    question:{ he:'MACD בנוי בעיקר מההפרש בין:', en:'MACD is built mainly from the difference between:' },
    options:[
      { key:'a', text:{ he:'שני ממוצעים נעים אקספוננציאליים (בדרך כלל 12 ו-26)', en:'Two exponential moving averages (typically 12 and 26)' } },
      { key:'b', text:{ he:'המחיר הגבוה והנמוך ביותר בשנה', en:'The highest and lowest price of the year' } },
      { key:'c', text:{ he:'הכנסות והוצאות החברה', en:'The company\'s revenue and expenses' } },
      { key:'d', text:{ he:'נפח המסחר של אתמול והיום', en:'Yesterday\'s and today\'s trading volume' } }
    ],
    correctKey:'a',
    explanation:{ he:'MACD מבוסס על ההפרש בין שני ממוצעים נעים אקספוננציאליים בטווחי זמן שונים, ומשמש בעיקר למדידת מומנטום ושינויים בכיוון המגמה.', en:'MACD is based on the difference between two exponential moving averages over different timeframes, mainly used to gauge momentum and shifts in trend direction.' }
  },
  {
    id:'q-bond-1', category:'bonds', difficulty:'beginner',
    question:{ he:'כשריבית הבנק המרכזי עולה, מה קורה בדרך כלל למחיר של אג"ח קיימות עם ריבית קבועה?', en:'When central bank interest rates rise, what typically happens to the price of existing fixed-rate bonds?' },
    options:[
      { key:'a', text:{ he:'המחיר עולה', en:'The price rises' } },
      { key:'b', text:{ he:'המחיר יורד', en:'The price falls' } },
      { key:'c', text:{ he:'אין שום קשר בין השניים', en:'There\'s no relationship at all' } },
      { key:'d', text:{ he:'האג"ח מפסיקה לשלם ריבית', en:'The bond stops paying interest' } }
    ],
    correctKey:'b',
    explanation:{ he:'מחירי אג"ח וריביות נעים בכיוונים הפוכים: כשריביות חדשות עולות, אג"ח ישנות עם ריבית קבועה נמוכה יותר נעשות פחות אטרקטיביות, ומחירן יורד כדי לפצות על כך.', en:'Bond prices and interest rates move inversely: when new rates rise, older fixed-rate bonds paying a lower rate become less attractive, so their price falls to compensate.' }
  },
  {
    id:'q-marketcap-1', category:'fundamentals', difficulty:'beginner',
    question:{ he:'שווי שוק (Market Cap) של חברה מחושב כ:', en:'A company\'s market cap is calculated as:' },
    options:[
      { key:'a', text:{ he:'מחיר המניה כפול מספר המניות במחזור', en:'Share price times the number of shares outstanding' } },
      { key:'b', text:{ he:'סך ההכנסות השנתיות של החברה', en:'The company\'s total annual revenue' } },
      { key:'c', text:{ he:'סך המזומן בקופת החברה', en:'The total cash on the company\'s balance sheet' } },
      { key:'d', text:{ he:'הרווח הנקי כפול 10', en:'Net profit times 10' } }
    ],
    correctKey:'a',
    explanation:{ he:'שווי שוק = מחיר המניה × מספר המניות במחזור. זו הדרך הנפוצה להשוות "גודל" בין חברות שונות, גם אם מחיר המניה עצמו שונה מאוד.', en:'Market cap = share price × shares outstanding. It\'s the common way to compare the "size" of different companies, even when their share prices themselves look very different.' }
  },
  {
    id:'q-shortselling-1', category:'basics', difficulty:'intermediate',
    question:{ he:'מה ההבדל המרכזי בין מכירת מניה שיש לך לבין "שורט" (Short Selling)?', en:'What\'s the main difference between selling a stock you own and "shorting" it?' },
    options:[
      { key:'a', text:{ he:'אין שום הבדל, זו אותה פעולה', en:'There\'s no difference, it\'s the same action' } },
      { key:'b', text:{ he:'בשורט אתה מוכר מניה שאתה שואל, מהמר על ירידה, וההפסד הפוטנציאלי לא מוגבל', en:'In a short you sell a borrowed share, betting on a decline, and the potential loss is unlimited' } },
      { key:'c', text:{ he:'שורט מותר רק למוסדות, אף פעם לא ליחידים', en:'Shorting is only allowed for institutions, never individuals' } },
      { key:'d', text:{ he:'שורט תמיד רווחי יותר', en:'Shorting is always more profitable' } }
    ],
    correctKey:'b',
    explanation:{ he:'למכור מניה שיש לך פשוט סוגר את הפוזיציה שלך. שורט הוא הימור על ירידה במניה שאתה לא מחזיק (שאולה) — וכיוון שלמחיר אין תקרה תיאורטית, ההפסד הפוטנציאלי בשורט לא מוגבל.', en:'Selling a stock you own simply closes your position. Shorting is a bet against a stock you don\'t own (borrowed) — and since a price has no theoretical ceiling, the potential loss on a short is unlimited.' }
  }
];

function getQuizQuestions(filter){
  filter = filter || {};
  return QUIZ_QUESTIONS.filter(q =>
    (!filter.category || q.category === filter.category) &&
    (!filter.difficulty || q.difficulty === filter.difficulty)
  );
}

function getQuizCategories(){
  return [...new Set(QUIZ_QUESTIONS.map(q => q.category))];
}
