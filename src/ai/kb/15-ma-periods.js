// ---------------------------------------------------------------------------
// Period-specific moving averages.
//
// "ממוצע 150" and "ממוצע 20" are different questions with different answers,
// but a single moving-averages entry can only give one generic reply. This
// module holds one explanation per common period, selected by the number the
// user actually typed. 20 / 50 / 150 get the fullest treatment, since those
// are the ones that come up most and carry the most nuance.
// ---------------------------------------------------------------------------
const MA_PERIODS = {
  9: {
    he:`ממוצע נע 9 הוא ממוצע קצר מאוד — הוא מגיב כמעט מיד לכל תנועת מחיר, ולכן משמש בעיקר במסחר יומי ובטווחים קצרים מאוד. היתרון שלו הוא מהירות: הוא "מדביק" שינוי מגמה לפני כל ממוצע ארוך יותר. החיסרון הוא רעש — הוא נחתך עם המחיר שוב ושוב גם בתנועות חסרות משמעות, ולכן כמעט אף אחד לא משתמש בו לבדו כאות כניסה. לרוב רואים אותו בשילוב עם ממוצע 21 כצמד מהיר לזיהוי מומנטום קצר.`,
    en:`The 9-period moving average is very short — it reacts almost immediately to any price move, so it's mainly used in day trading and very short timeframes. Its advantage is speed: it picks up a change in direction before any longer average does. Its drawback is noise — price crosses it repeatedly on moves that mean nothing, which is why almost nobody uses it alone as an entry signal. It's usually seen paired with the 21 as a fast duo for reading short-term momentum.`
  },
  20: {
    he:`ממוצע נע 20 מייצג בערך חודש מסחר אחד (20 ימי מסחר), והוא הממוצע ה"קצר" הסטנדרטי שרוב הסוחרים עוקבים אחריו. תפקידו המרכזי: לתאר את המגמה הקצרה ולשמש תמיכה דינמית. במגמת עלייה בריאה וחזקה, המחיר נוטה לרדת אל אזור ממוצע 20 ולהתהפך שם כלפי מעלה — זו אחת התבניות הנפוצות ביותר ב"קניית נסיגה" (Buy the Pullback). כשמחיר נשבר מתחת לממוצע 20 ונשאר שם, זה בדרך כלל הרמז הראשון שהמומנטום הקצר נחלש — אבל לא בהכרח שהמגמה הגדולה התהפכה, כי לשם בודקים ממוצעים ארוכים יותר. הרבה סוחרים משתמשים ב-EMA 20 (אקספוננציאלי) ולא ב-SMA, כדי שיגיב מהר יותר. חשוב: ממוצע 20 נשבר הרבה מאוד פעמים בתנודתיות רגילה, ולכן הוא אות חלש בפני עצמו וצריך אישור מנפח או ממבנה המחיר.`,
    en:`The 20-period moving average represents roughly one trading month (20 sessions), and it's the standard "short" average most traders watch. Its main role: describing the short-term trend and acting as dynamic support. In a healthy, strong uptrend, price tends to pull back toward the 20 and turn back up there — one of the most common "buy the pullback" patterns. When price breaks below the 20 and stays there, that's usually the first hint short-term momentum is weakening — though not necessarily that the larger trend has reversed, which is what the longer averages are for. Many traders use the 20 EMA (exponential) rather than SMA so it reacts faster. Important: the 20 gets broken very often on ordinary volatility, so on its own it's a weak signal and needs confirmation from volume or price structure.`
  },
  50: {
    he:`ממוצע נע 50 מייצג בערך רבעון מסחר (כ-2.5 חודשים), והוא ה"קו האמצע" הקלאסי — מספיק ארוך כדי לסנן רעש יומי, ומספיק קצר כדי להגיב לשינוי מגמה בתוך זמן סביר. זהו כנראה הממוצע הנצפה ביותר בקרב סוחרי סווינג. תפקידו המרכזי: להגדיר את המגמה הבינונית. מחיר מעל ממוצע 50 = מגמה בינונית חיובית; מתחת = שלילית. הוא משמש הרבה כתמיכה דינמית במגמות עולות — הרבה יותר משמעותית מממוצע 20, כי נדרשת חולשה אמיתית כדי לשבור אותו. שני הצלבים המפורסמים מוגדרים דרכו: כשממוצע 50 חוצה מעל ממוצע 200 זה "צלב זהב" (Golden Cross), וכשהוא חוצה מתחתיו זה "צלב מוות" (Death Cross). חשוב לדעת: שני הצלבים האלה הם אותות מאחרים מאוד — הם מתרחשים הרבה אחרי שהמהלך כבר התחיל, ולכן הם יותר תיאור של מה שקרה מאשר תחזית.`,
    en:`The 50-period moving average represents roughly a trading quarter (about 2.5 months), and it's the classic "middle line" — long enough to filter out daily noise, short enough to respond to a trend change within a reasonable time. It's probably the most-watched average among swing traders. Its main role: defining the intermediate trend. Price above the 50 = intermediate uptrend; below = downtrend. It's widely used as dynamic support in uptrends — considerably more meaningful than the 20, since real weakness is needed to break it. The two famous crosses are defined through it: when the 50 crosses above the 200 it's a "golden cross," and when it crosses below it's a "death cross." Worth knowing: both are heavily lagging signals — they occur long after the move has already begun, so they describe what happened more than they predict what's next.`
  },
  100: {
    he:`ממוצע נע 100 יושב בין ממוצע 50 לממוצע 200, ומתאר מגמה של כחצי שנה. הוא פחות נפוץ משני שכניו, ולכן גם פחות "נצפה" על ידי השוק — מה שמקטין את אפקט הציפייה העצמית שמעניק לממוצעים המפורסמים חלק מהכוח שלהם. יש סוחרים שמשתמשים בו כרמת תמיכה משנית: אם ממוצע 50 נשבר, ממוצע 100 הוא התחנה הבאה לפני ממוצע 200.`,
    en:`The 100-period moving average sits between the 50 and the 200, describing roughly a six-month trend. It's less commonly used than either neighbour, and therefore less widely watched — which reduces the self-fulfilling expectation effect that gives the more famous averages part of their power. Some traders use it as a secondary support level: if the 50 breaks, the 100 is the next stop before the 200.`
  },
  150: {
    he:`ממוצע נע 150 מייצג בערך 7-8 חודשי מסחר, והוא ממוצע ארוך שמתאר את המגמה הראשית מבלי להיות איטי כמו ממוצע 200. הוא פחות מוכר לקהל הרחב, אבל מוכר מאוד בשיטות מסחר מבוססות-מומנטום: הוא מופיע כאחד מתנאי הסינון הקלאסיים של מארק מינרביני ושל שיטות CANSLIM, שבהן דורשים שהמחיר יהיה מעל ממוצע 150 ומעל ממוצע 200, ושממוצע 150 עצמו יהיה מעל ממוצע 200 — מבנה שמעיד על מגמת עלייה מסודרת ולא מקרית. השימוש המעשי המרכזי בו הוא כמסנן איכות ולא כאות כניסה: מניה שנמצאת מעל ממוצע 150 עולה נחשבת "במגמה בריאה" וראויה לבדיקה, ומניה מתחתיו נפסלת מראש. כשמחיר במגמת עלייה ארוכה נוגע בממוצע 150 ומתהפך שם, זו נחשבת נסיגה עמוקה אך עדיין תקינה. שבירה מתמשכת מתחתיו, לעומת זאת, היא אחד הסימנים המשמעותיים לכך שהמגמה הראשית עצמה בסכנה — ולא רק המומנטום הקצר.`,
    en:`The 150-period moving average represents roughly 7-8 trading months — a long average that describes the primary trend without being as slow as the 200. It's less familiar to the general public but very well known in momentum-based trading methods: it appears as one of the classic screening conditions in Mark Minervini's approach and in CANSLIM-style methods, which require price to be above both the 150 and the 200, and the 150 itself to be above the 200 — a structure indicating an orderly rather than accidental uptrend. Its main practical use is as a quality filter rather than an entry signal: a stock above a rising 150 is considered "in a healthy trend" and worth examining, while one below it is screened out up front. When price in a long uptrend touches the 150 and turns back up there, that's considered a deep but still acceptable pullback. A sustained break below it, by contrast, is one of the more meaningful signs that the primary trend itself is in danger — not just short-term momentum.`
  },
  200: {
    he:`ממוצע נע 200 מייצג בערך שנת מסחר שלמה, והוא הממוצע ארוך-הטווח המפורסם ביותר — נחשב לקו הגבול הסמלי בין "שוק במגמת עלייה" ל"שוק במגמת ירידה". מוסדיים, קרנות ותקשורת פיננסית עוקבים אחריו, ולכן יש לו משקל פסיכולוגי גדול: עצם העובדה שכל כך הרבה משתתפים מסתכלים עליו הופכת אותו לרמה שבה באמת מתרחשת פעילות. מחיר מעל ממוצע 200 עולה = מגמה ראשית חיובית; מתחת = מגמה ראשית שלילית, וזהו אחד המסננים הפשוטים והנפוצים ביותר. החיסרון: הוא איטי מאוד. עד שהמחיר שובר אותו, לרוב כבר התרחשה ירידה משמעותית — הוא כלי לאישור מגמה, לא להתראה מוקדמת.`,
    en:`The 200-period moving average represents roughly a full trading year, and it's the most famous long-term average — treated as the symbolic dividing line between a market "in an uptrend" and one "in a downtrend." Institutions, funds and financial media all watch it, which gives it real psychological weight: the sheer number of participants looking at it makes it a level where activity genuinely occurs. Price above a rising 200 = primary uptrend; below = primary downtrend, and that's one of the simplest and most widely used filters there is. The drawback: it's very slow. By the time price breaks it, a significant decline has usually already happened — it's a tool for confirming a trend, not for early warning.`
  }
};

