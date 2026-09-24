// ---------------------------------------------------------------------------
// Teaching blocks: the caveat and the bottom line for a topic.
//
// A definition tells you what something is. These two tell you the thing a
// definition leaves out — how the concept is most often misread, and the one
// sentence worth keeping — and they are what turn an answer from a dictionary
// entry into teaching.
//
// Structured exactly like examples.js and attached the same way (kb/index.ts),
// for the same reason: this is content, authored per topic, and it does not
// belong inline in the topic files where it would be read as part of the
// definition itself.
//
// The renderer keys on the opening words. "שימו לב" / "Watch out" produces the
// note block, "בשורה התחתונה" / "Bottom line" the takeaway block — see
// AiAnswer's OPENERS. Do not reword the openers without changing both.
//
// Only the concepts the course actually teaches are covered. A caveat invented
// for a topic that does not have a common misreading would be filler, and the
// blocks would stop meaning anything the moment they appeared on every answer.
// ---------------------------------------------------------------------------

/** @type {Record<string, { caveat?: {he:string,en:string}, bottomLine?: {he:string,en:string} }>} */
export const KB_TEACHING = {
  'support-resistance': {
    caveat: {
      he: 'שימו לב: רמה שהחזיקה חמש פעמים אינה חזקה יותר מרמה שהחזיקה פעמיים — לרוב ההפך. כל בדיקה חוזרת "אוכלת" חלק מפקודות הקנייה שגרמו לה להחזיק, ובשלב מסוים לא נשאר מי שיקנה שם.',
      en: 'Watch out: a level that has held five times is not stronger than one that has held twice — usually the opposite. Each retest consumes some of the buy orders that made it hold, and eventually there is nobody left to buy there.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: אותו אזור מחיר הוא תמיכה או התנגדות — מה שקובע הוא מאיזה צד המחיר מתקרב אליו.',
      en: 'Bottom line: the same price area is support or resistance — which one depends on the side price is approaching it from.'
    }
  },

  'breakout-retest': {
    caveat: {
      he: 'שימו לב: רוב הפריצות נכשלות, והנפח הוא ההבדל. פריצה בנפח דליל אומרת שמעט מאוד אנשים הסכימו למחיר החדש — וזו בדיוק הפריצה שחוזרת פנימה תוך יומיים.',
      en: 'Watch out: most breakouts fail, and volume is what separates them. A breakout on thin volume means very few people agreed to the new price — and that is exactly the one that falls back inside within two sessions.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: הפריצה היא האירוע, הריטסט הוא האישור. בלי השני, קשה לדעת אם הרמה באמת התחלפה או שהמחיר רק גלש מעליה לרגע.',
      en: 'Bottom line: the breakout is the event, the retest is the confirmation. Without the second, there is no telling whether the level actually changed hands or price just overshot it briefly.'
    }
  },

  'moving-averages': {
    caveat: {
      he: 'שימו לב: ממוצע נע הוא ממוצע של העבר, ולכן הוא יכול להסתובב רק אחרי שהמחיר כבר הסתובב. במגמה הפיגור הזה לא מזיק; בשוק דשדוש המחיר חוצה את הקו שוב ושוב, וכל חצייה נראית בדיוק כמו זו שעובדת.',
      en: 'Watch out: a moving average is an average of the past, so it can only turn after price already has. In a trend that lag is harmless; in a sideways market price crosses the line again and again, and every crossing looks exactly like the one that works.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: ממוצע נע מתאר מגמה, הוא לא חוזה אותה.',
      en: 'Bottom line: a moving average describes a trend. It does not predict one.'
    }
  },

  candlestick: {
    caveat: {
      he: 'שימו לב: נר בודד כמעט לא אומר כלום בלי המקום שבו הוא יושב. אותו פטיש בדיוק הוא סימן היפוך בתחתית תנועה ארוכה — ורעש חסר משמעות באמצע טווח דשדוש.',
      en: 'Watch out: a single candle says almost nothing without where it sits. The exact same hammer is a reversal signal at the bottom of a long move — and meaningless noise in the middle of a range.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: נר הוא ארבעה מספרים על תקופה אחת. ההקשר הוא מה שהופך אותו למידע.',
      en: 'Bottom line: a candle is four numbers about one period. Context is what turns it into information.'
    }
  },

  fibonacci: {
    caveat: {
      he: 'שימו לב: הרמות תלויות לחלוטין בשפל ובשיא שבחרתם. בחירת תנועה אחרת על אותו גרף מזיזה כל רמה — ולכן קל מאוד למצוא בדיעבד רמה ש"עבדה".',
      en: 'Watch out: the levels depend entirely on which low and high you picked. Choosing a different swing on the same chart moves every one of them — which is why it is so easy to find a level that "worked" after the fact.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: הרמות מסמנות איפה הרבה אנשים מסתכלים, לא איפה המחיר חייב לעצור.',
      en: 'Bottom line: the levels mark where a lot of people are watching, not where price has to stop.'
    }
  },

  rsi: {
    caveat: {
      he: 'שימו לב: "קניית יתר" לא אומר "עומד לרדת". במגמת עלייה חזקה RSI יכול לשבת מעל 70 שבועות שלמים, ומי שמכר בפעם הראשונה שהוא חצה את הקו פספס את כל התנועה.',
      en: 'Watch out: "overbought" does not mean "about to fall". In a strong uptrend RSI can sit above 70 for weeks, and selling the first time it crossed the line means missing the entire move.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: RSI מודד את מהירות התנועה, לא את צדקתה.',
      en: 'Bottom line: RSI measures how fast a move is going, not whether it is right.'
    }
  },

  trend: {
    caveat: {
      he: 'שימו לב: מגמה ברורה לגמרי בדיעבד ומעורפלת בזמן אמת. אותו גרף בדיוק מראה מגמת עלייה בטווח של שנה ומגמת ירידה בטווח של חודש — בלי לקבוע טווח זמן, "מה המגמה" היא שאלה בלי תשובה.',
      en: 'Watch out: a trend is perfectly clear in hindsight and ambiguous in the moment. The same chart shows an uptrend over a year and a downtrend over a month — without fixing a timeframe, "what is the trend" is a question with no answer.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: קבעו את טווח הזמן לפני שאתם קובעים את המגמה.',
      en: 'Bottom line: fix the timeframe before you name the trend.'
    }
  },

  volume: {
    caveat: {
      he: 'שימו לב: נפח בפני עצמו הוא ניטרלי. קפיצת נפח אומרת שהרבה אנשים פעלו, לא לאיזה כיוון — בכל עסקה יש קונה ומוכר, ושניהם נספרים באותה עמודה.',
      en: 'Watch out: volume on its own is neutral. A spike says a lot of people acted, not which way — every trade has a buyer and a seller, and both are counted in the same bar.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: נפח אומר כמה שכנוע עמד מאחורי תנועה שכבר קרתה, לא לאן תלך הבאה.',
      en: 'Bottom line: volume tells you how much conviction was behind a move that already happened, not where the next one goes.'
    }
  },

  // --- market basics: the questions asked most often, and where a plain
  //     definition most reliably leaves the wrong impression ---

  stock: {
    caveat: {
      he: 'שימו לב: מחיר המניה לבדו לא אומר אם היא "יקרה" או "זולה". מניה ב-5$ יכולה להיות יקרה בהרבה ממניה ב-500$ — מה שקובע הוא המחיר ביחס לרווחים ולנכסים של החברה, וכמה מניות בכלל קיימות.',
      en: 'Watch out: the share price on its own says nothing about whether a stock is "expensive" or "cheap". A $5 stock can be far more expensive than a $500 one — what matters is the price relative to the company\'s earnings and assets, and how many shares exist at all.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: מניה היא בעלות חלקית בעסק אמיתי. כל השאר — המחיר, הגרף, החדשות — הוא ניסיון של השוק להעריך כמה העסק הזה שווה.',
      en: 'Bottom line: a share is part ownership of a real business. Everything else — the price, the chart, the news — is the market trying to work out what that business is worth.'
    }
  },

  etf: {
    caveat: {
      he: 'שימו לב: "קרן סל" היא לא בהכרח פיזור רחב. קרן סקטוריאלית מרוכזת בענף אחד, וקרן ממונפת נועדה להכפיל תנועה יומית ולא מתאימה להחזקה ארוכה — שתיהן נקראות ETF, ושתיהן מסוכנות בהרבה מקרן על מדד רחב.',
      en: 'Watch out: "ETF" does not automatically mean broad diversification. A sector fund is concentrated in one industry, and a leveraged fund is built to multiply a daily move and is not designed to be held long-term — both are called ETFs, and both are far riskier than a broad index fund.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: בדקו מה בפנים ומה דמי הניהול. שתי קרנות עם אותו שם יכולות להחזיק דברים שונים לגמרי.',
      en: 'Bottom line: check what is inside it and what it charges. Two funds with similar names can hold completely different things.'
    }
  },

  index: {
    caveat: {
      he: 'שימו לב: רוב המדדים משוקללים לפי שווי שוק, כלומר החברות הגדולות ביותר תופסות חלק לא פרופורציונלי. כשמדד "עולה" ייתכן שרק כמה חברות ענק עלו בזמן שרוב המניות בו ירדו.',
      en: 'Watch out: most indices are weighted by market cap, so the largest companies take a disproportionate share. When an index "rises", it is possible only a handful of giants rose while most of the stocks inside it fell.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: מדד הוא ממוצע משוקלל, לא תמונה של "כל השוק". כדאי לדעת מה מושך אותו.',
      en: 'Bottom line: an index is a weighted average, not a picture of "the whole market". It is worth knowing what is pulling it.'
    }
  },

  bond: {
    caveat: {
      he: 'שימו לב: "פחות מסוכן ממניות" לא אומר "בלי סיכון". מחיר אג"ח קיימת יורד כשהריבית עולה, ואג"ח של חברה חלשה יכולה להיות מסוכנת יותר ממניה של חברת ענק יציבה.',
      en: 'Watch out: "less risky than stocks" does not mean "risk-free". An existing bond falls in price when rates rise, and a bond from a weak company can be riskier than a share in a large, stable one.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: באג"ח אתם מלווים כסף; במניה אתם שותפים. ההלוואה מבטיחה תנאים, השותפות לא מבטיחה כלום — וזה גם ההבדל בסיכון וגם ההבדל בפוטנציאל.',
      en: 'Bottom line: with a bond you are lending; with a share you are a part-owner. The loan comes with agreed terms, the ownership promises nothing — that is both the difference in risk and the difference in upside.'
    }
  },

  dividend: {
    caveat: {
      he: 'שימו לב: דיבידנד הוא לא רווח חינם. ביום החלוקה מחיר המניה יורד בערך בגובה הדיבידנד — הכסף עבר מהחברה אליכם, לא נוצר יש מאין. תשואת דיבידנד גבוהה במיוחד היא לרוב סימן שהמחיר צנח, לא שהחלוקה נדיבה.',
      en: 'Watch out: a dividend is not free money. On the ex-dividend date the share price drops by roughly the dividend — the money moved from the company to you, it was not created. An unusually high dividend yield is usually a sign the price collapsed, not that the payout is generous.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: דיבידנד הוא החלטה של החברה מה לעשות ברווח שכבר קיים, לא תוספת לרווח.',
      en: 'Bottom line: a dividend is the company deciding what to do with profit it already has, not extra profit.'
    }
  },

  pe: {
    caveat: {
      he: 'שימו לב: מכפיל רווח אפשר להשוות רק בין חברות דומות. מכפיל 30 בחברת תוכנה צומחת ומכפיל 30 בחברת תשתיות ותיקה אומרים דברים שונים לגמרי — ובחברה בהפסד המכפיל פשוט לא קיים.',
      en: 'Watch out: a P/E ratio is only comparable between similar companies. A P/E of 30 on a growing software firm and a P/E of 30 on a mature utility mean entirely different things — and for a company making a loss there is no P/E at all.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: המכפיל מודד כמה השוק מוכן לשלם על כל שקל רווח. הוא שאלה ("למה כל כך גבוה?"), לא תשובה.',
      en: 'Bottom line: P/E measures how much the market will pay for each unit of profit. It is a question ("why so high?"), not an answer.'
    }
  },

  'market-cap': {
    caveat: {
      he: 'שימו לב: שווי שוק הוא לא כמות הכסף שהושקעה בחברה ולא מה שהיא שווה אם תימכר. זה פשוט המחיר האחרון כפול מספר המניות — כולל המניות שאיש לא סחר בהן היום.',
      en: 'Watch out: market cap is not the money invested in a company, nor what it would fetch if sold. It is simply the last traded price times the share count — including all the shares nobody traded today.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: לגודל יש משמעות. חברה קטנה זזה חזק יותר לשני הכיוונים, ופחות אנשים סוחרים בה.',
      en: 'Bottom line: size matters. A smaller company moves harder in both directions, and fewer people are trading it.'
    }
  },

  diversification: {
    caveat: {
      he: 'שימו לב: פיזור על פני עשר מניות טכנולוגיה הוא כמעט לא פיזור — הן נוטות לעלות ולרדת יחד. פיזור אמיתי הוא על פני דברים שלא מגיבים לאותו אירוע באותה צורה.',
      en: 'Watch out: spreading across ten technology stocks is barely diversification — they tend to rise and fall together. Real diversification is across things that do not react to the same event in the same way.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: פיזור לא מגדיל את התשואה הצפויה, הוא מקטין את התלות שלה במזל של החזקה אחת.',
      en: 'Bottom line: diversification does not raise your expected return. It reduces how much that return depends on one holding\'s luck.'
    }
  },

  'stop-loss': {
    caveat: {
      he: 'שימו לב: סטופ לוס לא מבטיח את המחיר שקבעתם. בפתיחה אחרי חדשות המחיר יכול לקפוץ מעל הרמה ולהתממש הרבה יותר נמוך. בנוסף, סטופ צמוד מדי ייתפס על ידי תנודתיות רגילה לפני שהתזה בכלל נבדקה.',
      en: 'Watch out: a stop loss does not guarantee the price you set. After news the market can gap straight past your level and fill far lower. And a stop set too tight will be taken out by ordinary volatility before the idea has even been tested.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: הסטופ הוא החלטה שמתקבלת כשאתם רגועים, כדי שלא תצטרכו לקבל אותה כשאתם לא.',
      en: 'Bottom line: a stop is a decision made while you are calm, so you do not have to make it while you are not.'
    }
  },

  risk: {
    caveat: {
      he: 'שימו לב: סיכון הוא לא רק "כמה אפשר להפסיד" אלא גם "מתי צריך את הכסף". אותו תיק בדיוק הוא סביר לעשרים שנה ולא מתאים לשנתיים — לא בגלל התיק, בגלל האופק.',
      en: 'Watch out: risk is not only "how much could be lost" but also "when the money is needed". The exact same portfolio is reasonable for twenty years and unsuitable for two — not because of the portfolio, because of the horizon.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: רמת הסיכון הנכונה היא זו שמאפשרת לכם לא למכור ביום הגרוע. תיק שגורם לכם למכור בפאניקה מסוכן מדי עבורכם, גם אם על הנייר הוא מצוין.',
      en: 'Bottom line: the right level of risk is the one that lets you not sell on the worst day. A portfolio that makes you panic-sell is too risky for you, however good it looks on paper.'
    }
  },

  volatility: {
    caveat: {
      he: 'שימו לב: תנודתיות היא לא כיוון. מניה תנודתית יכולה לנוע חזק למעלה בדיוק כמו למטה — התנודתיות מודדת את גודל התנועה, לא את סימנה.',
      en: 'Watch out: volatility is not direction. A volatile stock can move hard up just as easily as down — volatility measures the size of the move, not its sign.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: תנודתיות היא מחיר הכניסה לתשואה גבוהה יותר, לא תקלה שצריך לסלק.',
      en: 'Bottom line: volatility is the price of admission for higher returns, not a fault to be engineered away.'
    }
  },

  liquidity: {
    caveat: {
      he: 'שימו לב: נזילות נעלמת בדיוק כשצריך אותה. מניה שנסחרת בנוחות ביום רגיל יכולה להפוך לבלתי אפשרית למכירה במחיר סביר ביום של ירידות חדות, כשכולם רוצים לצאת יחד.',
      en: 'Watch out: liquidity disappears exactly when it is needed. A stock that trades comfortably on a normal day can become impossible to sell at a sensible price on a sharp down day, when everyone wants out at once.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: נזילות היא כמה מהר אפשר לצאת בלי להזיז את המחיר נגדכם.',
      en: 'Bottom line: liquidity is how fast you can get out without moving the price against yourself.'
    }
  },

  'chart-patterns': {
    caveat: {
      he: 'שימו לב: תבניות נמצאות הרבה יותר בקלות אחרי שהן הסתיימו מאשר לפני. העין משלימה צורות שלא ממש שם, ובגרף ארוך מספיק אפשר למצוא כמעט כל תבנית.',
      en: 'Watch out: patterns are far easier to find after they finish than before. The eye completes shapes that are not quite there, and on a long enough chart almost any pattern can be found.'
    },
    bottomLine: {
      he: 'בשורה התחתונה: תבנית היא השערה עם רמה שמפריכה אותה, לא תחזית. אם אין מחיר שבו אתם אומרים "טעיתי" — זו לא תבנית, זו תקווה.',
      en: 'Bottom line: a pattern is a hypothesis with a level that disproves it, not a prediction. If there is no price at which you say "I was wrong", it is not a pattern, it is a hope.'
    }
  }
};
