// ---------------------------------------------------------------------------
// Single-concept entries with FACETED content.
//
// The over-answering problem had a structural root cause: several entries
// bundled multiple distinct concepts into one blob of text (order-types held
// Market + Limit + Stop Loss + Take Profit; bull-vs-bear held both markets).
// Asking about ONE of them returned all of them, because the entry is the
// smallest unit the engine can return.
//
// The fix is two-part:
//   1. one entry per concept (below), so the unit of retrieval matches the
//      unit a user actually asks about; and
//   2. a `facets` object, so an entry can answer "what is X" / "advantages of
//      X" / "drawbacks of X" separately instead of always emitting everything.
//
// `he`/`en` remain the full fallback text (used when no specific facet was
// requested); `facets.{def,pros,cons}` are returned alone when the question
// asked for exactly that.
// ---------------------------------------------------------------------------
const KB_FOCUSED = [
  { id:'take-profit', cat:'basics', priority:2,
    kw:['take profit','takeprofit','tp order','take profit order','טייק פרופיט','טייק פרופית','טיק פרופיט','טייק פרופיטט','טייקפרופיט','פקודת טייק פרופיט'],
    he:`Take Profit (טייק פרופיט) היא פקודה שסוגרת את העסקה אוטומטית כשהמחיר מגיע ליעד רווח שקבעת מראש, כדי לנעול את הרווח בלי לעקוב ולהחליט בזמן אמת. היא ההפך מ-Stop Loss, שתפקידה להגביל הפסד.`,
    en:`A take-profit order automatically closes a position once the price reaches a profit target you set in advance, locking in the gain without needing to watch and decide in real time. It's the mirror image of a stop-loss, whose job is to cap a loss.`,
    facets:{
      def:{ he:`Take Profit (טייק פרופיט) היא פקודה שסוגרת את העסקה אוטומטית כשהמחיר מגיע ליעד רווח שקבעת מראש, כדי לנעול את הרווח בלי לעקוב ולהחליט בזמן אמת. היא ההפך מ-Stop Loss, שתפקידה להגביל הפסד.`,
             en:`A take-profit order automatically closes a position once the price reaches a profit target you set in advance, locking in the gain without needing to watch and decide in real time. It's the mirror image of a stop-loss, whose job is to cap a loss.` },
      pros:{ he:`היתרונות של Take Profit: הרווח נסגר אוטומטית גם אם אינך צמוד למסך; ההחלטה מתקבלת מראש בראש קר ולא מתוך התלהבות או פחד ברגע האמת; והיא מאפשרת להגדיר יחס סיכוי-סיכון ברור כבר בכניסה לעסקה.`,
             en:`Advantages of a take-profit: the gain is closed automatically even if you're away from the screen; the decision is made in advance with a clear head rather than out of excitement or fear in the moment; and it lets you define a clear risk/reward ratio right at entry.` },
      cons:{ he:`החסרונות של Take Profit: אם המניה ממשיכה לעלות הרבה מעבר ליעד, יצאת מוקדם וויתרת על הרווח הנוסף; יעד שנקבע קרוב מדי ייסגר על תנודה רגילה ולא על מהלך אמיתי; והיא מעודדת לחשוב במונחי יעד קבוע גם כשהתמונה העסקית משתנה.`,
             en:`Drawbacks of a take-profit: if the stock keeps climbing well past your target you've exited early and given up the rest of the move; a target set too close will trigger on ordinary noise rather than a real move; and it encourages thinking in terms of a fixed target even when the underlying picture changes.` }
    },
    related:['stop-loss','risk-reward-ratio'] },

  { id:'stop-loss', cat:'basics', priority:2,
    kw:['stop loss','stoploss','stop loss order','sl order','stop order','סטופ לוס','סטופלוס','סטופ לוסס','סטופ','פקודת סטופ','סטופ־לוס'],
    he:`Stop Loss (סטופ לוס) היא פקודה שסוגרת את העסקה אוטומטית אם המחיר יורד לרמה שקבעת מראש, כדי להגביל את ההפסד המקסימלי בלי לשבת ולעקוב כל הזמן.`,
    en:`A stop-loss order automatically closes a position if the price falls to a level you set in advance, capping the maximum loss without needing to watch the position constantly.`,
    facets:{
      def:{ he:`Stop Loss (סטופ לוס) היא פקודה שסוגרת את העסקה אוטומטית אם המחיר יורד לרמה שקבעת מראש, כדי להגביל את ההפסד המקסימלי בלי לשבת ולעקוב כל הזמן.`,
             en:`A stop-loss order automatically closes a position if the price falls to a level you set in advance, capping the maximum loss without needing to watch the position constantly.` },
      pros:{ he:`היתרונות של Stop Loss: ההפסד מוגבל לסכום ידוע מראש; ההחלטה למכור מתקבלת בראש קר לפני הכניסה ולא מתוך פאניקה; ואין צורך לעקוב אחרי המסך כל היום.`,
             en:`Advantages of a stop-loss: the loss is capped at an amount known in advance; the decision to sell is made calmly before entry rather than in panic; and there's no need to watch the screen all day.` },
      cons:{ he:`החסרונות של Stop Loss: תנודה רגילה וזמנית יכולה להפעיל אותו ולהוציא אותך רגע לפני שהמחיר חוזר למעלה ("נשאבת החוצה"); בפתיחת מסחר או בחדשות חדות המחיר עלול לקפוץ מעל רמת הסטופ והביצוע בפועל יהיה גרוע משתכננת (Gap); וסטופ קרוב מדי מייצר יציאות תכופות ועלויות מסחר.`,
             en:`Drawbacks of a stop-loss: ordinary, temporary volatility can trigger it and take you out right before price recovers ("getting shaken out"); on an open or a sharp news move the price can gap straight past your stop level, so the actual fill is worse than planned; and a stop set too tight produces frequent exits and trading costs.` }
    },
    related:['take-profit','risk-reward-ratio'] },

  { id:'bear-market', cat:'basics', priority:2,
    kw:['bear market','what is a bear market','שוק דובי','מה זה שוק דובי','שוק דוב','בר מרקט'],
    he:`שוק דובי (Bear Market) הוא תקופה ממושכת של ירידות, שמוגדרת בדרך כלל כירידה של 20% ומעלה משיא קודם, ולרוב מלווה בפסימיות וחשש בקרב משקיעים. ירידה קטנה יותר (כ-10%) נקראת "תיקון" ולא שוק דובי. זהו ההפך משוק שורי.`,
    en:`A bear market is an extended period of decline, usually defined as a 20%+ fall from a prior peak, typically accompanied by pessimism and fear among investors. A smaller decline (around 10%) is called a "correction," not a bear market. It's the opposite of a bull market.`,
    related:['bull-market','what-to-do-in-a-market-drop'] },

  { id:'bull-market', cat:'basics', priority:2,
    kw:['bull market','what is a bull market','שוק שורי','מה זה שוק שורי','שוק שור','בול מרקט'],
    he:`שוק שורי (Bull Market) הוא תקופה ממושכת של עליות, שמוגדרת בדרך כלל כעלייה של 20% ומעלה משפל קודם, ולרוב מלווה באופטימיות וביטחון של משקיעים. זהו ההפך משוק דובי.`,
    en:`A bull market is an extended period of rising prices, usually defined as a 20%+ rise from a prior low, typically accompanied by optimism and investor confidence. It's the opposite of a bear market.`,
    related:['bear-market','trend'] },

  { id:'risk-reward-ratio', cat:'risk', priority:2,
    kw:['risk reward','risk/reward','risk reward ratio','risk to reward','r/r ratio','יחס סיכון סיכוי','יחס סיכוי סיכון','סיכון סיכוי','סיכוי סיכון','יחס סיכון תשואה'],
    he:`יחס סיכון-סיכוי (Risk/Reward) משווה כמה אפשר להרוויח בעסקה מול כמה אפשר להפסיד בה, לפני שנכנסים אליה. למשל: אם הסטופ לוס במרחק 2% מהכניסה והיעד במרחק 6%, היחס הוא 1:3 — מסכנים 1 כדי להרוויח 3. הרעיון המרכזי: יחס טוב מאפשר להיות רווחי לאורך זמן גם עם אחוז הצלחה נמוך יחסית, כי העסקאות המרוויחות גדולות מהמפסידות.`,
    en:`The risk/reward ratio compares how much you stand to gain on a trade against how much you stand to lose, assessed before entering. For example: if the stop-loss sits 2% from entry and the target 6% away, the ratio is 1:3 — risking 1 to make 3. The key idea: a good ratio can keep you profitable over time even with a relatively low win rate, because the winning trades are larger than the losing ones.`,
    related:['stop-loss','take-profit'] },
];
KB.push.apply(KB, KB_FOCUSED);