// Periods that aren't in the table still deserve a sensible answer rather than
// a generic one, described by which band they fall into.
function maBandDescription(n, he){
  if(n <= 12) return he
    ? `ממוצע נע ${n} הוא ממוצע קצר מאוד, שמגיב כמעט מיד לכל תנועת מחיר. הוא משמש בעיקר בטווחים קצרים מאוד, ומייצר הרבה אותות שווא ברעש רגיל, ולכן כמעט לא משתמשים בו לבדו.`
    : `The ${n}-period moving average is a very short average that reacts almost immediately to any price move. It's used mainly on very short timeframes and produces many false signals in ordinary noise, so it's rarely used alone.`;
  if(n <= 35) return he
    ? `ממוצע נע ${n} הוא ממוצע קצר, שמתאר את המגמה הקצרה ומשמש לעיתים קרובות כתמיכה דינמית במגמת עלייה. הוא נשבר יחסית בקלות בתנודתיות רגילה, ולכן נחשב אות חלש בפני עצמו.`
    : `The ${n}-period moving average is a short average describing the short-term trend, often used as dynamic support in an uptrend. It breaks relatively easily on ordinary volatility, so on its own it's considered a weak signal.`;
  if(n <= 120) return he
    ? `ממוצע נע ${n} הוא ממוצע בינוני, שמסנן חלק ניכר מהרעש היומי ומתאר את המגמה הבינונית. נדרשת חולשה אמיתית כדי לשבור אותו, ולכן הוא משמעותי יותר מממוצעים קצרים.`
    : `The ${n}-period moving average is an intermediate average that filters out much of the daily noise and describes the intermediate trend. Real weakness is needed to break it, so it carries more meaning than the short averages.`;
  return he
    ? `ממוצע נע ${n} הוא ממוצע ארוך, שמתאר את המגמה הראשית ומגיב לאט מאוד. שבירה מתמשכת מתחתיו נחשבת סימן משמעותי לשינוי במגמה הגדולה, אבל הוא כלי לאישור ולא להתראה מוקדמת.`
    : `The ${n}-period moving average is a long average describing the primary trend, and it reacts very slowly. A sustained break below it is considered a meaningful sign of a change in the larger trend, but it's a confirmation tool rather than an early warning.`;
}
