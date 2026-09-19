  // =========================================================================
  // FACET LAYER — focused sub-concepts
  //
  // The problem this solves: "מה זה צלב זהב?" could only ever return the
  // whole Moving Averages entry, because "golden cross" was just one keyword
  // among many on that broad entry. There was no way to be more specific
  // than a topic.
  //
  // A facet is an ordinary KB entry with two extra fields:
  //   parent : the broad topic it belongs to
  //   priority: makes it outrank that parent when its specific terms match
  //
  // That is the whole mechanism. It needs no new resolution pipeline: facets
  // compete in the same scorer as everything else, so a broad question
  // ("what are moving averages?") still matches only the parent and wins
  // there, while a specific question matches the facet's narrower terms and
  // the priority bonus carries it. Adding a new sub-concept later means
  // adding one object here — not touching the engine.
  //
  // `examples` feeds "give me another example": the follow-up rotates through
  // the list instead of repeating the first one. All examples are explicitly
  // hypothetical — no real company figures are presented as current fact.
  // `compares` marks a facet that exists specifically to contrast two ideas.
  // =========================================================================

export const KB_SUBCONCEPTS = [
  { id:'golden-cross', cat:'technical', parent:'moving-averages', priority:6,
    kw:['golden cross','goldencross','צלב זהב','גולדן קרוס','חציית ממוצעים למעלה'],
    he:`"צלב זהב" (Golden Cross) הוא הרגע שבו ממוצע נע קצר חוצה מלמטה למעלה ממוצע נע ארוך — הצירוף הנפוץ ביותר הוא ממוצע 50 יום שחוצה מעל ממוצע 200 יום. הרעיון מאחוריו: המחיר הממוצע בטווח הקצר הפך גבוה מהמחיר הממוצע בטווח הארוך, כלומר המומנטום האחרון חזק יותר מהמגמה הרחבה, וזה נתפס לרוב כאישור שמגמת עלייה מתבססת.\n\nשלוש הסתייגויות שחשוב להכיר: ראשית, זהו איתות מאחר מטבעו — ממוצעים מחושבים על העבר, ולכן הצלב מופיע רק אחרי שחלק ניכר מהתנועה כבר קרה. שנית, בשוק דשדוש (ללא מגמה ברורה) ממוצעים נחתכים שוב ושוב וייצרו איתותי שווא. שלישית, הוא לא אומר דבר על עוצמת התנועה — סוחרים רבים בודקים אותו יחד עם נפח מסחר או אינדיקטור מומנטום ולא כאיתות עצמאי.`,
    en:`A "golden cross" is the moment a shorter moving average crosses up through a longer one — most commonly the 50-day crossing above the 200-day. The logic: the recent average price has risen above the long-run average price, meaning near-term momentum is now stronger than the broad trend, which is widely read as confirmation that an uptrend is establishing itself.\n\nThree caveats worth knowing. First, it is a lagging signal by construction — moving averages are computed from past prices, so the cross only appears after a good part of the move has already happened. Second, in a sideways, trendless market the averages cross back and forth repeatedly and generate false signals. Third, it says nothing about the strength of the move — many traders check it alongside volume or a momentum indicator rather than treating it as a standalone trigger.`,
    examples:{
      he:[`דוגמה היפותטית: מניה נסחרה חודשים סביב 80–90. ממוצע 50 יום שלה עמד על 84 וממוצע 200 יום על 88. אחרי רצף עליות הממוצע הקצר טיפס ל-91 וחצה מעל הארוך שנשאר ב-89 — זהו צלב זהב. שים לב שהמחיר עצמו כבר היה סביב 96 באותו רגע: האיתות אישר תנועה שכבר החלה.`,
           `דוגמה היפותטית שנייה, בקנה מידה אחר: מדד רחב עלה 6% בשישה שבועות אחרי תקופת דשדוש ארוכה. ממוצע 50 יום חצה מעל ממוצע 200 יום בזמן שהנפח היה מעל הממוצע — צירוף שנחשב אמין יותר מצלב זהב שמתרחש בנפח דליל, שבו הסיכוי לחציה חוזרת ומיידית גבוה יותר.`],
      en:[`Hypothetical example: a stock traded between 80 and 90 for months. Its 50-day average sat at 84 and its 200-day at 88. After a run of higher closes the short average climbed to 91 and crossed above the long one at 89 — that is a golden cross. Note the price itself was already near 96 by then: the signal confirmed a move that had already begun.`,
          `A second hypothetical at a different scale: a broad index rose 6% over six weeks after a long flat stretch. Its 50-day crossed above its 200-day while volume was running above average — a combination considered more reliable than a golden cross that happens on thin volume, where an immediate cross back down is more likely.`]
    },
    related:['death-cross','moving-averages'] },

  { id:'death-cross', cat:'technical', parent:'moving-averages', priority:6,
    kw:['death cross','deathcross','צלב מוות','דת קרוס','חציית ממוצעים למטה'],
    he:`"צלב מוות" (Death Cross) הוא התמונה ההפוכה לצלב זהב: ממוצע נע קצר חוצה מלמעלה למטה ממוצע נע ארוך — לרוב ממוצע 50 יום שיורד מתחת לממוצע 200 יום. המשמעות: המחיר הממוצע בטווח הקצר ירד מתחת לממוצע ארוך הטווח, כלומר החולשה האחרונה עמוקה מספיק כדי למשוך את הממוצע הקצר אל מתחת למגמה הרחבה.\n\nכמו הצלב ההפוך, גם כאן זהו איתות מאחר — עד שהוא מופיע, ירידה משמעותית כבר התרחשה. היסטורית הוא סימן לעיתים תחילת ירידה ממושכת, ולעיתים דווקא הופיע קרוב לתחתית, ממש לפני התאוששות. לכן רוב הסוחרים מתייחסים אליו כאל תיאור של מצב המגמה, לא כתחזית.`,
    en:`A "death cross" is the mirror image of a golden cross: a shorter moving average crossing down through a longer one — typically the 50-day falling below the 200-day. It means the recent average price has dropped beneath the long-run average, i.e. recent weakness has been deep enough to pull the short average under the broad trend.\n\nLike its opposite, it is a lagging signal — by the time it appears, a significant decline has already happened. Historically it has sometimes marked the start of an extended downturn, and sometimes appeared near a bottom, just before a recovery. Most traders therefore treat it as a description of the trend's current state rather than a forecast.`,
    examples:{
      he:[`דוגמה היפותטית: מניה ירדה מ-120 ל-95 במשך שלושה חודשים. ממוצע 50 יום ירד מ-115 ל-101, בעוד ממוצע 200 יום ירד לאט יותר מ-108 ל-104. כשהקצר עבר מתחת לארוך — זהו צלב מוות. המחיר כבר איבד כ-20% עד לרגע האיתות.`,
           `דוגמה היפותטית שנייה, שמראה את מצב הכישלון: מניה צנחה חדות על רקע ידיעה שלילית אחת, הציגה צלב מוות שלושה שבועות אחר כך, ואז החזירה את כל ההפסד בחודש שלאחר מכן. הצלב תיאר איפה המחיר היה, לא לאן הוא הולך — ולכן מתייחסים אליו כאישור למגמה קיימת ולא כתחזית.`],
      en:[`Hypothetical example: a stock fell from 120 to 95 over three months. Its 50-day average slid from 115 to 101 while the slower 200-day drifted from 108 to 104. When the short average passed below the long one, that was a death cross — the price had already given up roughly 20% by the time the signal appeared.`,
          `A second hypothetical, showing the failure mode: a stock dropped sharply on one piece of bad news, printed a death cross three weeks later, and then recovered its entire loss over the following month. The cross described where price had been, not where it was going — which is why it is treated as confirmation of an existing trend rather than a forecast.`]
    },
    related:['golden-cross','moving-averages'] },

  { id:'sma', cat:'technical', parent:'moving-averages', priority:6,
    kw:['sma','simple moving average','ממוצע נע פשוט','אס אם איי','ממוצע פשוט'],
    he:`SMA (Simple Moving Average — ממוצע נע פשוט) הוא הממוצע החשבוני הרגיל של מחירי הסגירה על פני מספר קבוע של ימים. ממוצע 20 יום, למשל, מחבר את 20 מחירי הסגירה האחרונים ומחלק ב-20; כל יום חדש נכנס והישן ביותר יוצא.\n\nהמאפיין המרכזי שלו: כל יום מקבל בדיוק אותו משקל. יום הסגירה של אתמול וזה של לפני 20 יום משפיעים באותה מידה. התוצאה היא קו חלק ויציב שמסנן רעש היטב, אבל מגיב לאט לשינוי — במיוחד כשמחיר חריג יוצא מהחלון, הממוצע יכול "לקפוץ" בלי שקרה משהו מיוחד היום.`,
    en:`SMA (Simple Moving Average) is the ordinary arithmetic average of closing prices over a fixed number of sessions. A 20-day SMA adds the last 20 closes and divides by 20; each new day enters the window and the oldest one drops out.\n\nIts defining property: every day carries exactly the same weight. Yesterday's close and the close from 20 days ago influence the line equally. That produces a smooth, stable curve that filters noise well but reacts slowly to change — and notably, when an unusual old price finally exits the window, the average can "jump" even though nothing remarkable happened today.`,
    related:['ema','sma-vs-ema','moving-averages'] },

  { id:'ema', cat:'technical', parent:'moving-averages', priority:6,
    kw:['ema','exponential moving average','ממוצע נע מעריכי','ממוצע מעריכי','אי אם איי'],
    he:`EMA (Exponential Moving Average — ממוצע נע מעריכי) הוא ממוצע נע שנותן משקל גדול יותר לימים האחרונים ומשקל הולך וקטן לימים רחוקים יותר, במקום לשקלל את כולם באופן שווה. המשקל דועך באופן מעריכי — מכאן השם.\n\nהתוצאה המעשית: ה-EMA "מקשיב" יותר למה שקורה עכשיו, ולכן מסתובב מהר יותר אחרי שינוי כיוון מאשר SMA באותו אורך. זה יתרון כשרוצים לזהות תפנית מוקדם, וחיסרון כשהשוק רועש — הוא ייתן יותר איתותי שווא. בניגוד ל-SMA, מחיר ישן אף פעם לא "נופל" לגמרי מהחישוב; השפעתו רק הולכת ומתאפסת.`,
    en:`EMA (Exponential Moving Average) is a moving average that gives more weight to recent sessions and progressively less to older ones, instead of weighting them all equally. The weighting decays exponentially — hence the name.\n\nThe practical effect: an EMA "listens" more closely to what is happening now, so it turns faster after a change of direction than an SMA of the same length. That is an advantage when you want to catch a turn early, and a disadvantage in a noisy market, where it produces more false signals. Unlike an SMA, an old price never fully drops out of the calculation; its influence just fades toward zero.`,
    related:['sma','sma-vs-ema','moving-averages'] },

  { id:'sma-vs-ema', cat:'technical', parent:'moving-averages', priority:8,
    compares:['sma','ema'],
    kw:['sma vs ema','ema vs sma','difference between sma and ema','sma or ema',
        'ההבדל בין sma ל ema','ההבדל בין ממוצע פשוט למעריכי','sma או ema','מה עדיף sma או ema','ההבדל בין ema ל sma'],
    he:`ההבדל היחיד בין SMA ל-EMA הוא איך הם משקללים את העבר — וכל שאר ההבדלים נובעים מזה.\n\nSMA נותן לכל יום בחלון משקל זהה. EMA נותן משקל גדול יותר לימים קרובים, שדועך מעריכית ככל שמתרחקים.\n\nמה זה אומר בפועל:\n· תגובתיות — EMA מסתובב מהר יותר אחרי תפנית; SMA מפגר אחריו.\n· רעש — בדיוק מאותה סיבה, EMA ייתן יותר איתותי שווא בשוק מדשדש, ו-SMA יסנן אותם טוב יותר.\n· "קפיצות" — ב-SMA מחיר חריג שיוצא מהחלון עלול להזיז את הקו בלי סיבה עדכנית; ב-EMA השפעתו כבר דעכה בהדרגה.\n\nאין "עדיף" מוחלט: לזיהוי תפניות מוקדם נוטים ל-EMA, לתיאור מגמה רחבה ויציבה נוטים ל-SMA. ממוצע 200 יום, למשל, מקובל דווקא כ-SMA.`,
    en:`The only real difference between an SMA and an EMA is how they weight the past — every other difference follows from that.\n\nAn SMA gives every day in its window equal weight. An EMA weights recent days more heavily, decaying exponentially as you go back.\n\nWhat that means in practice:\n· Responsiveness — an EMA turns faster after a reversal; an SMA lags behind it.\n· Noise — for exactly the same reason, an EMA produces more false signals in a choppy market, while an SMA filters them better.\n· "Jumps" — with an SMA, an unusual old price leaving the window can move the line for no current reason; with an EMA that influence has already faded gradually.\n\nNeither is universally better: traders lean on EMAs to catch turns early, and on SMAs to describe a broad, stable trend. The widely-watched 200-day average, for instance, is conventionally an SMA.`,
    examples:{
      he:[`דוגמה היפותטית: מניה דשדשה סביב 50 ואז קפצה ל-58 תוך שלושה ימים. ממוצע 20 יום מעריכי (EMA) עלה מ-50.2 ל-52.1, בעוד הממוצע הפשוט (SMA) באותו אורך עלה רק מ-50.1 ל-51.0 — ה-EMA 'הרגיש' את הקפיצה מהר יותר כי הימים האחרונים קיבלו משקל גדול יותר.`,
          `דוגמה היפותטית שנייה, לצד השני של המטבע: באותה מניה, בשבועיים של תנודתיות ללא כיוון, ה-EMA חצה את המחיר שבע פעמים ואילו ה-SMA רק פעמיים. אותה תגובתיות שעזרה בקפיצה הפכה כאן לרעש.`],
      en:[`Hypothetical example: a stock chopped around 50, then jumped to 58 in three days. Its 20-day EMA rose from 50.2 to 52.1, while the SMA of the same length moved only from 50.1 to 51.0 — the EMA \"felt\" the jump sooner because recent days carry more weight.`,
          `A second hypothetical, showing the other side: in the same stock, during two weeks of directionless chop, the EMA crossed price seven times while the SMA crossed only twice. The same responsiveness that helped on the jump became noise here.`]
    },
    related:['sma','ema'] },

  { id:'fibonacci-limitations', cat:'technical', parent:'fibonacci', priority:8,
    kw:['fibonacci limitations','fibonacci disadvantages','problems with fibonacci','fibonacci criticism','downside of fibonacci',
        "החסרונות של פיבונאצ'י","חסרונות פיבונאצ'י","הבעיות עם פיבונאצ'י","למה פיבונאצ'י לא עובד","ביקורת על פיבונאצ'י","מגבלות פיבונאצ'י"],
    he:`המגבלות המרכזיות של פיבונאצ'י — לא הסבר כללי על הכלי, אלא מה שחשוב לדעת לפני שסומכים עליו:\n\n· סובייקטיביות בבחירת הנקודות. הרמות נגזרות מבחירת שיא ושפל, ושני אנשים יבחרו נקודות שונות על אותו גרף ויקבלו רמות שונות לגמרי. אין "נכון" אובייקטיבי.\n· ריבוי רמות. עם 23.6%, 38.2%, 50%, 61.8% ו-78.6%, כמעט כל נסיגה נוחתת קרוב לאחת מהן. זה הופך את הכלי לקשה להפרכה — תמיד אפשר לומר בדיעבד "הוא כיבד רמה".\n· היעדר בסיס סיבתי. אין מנגנון שוק שמסביר למה דווקא 61.8%. ההשפעה, ככל שקיימת, מיוחסת בעיקר לכך שהרבה משתתפים מסתכלים על אותן רמות — נבואה שמגשימה את עצמה, לא חוק.\n· 50% היא בכלל לא יחס פיבונאצ'י. היא נכללת מסורתית, אבל לא נגזרת מהסדרה.\n· חולשה בשווקים תנודתיים. כשאין מגמה ברורה, הרמות מאבדות משמעות והמחיר חוצה אותן ללא תגובה.\n\nהמסקנה המקובלת: להתייחס לרמות כאזורי עניין שכדאי לבדוק לצידם אישור נוסף (נפח, מבנה מחיר), ולא כנקודות החלטה בפני עצמן.`,
    en:`The main limitations of Fibonacci retracements — not a general explanation of the tool, but what matters before relying on it:\n\n· Subjective anchor points. The levels are derived from a chosen swing high and low, and two people will pick different points on the same chart and get entirely different levels. There is no objectively correct choice.\n· Too many levels. With 23.6%, 38.2%, 50%, 61.8% and 78.6%, almost any pullback lands near one of them. That makes the tool hard to falsify — after the fact you can nearly always say price "respected a level".\n· No causal basis. There is no market mechanism explaining why 61.8% specifically should matter. Whatever effect exists is mostly attributed to many participants watching the same levels — a self-fulfilling convention, not a law.\n· 50% is not even a Fibonacci ratio. It is included by tradition but is not derived from the sequence.\n· Weak in choppy markets. Without a clear trend the levels lose meaning and price cuts through them without reacting.\n\nThe common conclusion: treat the levels as areas of interest to check alongside other confirmation (volume, price structure), not as decision points on their own.`,
    related:['fibonacci'] },

  { id:'fibonacci-extensions', cat:'technical', parent:'fibonacci', priority:7,
    // Target-oriented phrasing is the natural way people ask about
    // extensions ("where's the target?"), so those terms live here as
    // ordinary keywords. They are all scoped to Fibonacci or to extension
    // wording — a bare "target" is intentionally NOT claimed, since that
    // would hijack unrelated questions.
    kw:['fibonacci extension','fibonacci extensions','fib extension','161.8','127.2','261.8',
        'extension target','fibonacci target','fibonacci targets','fib target','price target fibonacci',
        'fibonacci price target','extension level','extension levels',
        "הרחבות פיבונאצ'י","הרחבת פיבונאצ'י","אקסטנשן פיבונאצ'י","פיבונאצ'י הרחבה","יעדי פיבונאצ'י",
        "יעד פיבונאצ'י","יעד מחיר פיבונאצ'י","רמות הרחבה","רמת הרחבה","יעדי הרחבה","יעד הרחבה",
        "היעד של פיבונאצ'י","היעדים של פיבונאצ'י","מה היעד של פיבונאצ'י","עד לאן פיבונאצ'י"],
    he:`הרחבות פיבונאצ'י (Extensions) הן ההמשך של הרעיון מעבר ל-100%: בעוד רמות הנסיגה (Retracement) מנסות לתאר עד כמה מחיר עשוי לתקן בתוך תנועה קיימת, ההרחבות מנסות לתאר עד לאן הוא עשוי להגיע אחרי שהתיקון הסתיים והמגמה חידשה.\n\nהרמות הנפוצות הן 127.2%, 161.8% ו-261.8%, נמדדות מהתנועה המקורית. השימוש העיקרי הוא כאזורי יעד אפשריים למימוש רווח, ולא כנקודות כניסה.\n\nאותן הסתייגויות של הכלי המקורי חלות כאן ביתר שאת: ההרחבות רגישות עוד יותר לבחירת נקודות העוגן, והן מתארות יעד תיאורטי — לא תחזית. רוב המשתמשים משלבים אותן עם רמות התנגדות היסטוריות כדי לראות היכן שתי שיטות שונות מצביעות על אותו אזור.`,
    en:`Fibonacci extensions carry the idea past 100%: where retracement levels try to describe how far price might pull back within an existing move, extensions try to describe how far it might travel after that pullback ends and the trend resumes.\n\nThe common levels are 127.2%, 161.8% and 261.8%, measured from the original move. They are used mainly as possible profit-taking target zones rather than as entry points.\n\nThe caveats of the underlying tool apply here even more strongly: extensions are still more sensitive to the chosen anchor points, and they describe a theoretical target, not a forecast. Most users combine them with historical resistance levels to see where two different methods point at the same area.`,
    examples:{
      he:[`דוגמה היפותטית: מניה עלתה מ-40 ל-60 (תנועה של 20), ואז תיקנה ל-52. רמת הרחבה של 161.8% נמדדת מהתנועה המקורית ונותנת יעד סביב 52 + (20 × 1.618) ≈ 84. זהו אזור יעד אפשרי למימוש, לא תחזית — וסוחרים יבדקו אם יש שם גם התנגדות היסטורית.`,
          `דוגמה היפותטית שנייה, שמראה את הרגישות לנקודות העוגן: אילו היינו מודדים את אותה מניה מ-44 (ולא מ-40), התנועה היא 16 והיעד ב-161.8% יוצא סביב 78 במקום 84 — פער של 7% שנובע רק מבחירת נקודת ההתחלה.`],
      en:[`Hypothetical example: a stock rose from 40 to 60 (a 20-point move), then pulled back to 52. The 161.8% extension is measured from the original move, giving a target near 52 + (20 × 1.618) ≈ 84. That is a possible profit-taking zone, not a forecast — traders would also check whether historical resistance sits there.`,
          `A second hypothetical, showing how sensitive this is to the anchors: measuring the same stock from 44 instead of 40 makes the move 16, and the 161.8% target lands near 78 rather than 84 — a 7% difference produced purely by the choice of starting point.`]
    },
    related:['fibonacci','take-profit'] },

  { id:'rsi-overbought', cat:'technical', parent:'rsi', priority:8,
    kw:['rsi above 70','rsi over 70','overbought','rsi overbought','what does rsi above 70 mean',
        'rsi מעל 70','קניית יתר','מה זה קניית יתר','rsi גבוה','משמעות rsi מעל 70'],
    he:`RSI מעל 70 נקרא "קניית יתר" (Overbought), ומשמעותו צרה יותר משנהוג לחשוב: הוא אומר שהעליות האחרונות היו גדולות ומהירות ביחס לירידות באותה תקופה. זו אמירה על קצב התנועה — לא על שווי, ולא תחזית שהמחיר עומד לרדת.\n\nהטעות הנפוצה היא לקרוא את זה כאיתות מכירה. במגמת עלייה חזקה RSI יכול להישאר מעל 70 שבועות ארוכים בזמן שהמחיר ממשיך לעלות; מכירה בכל פעם שהוא חוצה 70 היא דרך מוכרת לצאת ממגמה טובה מוקדם מדי.\n\nמה שכן נהוג לעשות עם זה: להתייחס אליו כאל דגל שמצדיק בדיקה נוספת — האם הנפח תומך בעלייה, האם יש דיברגנס (המחיר עושה שיא חדש אך RSI לא), והאם המחיר מתקרב לאזור התנגדות. בשוק מדשדש הסף הזה משמעותי יותר מאשר במגמה חזקה.`,
    en:`An RSI above 70 is called "overbought", and it means something narrower than people usually assume: recent gains have been large and fast relative to recent losses. That is a statement about the pace of the move — not about value, and not a prediction that price is about to fall.\n\nThe common mistake is reading it as a sell signal. In a strong uptrend RSI can stay above 70 for weeks while price keeps climbing; selling every time it crosses 70 is a well-known way to exit a good trend far too early.\n\nWhat it is normally used for: treating it as a flag that justifies a closer look — is volume supporting the move, is there divergence (price making a new high while RSI does not), and is price approaching a resistance area. The threshold carries more weight in a range-bound market than in a strong trend.`,
    examples:{
      he:[`דוגמה היפותטית: מניה עלתה 18% בשבועיים וה-RSI שלה הגיע ל-78. זה לא אמר שהיא יקרה — רק שהעליות האחרונות היו מהירות. היא המשיכה לעלות עוד 9% לפני שתיקנה, בזמן שה-RSI נשאר מעל 70 לאורך כל התקופה.`,
          `דוגמה היפותטית שנייה, שבה הדגל כן היה משמעותי: מניה הגיעה ל-RSI 74 בדיוק באזור התנגדות היסטורי, ובמקביל עשתה שיא מחיר חדש בזמן שה-RSI עשה שיא נמוך יותר (דיברגנס שלילי). הצירוף של שלושת הדברים — ולא ה-RSI לבדו — הוא מה שהצדיק זהירות.`],
      en:[`Hypothetical example: a stock rose 18% in two weeks and its RSI reached 78. That did not mean it was expensive — only that recent gains had been fast. It went on to climb another 9% before pulling back, with RSI staying above 70 the whole time.`,
          `A second hypothetical where the flag did matter: a stock hit an RSI of 74 right at a historical resistance area, and at the same time made a new price high while RSI made a lower high (negative divergence). It was the combination of all three — not the RSI alone — that justified caution.`]
    },
    related:['rsi-oversold','divergence','rsi'] },

  { id:'rsi-oversold', cat:'technical', parent:'rsi', priority:8,
    kw:['rsi below 30','rsi under 30','oversold','rsi oversold',
        'rsi מתחת ל-30','rsi מתחת ל 30','מכירת יתר','מה זה מכירת יתר','rsi נמוך'],
    he:`RSI מתחת ל-30 נקרא "מכירת יתר" (Oversold): הירידות האחרונות היו גדולות ומהירות ביחס לעליות. שוב — אמירה על הקצב, לא על השווי, ולא הבטחה להתאוששות.\n\nהטעות המקבילה לצד הזה מסוכנת אף יותר: לקנות רק משום ש-RSI נמוך. במגמת ירידה ממושכת RSI יכול להישאר מתחת ל-30 זמן רב בזמן שהמחיר ממשיך לרדת — "זול" יכול להיות זול יותר. מניה בקריסה אמיתית כמעט תמיד תיראה "מכירת יתר" בדרך למטה.\n\nהשימוש המקובל דומה לצד ההפוך: דגל לבדיקה, שמשמעותי יותר כשהמחיר מגיע לאזור תמיכה מוכר, כשהנפח מתחיל להתייצב, או כשמופיע דיברגנס חיובי (המחיר עושה שפל חדש אך RSI לא).`,
    en:`An RSI below 30 is called "oversold": recent declines have been large and fast relative to recent gains. Again — a statement about pace, not value, and not a promise of a bounce.\n\nThe mirror mistake is more dangerous on this side: buying purely because RSI is low. In a sustained downtrend RSI can sit below 30 for a long time while price keeps falling — "cheap" can get cheaper. A stock in a genuine collapse will look oversold most of the way down.\n\nThe accepted use mirrors the other side: a flag worth investigating, which carries more weight when price reaches a known support area, when volume begins to settle, or when positive divergence appears (price making a new low while RSI does not).`,
    examples:{
      he:[`דוגמה היפותטית: מניה ירדה שישה ימים ברציפות, וה-RSI שלה ירד ל-24. היא הגיעה בדיוק לאזור תמיכה שהחזיק פעמיים בעבר, והנפח החל להצטמצם. הצירוף הזה — מכירת יתר + תמיכה מוכרת + התייצבות נפח — הוא מה שסוחרים מחפשים, ולא ה-RSI הנמוך לבדו.`,
          `דוגמה היפותטית שנייה, של מלכודת: מניה במגמת ירידה ממושכת הציגה RSI מתחת ל-30 במשך שבעה שבועות רצופים בזמן שהמחיר המשיך לרדת מ-60 ל-38. כל קנייה שהתבססה רק על 'הוא במכירת יתר' הייתה מוקדמת — במגמה חזקה האינדיקטור יכול להישאר קיצוני לאורך זמן.`],
      en:[`Hypothetical example: a stock fell six sessions in a row and its RSI dropped to 24. It arrived exactly at a support area that had held twice before, and volume began to contract. That combination — oversold plus known support plus settling volume — is what traders look for, not the low RSI on its own.`,
          `A second hypothetical, showing the trap: a stock in a sustained downtrend printed an RSI below 30 for seven consecutive weeks while price kept sliding from 60 to 38. Any purchase based only on \"it is oversold\" was early — in a strong trend the indicator can stay extreme for a long time.`]
    },
    related:['rsi-overbought','divergence','rsi'] },

  { id:'take-profit-vs-stop-loss', cat:'risk', parent:'risk-reward-ratio', priority:9,
    compares:['take-profit','stop-loss'],
    kw:['take profit vs stop loss','stop loss vs take profit','difference between stop loss and take profit',
        'ההבדל בין סטופ לוס לטייק פרופיט','ההבדל בין טייק פרופיט לסטופ לוס','סטופ לוס מול טייק פרופיט','טייק פרופיט מול סטופ לוס'],
    he:`שניהם פקודות יציאה שנקבעות מראש, והם תמונת ראי זה של זה:\n\n· סטופ לוס יוצא בהפסד — הוא מגדיר כמה אתה מוכן להפסיד אם הרעיון לא עבד, ותפקידו להגביל נזק.\n· טייק פרופיט יוצא ברווח — הוא מגדיר איפה אתה מממש, ותפקידו למנוע מרווח קיים להתאדות.\n\nההבדל האמיתי הוא פסיכולוגי: סטופ לוס נועד להתגבר על הנטייה להחזיק מפסידים ולקוות; טייק פרופיט נועד להתגבר על החמדנות ועל הנטייה לרדוף אחרי עוד קצת.\n\nהם מקבלים משמעות מלאה רק ביחד — היחס בין המרחק לטייק פרופיט למרחק לסטופ לוס הוא בדיוק יחס סיכון־סיכוי. סטופ צמוד מדי ייסגר על רעש רגיל; טייק פרופיט רחוק מדי כמעט לא ייפגש. שניהם נקבעים לפי מבנה הגרף (תמיכה, התנגדות, תנודתיות) ולא לפי סכום שרירותי שנוח לך.`,
    en:`Both are pre-set exit orders, and they are mirror images of each other:\n\n· A stop loss exits at a loss — it defines how much you are willing to lose if the idea does not work, and its job is to cap damage.\n· A take profit exits at a gain — it defines where you cash in, and its job is to stop an existing profit from evaporating.\n\nThe real difference is psychological: a stop loss exists to override the urge to hold losers and hope; a take profit exists to override greed and the urge to chase a little more.\n\nThey only make full sense together — the distance to your take profit divided by the distance to your stop loss is exactly the risk-reward ratio. A stop set too tight gets hit by ordinary noise; a take profit set too far is rarely reached. Both should be placed from chart structure (support, resistance, volatility), not from an arbitrary amount that feels comfortable.`,
    related:['take-profit','stop-loss','risk-reward-ratio'] }
];


export const entries = KB_SUBCONCEPTS;
