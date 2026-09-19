// ---------------------------------------------------------------------------
// Example bank.
//
// Attaches `examples` to entries that already exist elsewhere in the KB,
// keyed by id. Authoring them centrally rather than editing a dozen topic
// files keeps every example visible side by side, which is what makes it
// possible to check at a glance that two examples for the same concept are
// actually different rather than the same scenario reworded.
//
// This is NOT a parallel mechanism: it writes the same `entry.examples`
// field that the rotation in matching-engine.js already reads, in the same
// { he:[], en:[] } shape. The engine is untouched.
//
// Deliberately selective — examples are added where a worked scenario
// materially helps (a concept you have to SEE to understand), not to all 165
// entries. Definitional entries are left alone.
//
// Every example is explicitly hypothetical. No real company figures are
// presented as current market fact.
// ---------------------------------------------------------------------------
export const KB_EXAMPLES = {

  'moving-averages': {
    he:[`דוגמה היפותטית: מניה נסחרה סביב 100, ואז ירדה שלושה ימים ל-94. ממוצע 20 יום שלה עמד על 98 — כלומר המחיר ירד מתחת לממוצע הקצר, אבל ממוצע 200 יום עמד על 88 והמגמה הארוכה נשארה עולה. זה בדיוק המצב שבו שני ממוצעים שונים מספרים שני סיפורים: חולשה קצרת טווח בתוך מגמה ארוכה שעדיין שלמה.`,
        `דוגמה היפותטית שנייה, על אורך הממוצע: אותה מניה עם ממוצע 10 יום הייתה נחתכת על ידי המחיר 14 פעמים בחצי שנה; עם ממוצע 50 יום — רק 3 פעמים. הממוצע הקצר נותן יותר איתותים אבל גם יותר רעש. בחירת האורך היא בחירה בין רגישות ליציבות, לא בין "נכון" ל"לא נכון".`],
    en:[`Hypothetical example: a stock traded near 100, then fell for three days to 94. Its 20-day average sat at 98 — so price had dropped below the short average — while its 200-day average was at 88 and the long trend was still rising. This is exactly the case where two different averages tell two different stories: short-term weakness inside a long trend that is still intact.`,
        `A second hypothetical, about length: that same stock would have been cut by a 10-day average 14 times in six months, but by a 50-day average only 3 times. A shorter average gives more signals and also more noise. Choosing the length is choosing between sensitivity and stability, not between right and wrong.`]
  },

  'sma': {
    he:[`דוגמה היפותטית של החישוב: ממוצע 5 ימים על מחירי הסגירה 10, 12, 11, 13, 14 הוא (10+12+11+13+14)/5 = 12. למחרת נסגר 20: היום הראשון (10) יוצא מהחלון והחדש נכנס, ולכן הממוצע קופץ ל-(12+11+13+14+20)/5 = 14.`,
        `דוגמה היפותטית שנייה, שמראה את בעיית ה"קפיצה": ניקח את אותו ממוצע 5 ימים, אבל הפעם המחיר עומד יציב על 14 חמישה ימים ברציפות — והיום היוצא מהחלון הוא דווקא 10 חריג מלפני שבוע. הממוצע יעלה למרות שהיום עצמו לא זז בכלל. מה שהזיז את הקו הוא מחיר ישן שיצא, לא מידע חדש.`],
    en:[`Hypothetical calculation: a 5-day SMA over closes of 10, 12, 11, 13, 14 is (10+12+11+13+14)/5 = 12. The next day closes at 20: the oldest day (10) drops out of the window and the new one enters, so the average jumps to (12+11+13+14+20)/5 = 14.`,
        `A second hypothetical showing the "jump" problem: take that same 5-day average, but now price sits flat at 14 for five straight sessions — and the day leaving the window happens to be an unusual 10 from a week ago. The average will rise even though today's price did not move at all. What moved the line was an old price exiting, not new information.`]
  },

  'ema': {
    he:[`דוגמה היפותטית של ההבדל בפועל: מניה קפצה מ-50 ל-58 ביום אחד. ממוצע 20 יום פשוט יעלה בערך ב-(58-50)/20 = 0.4. ממוצע מעריכי באותו אורך, שנותן ליום האחרון משקל של כ-9.5%, יעלה בערך פי שניים מזה — הוא "הרגיש" את הקפיצה הרבה יותר חזק.`,
        `דוגמה היפותטית שנייה, לצד השני: באותה מניה, בשבועיים של תנועות של אחוז למעלה ואחוז למטה בלי כיוון, ה-EMA התפתל אחרי כל תנועה וייצר איתותי חצייה חוזרים, בזמן שה-SMA נשאר כמעט שטוח. אותה רגישות שעזרה בקפיצה הפכה כאן לחיסרון.`],
    en:[`Hypothetical example of the difference in practice: a stock jumps from 50 to 58 in one day. A 20-day SMA rises by roughly (58-50)/20 = 0.4. An EMA of the same length, which gives the latest day about 9.5% weight, rises roughly twice as much — it "felt" the jump far more strongly.`,
        `A second hypothetical, the other way: in that same stock, during two weeks of one-percent moves up and down with no direction, the EMA weaved after every move and produced repeated crossover signals while the SMA stayed almost flat. The same responsiveness that helped on the jump became a drawback here.`]
  },

  'support-resistance': {
    he:[`דוגמה היפותטית: מניה נעצרה שלוש פעמים סביב 120 בחודשים שונים ובכל פעם ירדה משם. האזור הזה הוא התנגדות — לא בגלל שיש שם משהו קסום במחיר, אלא כי מספיק משתתפים זוכרים אותו וממקמים שם פקודות מכירה. ככל שהאזור נבדק יותר פעמים, יותר אנשים שמים לב אליו.`,
        `דוגמה היפותטית שנייה, על היפוך תפקידים: אותה מניה סוף סוף סגרה מעל 120 ועלתה ל-131, ואז ירדה בחזרה ל-121 ונעצרה שם. מה שהיה תקרה הפך לרצפה. זה אחד הדפוסים הנפוצים ביותר — רמה שנשברה משנה תפקיד מהתנגדות לתמיכה.`],
    en:[`Hypothetical example: a stock stalled near 120 three separate times across different months and fell back each time. That area is resistance — not because anything magical exists at that price, but because enough participants remember it and place sell orders there. The more times an area is tested, the more people notice it.`,
        `A second hypothetical, on role reversal: that same stock finally closed above 120, ran to 131, then fell back to 121 and held. What had been a ceiling became a floor. This is one of the most common patterns — a broken level switches roles from resistance to support.`]
  },

  'trend': {
    he:[`דוגמה היפותטית: מניה עשתה שפל ב-40, שיא ב-52, שפל ב-46, שיא ב-58, שפל ב-51. כל שיא גבוה מקודמו וכל שפל גבוה מקודמו — זו ההגדרה המעשית של מגמת עלייה. שים לב שהיו בדרך ירידות; מגמה לא אומרת שהמחיר עולה כל יום.`,
        `דוגמה היפותטית שנייה, של שבירת מגמה: אותה מניה עלתה לשיא 61, ואז ירדה ל-49 — מתחת לשפל הקודם של 51. הפעם הראשונה שנוצר שפל נמוך יותר היא הסימן המוקדם שהמבנה השתנה, עוד לפני שהמגמה החדשה התבססה.`],
    en:[`Hypothetical example: a stock makes a low at 40, a high at 52, a low at 46, a high at 58, a low at 51. Every high is above the previous one and every low is above the previous one — that is the working definition of an uptrend. Note there were declines along the way; a trend does not mean price rises every day.`,
        `A second hypothetical, of a trend break: that same stock reached a high of 61, then fell to 49 — below its previous low of 51. The first time a lower low forms is the early sign that the structure has changed, before the new trend is established.`]
  },

  'breakout-retest': {
    he:[`דוגמה היפותטית: מניה דשדשה בין 70 ל-75 במשך חודשיים, ואז סגרה על 78 בנפח כפול מהממוצע — פריצה. שבוע אחר כך ירדה בחזרה ל-75.5, נגעה באזור הפריצה ועלתה משם. הירידה הזו היא הריטסט: המחיר חזר לבדוק אם התקרה הישנה מחזיקה עכשיו כרצפה.`,
        `דוגמה היפותטית שנייה, של פריצת שווא: אותה מניה סגרה יום אחד על 76.5 בנפח נמוך מהרגיל, ולמחרת כבר חזרה ל-73 — מתחת לטווח. כאן הריטסט נכשל: המחיר לא החזיק מעל האזור, ומה שנראה כמו פריצה היה תנועה זמנית ללא תמיכה של נפח.`],
    en:[`Hypothetical example: a stock ranged between 70 and 75 for two months, then closed at 78 on double its average volume — a breakout. A week later it fell back to 75.5, touched the breakout area, and rose from there. That pullback is the retest: price returned to check whether the old ceiling now holds as a floor.`,
        `A second hypothetical, of a false breakout: that same stock closed one day at 76.5 on below-average volume, and by the next session was back at 73 — under the range. Here the retest failed: price did not hold above the area, and what looked like a breakout was a temporary move with no volume behind it.`]
  },

  'fibonacci': {
    he:[`דוגמה היפותטית: מניה עלתה מ-50 ל-90 (תנועה של 40), ואז החלה לתקן. רמת 38.2% נמצאת ב-90 - (40 × 0.382) ≈ 74.7, ורמת 61.8% ב-90 - (40 × 0.618) ≈ 65.3. אלה האזורים שסוחרים יסמנו כנקודות עניין אפשריות לסיום התיקון.`,
        `דוגמה היפותטית שנייה, שמראה את בעיית נקודות העוגן: אילו היינו מודדים את אותה תנועה מ-54 במקום מ-50, התנועה היא 36 ורמת 61.8% יוצאת סביב 67.8 במקום 65.3. אותו גרף, שתי בחירות סבירות, ורמות שונות — זו הסובייקטיביות שמובנית בכלי.`],
    en:[`Hypothetical example: a stock rose from 50 to 90 (a 40-point move), then began to pull back. The 38.2% level sits at 90 - (40 × 0.382) ≈ 74.7, and the 61.8% level at 90 - (40 × 0.618) ≈ 65.3. These are the areas traders would mark as possible points where the pullback ends.`,
        `A second hypothetical showing the anchor problem: measuring that same move from 54 instead of 50 makes it a 36-point move, and the 61.8% level lands near 67.8 rather than 65.3. Same chart, two reasonable choices, different levels — that is the subjectivity built into the tool.`]
  },

  'rsi': {
    he:[`דוגמה היפותטית של הרעיון: אם בארבעה עשר הימים האחרונים מניה עלתה בממוצע 1.5% בימים החיוביים וירדה בממוצע 0.5% בימים השליליים, יחס העוצמה גבוה וה-RSI יהיה גבוה. RSI לא מודד כמה המניה שווה — הוא מודד את היחס בין גודל העליות לגודל הירידות בתקופה.`,
        `דוגמה היפותטית שנייה, שמראה למה זה לא איתות לבד: שתי מניות יכולות להציג בדיוק אותו RSI של 65 — אחת בתוך מגמת עלייה יציבה, והשנייה אחרי קפיצה חדה של יום אחד בתוך דשדוש ארוך. אותו מספר, שתי משמעויות שונות לגמרי. ההקשר של המבנה הוא מה שנותן למספר משמעות.`],
    en:[`Hypothetical example of the idea: if over the last fourteen sessions a stock gained an average of 1.5% on up days and lost an average of 0.5% on down days, the strength ratio is high and RSI will read high. RSI does not measure what a stock is worth — it measures the ratio between the size of gains and the size of losses over a period.`,
        `A second hypothetical showing why it is not a signal on its own: two stocks can print exactly the same RSI of 65 — one inside a steady uptrend, the other after a single sharp day inside a long sideways range. Same number, two completely different meanings. Structural context is what gives the number meaning.`]
  },

  'stop-loss': {
    he:[`דוגמה היפותטית: נכנסת לפוזיציה ב-100 ושמת סטופ ב-94, מתחת לאזור תמיכה שהחזיק פעמיים. ההפסד המקסימלי המתוכנן הוא 6% — החלטה שהתקבלה לפני שנכנסת, בזמן שהראש עוד צלול, ולא באמצע ירידה.`,
        `דוגמה היפותטית שנייה, של סטופ צמוד מדי: באותה מניה, סטופ ב-98.5 היה נפגע כבר למחרת מתנודה יומית רגילה — ואז המחיר עלה ל-112. הסטופ לא היה "שגוי" בגלל שהמניה עלתה; הוא היה שגוי כי מיקומו לא התחשב בתנודתיות הרגילה של המניה עצמה.`],
    en:[`Hypothetical example: you enter at 100 and set a stop at 94, below a support area that has held twice. Your planned maximum loss is 6% — a decision made before entering, while thinking clearly, rather than in the middle of a decline.`,
        `A second hypothetical, of a stop set too tight: in that same stock a stop at 98.5 would have been hit the very next day by ordinary daily noise — and price then went to 112. The stop was not "wrong" because the stock rose; it was wrong because its placement ignored the stock's normal volatility.`]
  },

  'take-profit': {
    he:[`דוגמה היפותטית: נכנסת ב-100 וקבעת מראש מימוש ב-118, בדיוק מתחת לאזור התנגדות שבו המניה נעצרה פעמיים בעבר. היעד נגזר ממבנה הגרף — לא מסכום עגול או מתחושה.`,
        `דוגמה היפותטית שנייה, של מימוש חלקי: באותה עסקה אפשר היה למכור חצי ב-112 ולהעביר את הסטופ של החצי הנותר לנקודת הכניסה. זה מנטרל את הסיכון בעסקה תוך שמירה על חשיפה להמשך — פשרה נפוצה בין "לצאת מוקדם מדי" ל"להחזיק עד שהרווח נמחק".`],
    en:[`Hypothetical example: you enter at 100 and pre-set an exit at 118, just under a resistance area where the stock stalled twice before. The target comes from chart structure — not from a round number or a feeling.`,
        `A second hypothetical, partial profit-taking: in that same trade you could sell half at 112 and move the stop on the remainder to your entry price. That removes the risk from the trade while keeping exposure to further upside — a common compromise between exiting too early and holding until the gain evaporates.`]
  },

  'risk-reward-ratio': {
    he:[`דוגמה היפותטית: כניסה ב-100, סטופ ב-95 (סיכון 5), יעד ב-115 (סיכוי 15). היחס הוא 15:5, כלומר 3:1. המשמעות המעשית: גם אם רק אחת משלוש עסקאות כאלה מצליחה, אתה בנקודת איזון.`,
        `דוגמה היפותטית שנייה, שמראה למה היחס לבדו לא מספיק: אותה עסקה עם יעד ב-160 נותנת יחס מרשים של 12:1 — אבל אם המחיר מעולם לא היה קרוב ל-160, היחס היפה נשען על יעד שכמעט לא ייפגש. יחס טוב על נייר שנשען על הנחה לא מציאותית שווה פחות מיחס צנוע וריאלי.`],
    en:[`Hypothetical example: entry at 100, stop at 95 (risking 5), target at 115 (seeking 15). The ratio is 15:5, i.e. 3:1. What that means practically: even if only one in three such trades works, you break even.`,
        `A second hypothetical showing why the ratio alone is not enough: the same trade with a target at 160 gives an impressive 12:1 — but if price has never been near 160, that attractive ratio rests on a target that will almost never be reached. A good ratio on paper built on an unrealistic assumption is worth less than a modest, realistic one.`]
  },

  'candlestick-patterns': {
    he:[`דוגמה היפותטית של דוג'י: מניה נפתחה ב-60, ירדה ל-57, עלתה ל-62, ונסגרה ב-60.1 — גוף כמעט אפסי עם צללים לשני הכיוונים. זה מתאר יום של חוסר הכרעה בין קונים למוכרים, ולא איתות כיוון בפני עצמו.`,
        `דוגמה היפותטית שנייה, של בליעה: ביום הראשון המניה ירדה מ-50 ל-48 (נר אדום), וביום השני נפתחה ב-47.5 ונסגרה ב-51 — גוף ירוק שמכסה לגמרי את הגוף האדום שלפניו. המשמעות מתחזקת כשזה קורה אחרי ירידה ממושכת ובנפח גבוה מהרגיל; אותו נר באמצע דשדוש אומר הרבה פחות.`],
    en:[`Hypothetical doji example: a stock opens at 60, dips to 57, rises to 62, and closes at 60.1 — an almost non-existent body with shadows both ways. That describes a session of indecision between buyers and sellers, not a directional signal on its own.`,
        `A second hypothetical, an engulfing pattern: on day one the stock falls from 50 to 48 (a red candle); on day two it opens at 47.5 and closes at 51 — a green body that fully covers the red one before it. The meaning strengthens when this happens after a sustained decline and on above-average volume; the same candle mid-range says far less.`]
  },

  'market-cap': {
    he:[`דוגמה היפותטית: חברה עם 50 מיליון מניות שנסחרת ב-40 לכל מניה שווה 50,000,000 × 40 = 2 מיליארד. זה שווי השוק — מה שהשוק מתמחר עבור כל החברה, לא מחיר המניה הבודדת.`,
        `דוגמה היפותטית שנייה, שמראה למה מחיר המניה לבדו חסר משמעות: חברה א' נסחרת ב-500 לכל מניה עם 2 מיליון מניות (שווי מיליארד), וחברה ב' נסחרת ב-5 עם 400 מיליון מניות (שווי 2 מיליארד). המניה ה"יקרה" שייכת דווקא לחברה הקטנה יותר.`],
    en:[`Hypothetical example: a company with 50 million shares trading at 40 each is worth 50,000,000 × 40 = 2 billion. That is market capitalisation — what the market prices the whole company at, not the price of a single share.`,
        `A second hypothetical showing why share price alone is meaningless: Company A trades at 500 per share with 2 million shares (1 billion total), while Company B trades at 5 with 400 million shares (2 billion total). The "expensive" stock belongs to the smaller company.`]
  }
};

// Attach to the existing entries. Never overwrites examples that were
// authored inline on an entry — those win, so a topic file stays the more
// specific source of truth for its own content.

export const entries = [];
