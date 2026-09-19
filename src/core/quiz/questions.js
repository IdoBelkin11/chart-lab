// ---------------------------------------------------------------------------
// Quiz question bank — pure data. Adding a question means adding an object
// here; the engine and UI never need to change. Every question tests
// understanding of something the site actually teaches (KB entries, lesson
// content) — not disconnected trivia.
//
// Shape:
//   id: unique string
//   lesson: which lesson teaches this, e.g. 'l3' (omitted for questions that
//           belong to the general bank but to no single chapter)
//   category: matches the site's existing lesson/KB groupings loosely
//   difficulty: 'beginner' | 'intermediate'
//   question: {he, en}
//   options: [{key, text:{he,en}}] — always 4, key is 'a'..'d'
//   correctKey: which option is right
//   explanation: {he, en} — shown after answering, whether right or wrong
//
// EVERY lesson carries at least three of its own questions, and `lesson` is
// what "Practice this" selects on. The previous bank mapped questions to a
// broad CATEGORY instead, so every technical lesson drew from the same
// handful of technical questions — pressing "Practice this" inside the
// moving-averages chapter opened an RSI question. A question's home chapter
// is now recorded on the question itself, which is the only thing that can
// keep the two from drifting apart again.
// ---------------------------------------------------------------------------
export const QUIZ_QUESTIONS = [
  // ===================== l0 — market basics =====================
  {
    id:'q-diversif-2', lesson:'l0', category:'basics', difficulty:'beginner',
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
    id:'q-marketcap-1', lesson:'l0', category:'fundamentals', difficulty:'beginner',
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
    id:'q-ta-scope-1', lesson:'l0', category:'basics', difficulty:'beginner',
    question:{ he:'הכלים שהאתר מלמד (תמיכה, התנגדות, מגמות, נרות, RSI) שימושיים:', en:'The tools this site teaches (support, resistance, trends, candlesticks, RSI) are useful:' },
    options:[
      { key:'a', text:{ he:'רק על מניות, ובשום שוק אחר', en:'Only on stocks, and in no other market' } },
      { key:'b', text:{ he:'גם על קריפטו, מט"ח, סחורות ומדדים — בצורה כמעט זהה', en:'On crypto, forex, commodities and indices too — almost identically' } },
      { key:'c', text:{ he:'רק על מניות אמריקאיות גדולות', en:'Only on large American stocks' } },
      { key:'d', text:{ he:'רק כשהשוק במגמת עלייה', en:'Only while the market is in an uptrend' } }
    ],
    correctKey:'b',
    explanation:{ he:'האתר מלמד דרך מניות, אבל ניתוח טכני לא מוגבל להן. כל השווקים האלה מסתכמים לאותו דבר: גרף של קונים ומוכרים שמסכימים על מחיר לאורך זמן.', en:'The site teaches through stocks, but technical analysis is not limited to them. All of these markets come down to the same thing: a chart of buyers and sellers agreeing on a price over time.' }
  },

  // ===================== l1 — support & resistance =====================
  {
    id:'q-support-1', lesson:'l1', category:'technical', difficulty:'beginner',
    question:{ he:'מה קורה כשמחיר "שובר" רמת תמיכה משמעותית?', en:'What typically happens when price "breaks" a significant support level?' },
    options:[
      { key:'a', text:{ he:'התמיכה תמיד עוצרת את המחיר לחלוטין', en:'Support always stops the price completely' } },
      { key:'b', text:{ he:'הרמה עלולה להפוך להתנגדות, ולעיתים זה מרמז על המשך ירידה', en:'The level can flip into resistance, and it often hints at further decline' } },
      { key:'c', text:{ he:'המניה מפסיקה להיסחר', en:'The stock stops trading' } },
      { key:'d', text:{ he:'זה תמיד איתות קנייה', en:'It\'s always a buy signal' } }
    ],
    correctKey:'b',
    explanation:{ he:'שבירת תמיכה יכולה לרמז על המשך ירידה, והרמה שנשברה הופכת לעיתים לרמת התנגדות חדשה. אבל תבניות מחיר הן רמזי הסתברות, לא ערבויות.', en:'Breaking support can hint at further decline, and the broken level often flips into a new resistance level. But price patterns are probabilistic hints, not guarantees.' }
  },
  {
    id:'q-support-2', lesson:'l1', category:'technical', difficulty:'beginner',
    question:{ he:'מהי הדרך המדויקת יותר לחשוב על רמת תמיכה?', en:'What is the more accurate way to think about a support level?' },
    options:[
      { key:'a', text:{ he:'רצפה קשיחה שהמחיר לא יכול לרדת מתחתיה', en:'A hard floor the price cannot fall below' } },
      { key:'b', text:{ he:'אזור מחיר שבו לחץ קנייה גבר שוב ושוב על לחץ מכירה בעבר', en:'A price area where buying pressure has repeatedly overwhelmed selling pressure in the past' } },
      { key:'c', text:{ he:'מחיר בודד ומדויק שנקבע על ידי הבורסה', en:'A single exact price set by the exchange' } },
      { key:'d', text:{ he:'המחיר הממוצע של המניה מאז הנפקתה', en:'The stock\'s average price since it was listed' } }
    ],
    correctKey:'b',
    explanation:{ he:'תמיכה היא אזור, לא קו, והיא מתארת התנהגות שקרתה בעבר — לא כלל שמחייב את השוק. לכן גם לחיצה בכל מקום בתוך האזור נחשבת נכונה בתרגיל.', en:'Support is an area, not a line, and it describes behaviour that happened in the past — not a rule binding on the market. That is also why clicking anywhere inside the zone counts as correct in the exercise.' }
  },
  {
    id:'q-support-3', lesson:'l1', category:'technical', difficulty:'intermediate',
    question:{ he:'למה דווקא הצטופפות סוחרים סביב רמה מוכרת היא גם הסיבה שהרמה נשברת בחוזקה?', en:'Why is the crowding of traders around a well-known level also the reason it eventually breaks hard?' },
    options:[
      { key:'a', text:{ he:'כי הבורסה מבטלת פקודות ברמות פופולריות', en:'Because the exchange cancels orders at popular levels' } },
      { key:'b', text:{ he:'כי כל הסטופ-לוס שהצטברו ממש מעבר לרמה מופעלים בבת אחת', en:'Because all the stop-losses clustered just beyond the level get triggered at once' } },
      { key:'c', text:{ he:'כי רמות מפסיקות לעבוד אחרי שלושה מגעים בדיוק', en:'Because levels stop working after exactly three touches' } },
      { key:'d', text:{ he:'כי הנפח יורד תמיד בפריצה', en:'Because volume always falls during a breakout' } }
    ],
    correctKey:'b',
    explanation:{ he:'אותה צפיפות שמחזיקה את הרמה יוצרת גם ריכוז של פקודות סטופ ממש מעבר לה. ברגע שהמחיר פורץ, כולן מופעלות יחד — וזה לעיתים קרובות מה שמזין את עוצמת הפריצה.', en:'The same crowding that holds the level also concentrates stop orders just past it. Once price pushes through, they all fire together — which is often exactly what fuels the strength of the breakout.' }
  },

  // ===================== l2 — breakout & retest =====================
  {
    id:'q-breakout-1', lesson:'l2', category:'technical', difficulty:'beginner',
    question:{ he:'מהו "ריטסט" (בדיקה חוזרת) אחרי פריצה?', en:'What is a "retest" after a breakout?' },
    options:[
      { key:'a', text:{ he:'פריצה שנייה של אותה רמה כלפי מעלה', en:'A second breakout through the same level upward' } },
      { key:'b', text:{ he:'חזרה של המחיר לאזור שנפרץ, שלעיתים הופך מהתנגדות לתמיכה', en:'Price returning to the zone it broke, which often flips from resistance to support' } },
      { key:'c', text:{ he:'בדיקה של הברוקר שהעסקה בוצעה', en:'The broker verifying the trade executed' } },
      { key:'d', text:{ he:'חישוב מחדש של הנפח באותו יום', en:'Recalculating that day\'s volume' } }
    ],
    correctKey:'b',
    explanation:{ he:'ריטסט הוא חזרה לאותו אזור אחרי הפריצה. אם הוא מחזיק, התקרה הישנה משמשת כעת כרצפה — וזו בדיוק ההבחנה שהגרפים בפרק הזה מראים.', en:'A retest is a return to that same zone after the breakout. If it holds, the old ceiling now acts as a floor — which is exactly the distinction the charts in this chapter show.' }
  },
  {
    id:'q-breakout-2', lesson:'l2', category:'technical', difficulty:'intermediate',
    question:{ he:'איך מבחינים בין ריטסט אמיתי לפריצה שנכשלת?', en:'How do you tell a genuine retest from a failing breakout?' },
    options:[
      { key:'a', text:{ he:'ריטסט אמיתי נעצר בקרבת הרמה הישנה ולא נשאר מתחתיה יותר מנר או שניים', en:'A genuine retest stalls near the old level and doesn\'t stay below it for more than a candle or two' } },
      { key:'b', text:{ he:'ריטסט אמיתי תמיד מגיע ביום שאחרי הפריצה', en:'A genuine retest always comes the day after the breakout' } },
      { key:'c', text:{ he:'אין שום דרך להבחין ביניהם', en:'There is no way to tell them apart' } },
      { key:'d', text:{ he:'ריטסט אמיתי קורה רק בנפח אפסי', en:'A genuine retest only happens on zero volume' } }
    ],
    correctKey:'a',
    explanation:{ he:'סגירה שנשארת מתחת לרמה הישנה לזמן ארוך יותר מנר או שניים היא אזהרה שהפריצה עלולה להיכשל. לא כל ירידה אחרי פריצה היא ריטסט — לפעמים זה היפוך מלא.', en:'A close that stays under the old level for longer than a candle or two is a warning the breakout may be failing. Not every dip after a breakout is a retest — sometimes it is a full reversal.' }
  },
  {
    id:'q-breakout-3', lesson:'l2', category:'technical', difficulty:'beginner',
    question:{ he:'למה קפיצת נפח בנר הפריצה נחשבת משמעותית?', en:'Why is a volume spike on the breakout candle considered meaningful?' },
    options:[
      { key:'a', text:{ he:'היא מוכיחה שהפריצה תצליח', en:'It proves the breakout will succeed' } },
      { key:'b', text:{ he:'היא מראה שיותר משתתפים מהרגיל הסכימו שהרמה צריכה להישבר', en:'It shows more participants than usual agreed the level should give way' } },
      { key:'c', text:{ he:'היא מורידה את עלות העסקה בברוקר', en:'It lowers your trading fees at the broker' } },
      { key:'d', text:{ he:'היא משנה את רמת ההתנגדות למחיר אחר', en:'It moves the resistance level to a different price' } }
    ],
    correctKey:'b',
    explanation:{ he:'נפח הוא עדות להסכמה רחבה, לא ערובה. פריצה עם נפח חריג אומרת שהתנועה נתמכה בהרבה משתתפים — מה שמייחד אותה מחריגה שקטה שנשחקת במהירות.', en:'Volume is evidence of broad agreement, not a guarantee. A breakout on unusual volume means the move was backed by many participants — which is what distinguishes it from a quiet poke that fades quickly.' }
  },

  // ===================== l3 — moving averages =====================
  {
    id:'q-ma-1', lesson:'l3', category:'technical', difficulty:'beginner',
    question:{ he:'מה בדיוק מודד ממוצע נע?', en:'What exactly does a moving average measure?' },
    options:[
      { key:'a', text:{ he:'את מחיר הסגירה הממוצע לאורך מספר קבוע של מפגשים קודמים, מחושב מחדש בכל יום', en:'The average closing price over a fixed number of past sessions, recalculated every day' } },
      { key:'b', text:{ he:'את המחיר הצפוי של המניה מחר', en:'The stock\'s expected price tomorrow' } },
      { key:'c', text:{ he:'את הנפח הממוצע של המניה', en:'The stock\'s average volume' } },
      { key:'d', text:{ he:'את הרווח הממוצע של החברה לרבעון', en:'The company\'s average quarterly profit' } }
    ],
    correctKey:'a',
    explanation:{ he:'ממוצע נע מחליק את הרעש היומי כדי שהמגמה תהיה נראית. הוא מתאר את העבר בצורה מסודרת — הוא לא מנבא את המחיר הבא.', en:'A moving average smooths out day-to-day noise so the trend becomes visible. It describes the past in an orderly way — it does not forecast the next price.' }
  },
  {
    id:'q-ma-2', lesson:'l3', category:'technical', difficulty:'beginner',
    question:{ he:'מה ההבדל המרכזי בין ממוצע קצר (20) לממוצע ארוך (150)?', en:'What is the main difference between a short average (20) and a long one (150)?' },
    options:[
      { key:'a', text:{ he:'הקצר מדויק יותר, והארוך פשוט שגוי', en:'The short one is more accurate and the long one is simply wrong' } },
      { key:'b', text:{ he:'הקצר מגיב מהר לתנועה האחרונה, הארוך מתאר את כיוון המגמה הרחבה', en:'The short one reacts quickly to recent movement; the long one describes the direction of the broad trend' } },
      { key:'c', text:{ he:'הארוך מתעדכן רק פעם בחודש', en:'The long one only updates once a month' } },
      { key:'d', text:{ he:'אין שום הבדל מעשי ביניהם', en:'There is no practical difference between them' } }
    ],
    correctKey:'b',
    explanation:{ he:'ממוצע 20 מכסה בערך חודש מסחר ונצמד למחיר האחרון, ולכן גם מתנדנד יותר בתקופות חסרות כיוון. ממוצע 150 מכסה כשבעה חודשים ומתעלם כמעט לגמרי מרעש יומי.', en:'The 20 covers roughly a month of trading and hugs recent price, which is also why it whips around more in directionless stretches. The 150 covers about seven months and ignores day-to-day noise almost entirely.' }
  },
  {
    id:'q-ma-3', lesson:'l3', category:'technical', difficulty:'intermediate',
    question:{ he:'למה קו הממוצע של 150 יום מתחיל מאוחר יותר על הגרף מקו ה-20?', en:'Why does the 150-day average line start later on the chart than the 20-day one?' },
    options:[
      { key:'a', text:{ he:'כי אי אפשר לחשב ממוצע של 150 יום לפני שיש 150 יום של נתונים', en:'Because you cannot compute a 150-day average before 150 days of data exist' } },
      { key:'b', text:{ he:'כי הוא מחושב רק אחרי שהמגמה מאושרת', en:'Because it is only computed once the trend is confirmed' } },
      { key:'c', text:{ he:'כי הוא מצויר בכוונה קצר יותר מטעמי עיצוב', en:'Because it is deliberately drawn shorter for design reasons' } },
      { key:'d', text:{ he:'כי הוא מתייחס רק לימים שבהם היה נפח גבוה', en:'Because it only counts days with high volume' } }
    ],
    correctKey:'a',
    explanation:{ he:'זו מגבלה אריתמטית פשוטה, לא החלטה: לכל ממוצע נע יש "תקופת חימום" באורך התקופה שלו. לכן ממוצעים ארוכים גם נראים קצרים יותר על גרף באותו אורך.', en:'This is plain arithmetic, not a choice: every moving average has a warm-up period as long as its own window. That is also why longer averages appear shorter on a chart of the same length.' }
  },

  // ===================== l4 — candlesticks =====================
  {
    id:'q-candle-1', lesson:'l4', category:'technical', difficulty:'beginner',
    question:{ he:'מה מאפיין נר "פטיש" (Hammer)?', en:'What characterises a "hammer" candle?' },
    options:[
      { key:'a', text:{ he:'גוף גדול ואדום בלי צללים', en:'A large red body with no shadows' } },
      { key:'b', text:{ he:'צל תחתון ארוך וגוף קטן בראשו, לרוב בסוף ירידה', en:'A long lower shadow with a small body at the top, usually at the end of a decline' } },
      { key:'c', text:{ he:'שני נרות בגודל זהה זה אחר זה', en:'Two identically sized candles in a row' } },
      { key:'d', text:{ he:'נר ללא גוף וללא צללים', en:'A candle with neither a body nor shadows' } }
    ],
    correctKey:'b',
    explanation:{ he:'הצל התחתון הארוך מספר שהמחיר ירד חזק במהלך המפגש אבל חזר למעלה עד הסגירה. זה רמז להתעניינות קונים — בהקשר של הירידה שקדמה לו.', en:'The long lower shadow says price fell hard during the session but recovered by the close. That hints at buyer interest — in the context of the decline that preceded it.' }
  },
  {
    id:'q-candle-2', lesson:'l4', category:'technical', difficulty:'beginner',
    question:{ he:'מהי תבנית "בליעה עולה" (Bullish Engulfing)?', en:'What is a "bullish engulfing" pattern?' },
    options:[
      { key:'a', text:{ he:'נר ירוק גדול שבולע לחלוטין נר אדום קטן שלפניו', en:'A large green candle that fully engulfs the small red one before it' } },
      { key:'b', text:{ he:'נר אדום שבולע נר ירוק', en:'A red candle that engulfs a green one' } },
      { key:'c', text:{ he:'שלושה נרות ירוקים רצופים', en:'Three consecutive green candles' } },
      { key:'d', text:{ he:'נר עם צל עליון ארוך במיוחד', en:'A candle with an unusually long upper shadow' } }
    ],
    correctKey:'a',
    explanation:{ he:'"בליעה" מתייחסת ליחס בין שני נרות סמוכים: הנר השני מכסה את כל טווח הנר הראשון. הגרסה העולה מופיעה אחרי ירידה, וההפוכה — בליעה יורדת — אחרי עלייה.', en:'"Engulfing" describes the relationship between two adjacent candles: the second covers the first\'s entire range. The bullish version appears after a decline; its mirror, bearish engulfing, after a rise.' }
  },
  {
    id:'q-candle-3', lesson:'l4', category:'technical', difficulty:'intermediate',
    question:{ he:'איך רוב הסוחרים המנוסים מתייחסים לתבנית נר בודדת?', en:'How do most experienced traders treat a single candlestick pattern?' },
    options:[
      { key:'a', text:{ he:'כהוכחה מה יקרה מחר', en:'As proof of what will happen tomorrow' } },
      { key:'b', text:{ he:'כרמז שדורש אישור בנר הבא או השניים הבאים', en:'As a hint that needs confirmation on the next candle or two' } },
      { key:'c', text:{ he:'כאיתות שיש להתעלם ממנו לגמרי', en:'As a signal to be ignored entirely' } },
      { key:'d', text:{ he:'כתחליף לכל שאר הניתוח', en:'As a replacement for all other analysis' } }
    ],
    correctKey:'b',
    explanation:{ he:'נר אחד מתאר מה שקרה במפגש אחד או שניים — זו לא ערובה לגבי מחר. תבנית נרות משמעותית רק בהקשר: היכן היא נמצאת ביחס למגמה, ומה קורה למחיר מיד אחריה.', en:'One candle describes what happened over one or two sessions — it is not a guarantee about tomorrow. A candlestick pattern is only meaningful in context: where it sits relative to the trend, and what price does right after.' }
  },

  // ===================== l5 — Fibonacci =====================
  {
    id:'q-fib-1', lesson:'l5', category:'technical', difficulty:'beginner',
    question:{ he:'מה מסמנות רמות תיקון פיבונאצ׳י?', en:'What do Fibonacci retracement levels mark?' },
    options:[
      { key:'a', text:{ he:'את התיקון כאחוז מהתנועה שקדמה לו', en:'The pullback as a percentage of the move that preceded it' } },
      { key:'b', text:{ he:'את התשואה השנתית הצפויה', en:'The expected annual return' } },
      { key:'c', text:{ he:'את מספר המניות שכדאי לקנות', en:'How many shares you should buy' } },
      { key:'d', text:{ he:'את מחיר היעד המובטח של המניה', en:'The stock\'s guaranteed target price' } }
    ],
    correctKey:'a',
    explanation:{ he:'הרמות — 23.6%, 38.2%, 50%, 61.8%, 78.6% — נמדדות מתוך התנועה עצמה, ומספקות רמות ייחוס לעקוב אחריהן. הן לא מנבאות שום דבר בעצמן.', en:'The levels — 23.6%, 38.2%, 50%, 61.8%, 78.6% — are measured out of the move itself and give reference levels to watch. They do not predict anything on their own.' }
  },
  {
    id:'q-fib-2', lesson:'l5', category:'technical', difficulty:'intermediate',
    question:{ he:'מה מיוחד ברמת ה-50% בין רמות פיבונאצ׳י?', en:'What is unusual about the 50% level among the Fibonacci levels?' },
    options:[
      { key:'a', text:{ he:'היא הרמה החזקה והמדויקת ביותר', en:'It is the strongest and most precise level' } },
      { key:'b', text:{ he:'היא בכלל לא יחס פיבונאצ׳י — היא נוספה מתוך תצפית של תורת דאו', en:'It is not a Fibonacci ratio at all — it was added from an observation in Dow Theory' } },
      { key:'c', text:{ he:'היא מחושבת רק במגמות ירידה', en:'It is only computed in downtrends' } },
      { key:'d', text:{ he:'היא תמיד עוצרת את המחיר', en:'It always stops the price' } }
    ],
    correctKey:'b',
    explanation:{ he:'50% נוסף כי שווקים לרוב מתקנים בערך חצי מתנועה — תצפית ישנה יותר מתורת דאו שנשארה בשימוש, ולא יחס מתוך רצף פיבונאצ׳י.', en:'50% was added because markets often retrace around half of a move — an older observation from Dow Theory that stuck around, not a ratio from the Fibonacci sequence.' }
  },
  {
    id:'q-fib-3', lesson:'l5', category:'technical', difficulty:'intermediate',
    question:{ he:'מה ההסבר הסביר ביותר לכך שרמות פיבונאצ׳י "עובדות" לפעמים?', en:'What is the most plausible explanation for Fibonacci levels sometimes "working"?' },
    options:[
      { key:'a', text:{ he:'תכונה מתמטית מיסטית של המספרים עצמם', en:'A mystical mathematical property of the numbers themselves' } },
      { key:'b', text:{ he:'כל כך הרבה משתתפים מציירים את אותם קווים שהם מציבים פקודות סביב אותם מחירים', en:'So many participants plot the same lines that they place orders around the same prices' } },
      { key:'c', text:{ he:'הבורסות מחויבות לעצור מסחר ברמות האלה', en:'Exchanges are required to halt trading at those levels' } },
      { key:'d', text:{ he:'הן מחושבות מתוך דוחות החברה', en:'They are computed from the company\'s financial reports' } }
    ],
    correctKey:'b',
    explanation:{ he:'סוחרים, אלגוריתמים ומוסדות מציירים את אותם קווי תיקון, וכך נוצרים היצע וביקוש אמיתיים בדיוק במקום שכולם מסתכלים עליו. זו במידה מסוימת נבואה שמגשימה את עצמה.', en:'Traders, algorithms and institutions plot the same retracement lines, which creates real supply and demand exactly where everyone is already looking. It is partly a self-fulfilling prophecy.' }
  },

  // ===================== l6 — RSI =====================
  {
    id:'q-rsi-1', lesson:'l6', category:'technical', difficulty:'beginner',
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
    id:'q-rsi-2', lesson:'l6', category:'technical', difficulty:'intermediate',
    question:{ he:'למה חלק מהסוחרים מזיזים את רמות 70/30 ל-80/20 בזמן מגמה חזקה?', en:'Why do some traders shift the 70/30 thresholds to 80/20 during a strong trend?' },
    options:[
      { key:'a', text:{ he:'כי 70/30 מפעיל איתות מוקדם מדי ותכוף מדי בשוק חד-כיווני', en:'Because 70/30 triggers too early and too often in a one-directional market' } },
      { key:'b', text:{ he:'כי RSI מפסיק לעבוד מעל 70', en:'Because RSI stops working above 70' } },
      { key:'c', text:{ he:'כי הנוסחה משתנה במגמות חזקות', en:'Because the formula changes in strong trends' } },
      { key:'d', text:{ he:'כי הבורסה דורשת זאת', en:'Because the exchange requires it' } }
    ],
    correctKey:'a',
    explanation:{ he:'במגמת עלייה מתמשכת RSI יכול להישאר מעל 70 לאורך זמן רב, כפי שהדוגמה הראשונה בפרק מראה. הזזת הרמות מקטינה את מספר האיתותים המוקדמים.', en:'In a sustained rally RSI can stay above 70 for a long stretch, as the first example in this chapter shows. Shifting the thresholds cuts down the number of premature signals.' }
  },
  {
    id:'q-rsi-3', lesson:'l6', category:'technical', difficulty:'intermediate',
    question:{ he:'מהו דיוורגנס שלילי (Bearish Divergence) בין מחיר ל-RSI?', en:'What is bearish divergence between price and RSI?' },
    options:[
      { key:'a', text:{ he:'המחיר קובע שיא גבוה יותר, אבל ה-RSI קובע שיא נמוך יותר', en:'Price makes a higher high, but RSI makes a lower high' } },
      { key:'b', text:{ he:'המחיר וה-RSI עולים יחד', en:'Price and RSI rise together' } },
      { key:'c', text:{ he:'ה-RSI חוצה את 50 כלפי מעלה', en:'RSI crosses above 50' } },
      { key:'d', text:{ he:'הנפח יורד בזמן שהמחיר עולה', en:'Volume falls while price rises' } }
    ],
    correctKey:'a',
    explanation:{ he:'זו אי-הסכמה בין המחיר למומנטום שמאחוריו: המחיר מגיע גבוה יותר, אבל בכוח פחות. כמו כל איתות RSI, זה רמז מפגר — הוא מחושב ממחיר שכבר קרה.', en:'It is a disagreement between price and the momentum behind it: price reaches higher, but with less force. Like every RSI signal it is a lagging hint — computed from price that already happened.' }
  },

  // ===================== l7 — chart patterns =====================
  {
    id:'q-pattern-1', lesson:'l7', category:'technical', difficulty:'beginner',
    question:{ he:'מה מגדיר תבנית "תחתית כפולה" (Double Bottom)?', en:'What defines a "double bottom" pattern?' },
    options:[
      { key:'a', text:{ he:'שני שפלים בגובה דומה, עם שיא ביניהם (קו הצוואר)', en:'Two lows at a similar level, with a high between them (the neckline)' } },
      { key:'b', text:{ he:'שני שיאים בגובה דומה לפני ירידה', en:'Two highs at a similar level before a decline' } },
      { key:'c', text:{ he:'ירידה רצופה של שני שבועות', en:'Two straight weeks of decline' } },
      { key:'d', text:{ he:'שני נרות אדומים סמוכים', en:'Two adjacent red candles' } }
    ],
    correctKey:'a',
    explanation:{ he:'התבנית מוגדרת על ידי המבנה: שני שפלים בגובה דומה וקו הצוואר שמעליהם. שני שיאים בגובה דומה הם התבנית ההפוכה — תקרה כפולה.', en:'The pattern is defined by its structure: two lows at a similar level and the neckline above them. Two highs at a similar level are the mirror pattern — a double top.' }
  },
  {
    id:'q-pattern-2', lesson:'l7', category:'technical', difficulty:'intermediate',
    question:{ he:'מהי טכניקת "התנועה הנמדדת" (Measured Move) להערכת יעד מחיר?', en:'What is the "measured move" technique for estimating a price target?' },
    options:[
      { key:'a', text:{ he:'לוקחים את גובה התבנית ומקרינים אותו מנקודת הפריצה בכיוון הפריצה', en:'Take the height of the pattern and project it from the breakout point in the breakout\'s direction' } },
      { key:'b', text:{ he:'מכפילים את מחיר המניה בשתיים', en:'Multiply the share price by two' } },
      { key:'c', text:{ he:'מחשבים את הממוצע של כל השיאים בגרף', en:'Average every high on the chart' } },
      { key:'d', text:{ he:'משתמשים ב-P/E כדי לגזור יעד', en:'Use the P/E to derive a target' } }
    ],
    correctKey:'a',
    explanation:{ he:'למשל בראש וכתפיים: המרחק מהראש עד קו הצוואר מוקרן מנקודת הפריצה. זו הערכת פתיחה גסה, לא הבטחה — תנועות אמיתיות לעיתים נופלות מהיעד או חורגות ממנו בהרבה.', en:'In a head and shoulders, for instance, the distance from the head down to the neckline is projected from the breakout point. It is a rough starting estimate, not a promise — real moves regularly fall short or run well past it.' }
  },
  {
    id:'q-pattern-3', lesson:'l7', category:'technical', difficulty:'beginner',
    question:{ he:'מה נכון לגבי התוצאה של תבנית גרף שהושלמה?', en:'What is true about the outcome of a completed chart pattern?' },
    options:[
      { key:'a', text:{ he:'התוצאה מובטחת ברגע שהתבנית הושלמה', en:'The outcome is guaranteed once the pattern completes' } },
      { key:'b', text:{ he:'לכל תבנית יש תוצאה טיפוסית — אך לא מובטחת', en:'Each pattern has a typical — but not guaranteed — outcome' } },
      { key:'c', text:{ he:'לתבניות אין שום תוצאה אופיינית', en:'Patterns have no characteristic outcome at all' } },
      { key:'d', text:{ he:'התוצאה נקבעת על ידי הבורסה', en:'The outcome is determined by the exchange' } }
    ],
    correctKey:'b',
    explanation:{ he:'תבניות הן צורות חוזרות בתנועת מחיר, לכל אחת תוצאה טיפוסית לאחר השלמתה. "טיפוסית" היא המילה המרכזית — זו נטייה שנצפתה, לא כלל.', en:'Patterns are recurring shapes in price action, each with a typical outcome once it completes. "Typical" is the operative word — it is an observed tendency, not a rule.' }
  },

  // ===== general bank: taught by the KB and the tools, not by one chapter =====
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

export function getQuizQuestions(filter){
  filter = filter || {};
  return QUIZ_QUESTIONS.filter(q =>
    (!filter.category || q.category === filter.category) &&
    (!filter.difficulty || q.difficulty === filter.difficulty) &&
    (!filter.lesson || q.lesson === filter.lesson)
  );
}

export function getQuizCategories(){
  return [...new Set(QUIZ_QUESTIONS.map(q => q.category))];
}
