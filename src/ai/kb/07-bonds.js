  { id:'coupon', cat:'bonds', kw:['coupon','coupon rate','קופון','ריבית קופון'],
    he:`הקופון הוא תשלום הריבית הקבוע שהמנפיק (ממשלה או חברה) משלם למחזיק האג"ח, בדרך כלל פעם או פעמיים בשנה, כאחוז מהערך הנקוב של האג"ח. השם ההיסטורי מגיע מהתקופה שבה אג"ח היו ניירות פיזיים עם "קופונים" שנחתכים ומוגשים לתשלום.`,
    en:`The coupon is the fixed interest payment the issuer (government or company) pays the bondholder, usually once or twice a year, as a percentage of the bond's face value. The name comes historically from when bonds were physical certificates with tearable "coupons" submitted for payment.`,
    related:['bond','bond-yield-ytm'] },

  { id:'bond-yield-ytm', cat:'bonds', kw:['yield to maturity','ytm','bond yield','תשואה לפדיון'],
    he:`תשואה לפדיון (YTM) היא התשואה השנתית הכוללת שמשקיע יקבל אם יחזיק באג"ח עד לתאריך הפדיון שלה, כולל הן תשלומי הקופון והן ההפרש בין מחיר הקנייה לערך הנקוב שיוחזר בסוף. YTM הוא לרוב המספר השימושי ביותר להשוואת אג"ח שונות, כי הוא לוקח בחשבון גם את הקופון וגם את מחיר הרכישה בפועל (שיכול להיות מעל או מתחת לערך הנקוב).`,
    en:`Yield to maturity (YTM) is the total annual return an investor would earn by holding a bond until its maturity date, including both the coupon payments and the difference between the purchase price and the face value returned at the end. YTM is usually the most useful number for comparing different bonds, since it accounts for both the coupon and the actual purchase price (which can be above or below face value).`,
    related:['coupon','bond-price-interest-rate'] },

  { id:'bond-price-interest-rate', cat:'bonds', kw:['bond price and interest rates','why do bond prices fall when rates rise','מחיר אג"ח וריבית','למה מחיר אג"ח יורד כשריבית עולה'],
    he:`מחיר אג"ח קיימת בשוק נע הפוך לריבית במשק. הסיבה: אג"ח משלמת קופון קבוע — אם ריבית השוק עולה ואג"ח חדשות מונפקות עם קופון גבוה יותר, אף אחד לא ירצה לקנות את האג"ח הישנה עם הקופון הנמוך במחיר המקורי שלה, ולכן מחירה בשוק המשני יורד עד שהתשואה האפקטיבית שלה (YTM) מתיישרת עם הריבית החדשה בשוק. ההפך קורה כשריבית יורדת — אג"ח ישנות עם קופון גבוה יחסית הופכות מבוקשות יותר, ומחירן עולה.`,
    en:`An existing bond's market price moves inversely to interest rates in the economy. The reason: a bond pays a fixed coupon — if market rates rise and new bonds are issued with a higher coupon, nobody wants to buy the old, lower-coupon bond at its original price, so its price in the secondary market falls until its effective yield (YTM) lines up with the new market rate. The opposite happens when rates fall — older bonds with a relatively high coupon become more desirable, and their price rises.`,
    related:['interest-rate','bond'] },

  { id:'duration', cat:'bonds', kw:['duration','bond duration','דיורציה','משך חיים ממוצע'],
    he:`דיורציה (Duration) מודדת כמה רגיש מחיר האג"ח לשינויים בריבית — ככל שהדיורציה גבוהה יותר (בדרך כלל אג"ח לטווח ארוך יותר), כך מחיר האג"ח יגיב בעוצמה רבה יותר לשינוי ריבית נתון, לשני הכיוונים. אג"ח קצרות טווח נוטות דיורציה נמוכה (פחות רגישות לריבית); אג"ח ארוכות טווח נוטות דיורציה גבוהה (רגישות יותר).`,
    en:`Duration measures how sensitive a bond's price is to interest-rate changes — the higher the duration (usually longer-maturity bonds), the more sharply the bond's price will react to a given rate change, in either direction. Short-term bonds tend to have low duration (less rate-sensitive); long-term bonds tend to have high duration (more sensitive).`,
    related:['bond-price-interest-rate','bond'] },

  { id:'credit-risk-and-ratings', cat:'bonds', kw:['credit risk','credit rating','government bonds','corporate bonds','junk bonds','high yield bonds','סיכון אשראי','דירוג אשראי','אג"ח ממשלתיות','אג"ח קונצרניות','אג"ח זבל'],
    he:`סיכון אשראי הוא הסיכוי שהמנפיק לא יעמוד בהתחייבויות התשלום שלו (חדלות פירעון). אג"ח ממשלתיות של מדינות יציבות נחשבות בדרך כלל בסיכון אשראי נמוך; אג"ח קונצרניות (של חברות) נושאות סיכון גבוה יותר, בהתאם לחוסן הפיננסי של החברה. חברות דירוג אשראי (כמו S&P, Moody's) מדרגות אג"ח לפי רמת הסיכון — אג"ח בדירוג נמוך מאוד נקראות "אג"ח זבל" (Junk Bonds / High Yield), ומציעות ריבית גבוהה יותר כדי לפצות על הסיכון הגדול יותר.`,
    en:`Credit risk is the chance that the issuer won't meet its payment obligations (default). Government bonds from stable countries are generally considered low credit risk; corporate bonds carry higher risk, depending on the company's financial strength. Credit rating agencies (like S&P, Moody's) rate bonds by risk level — very low-rated bonds are called "junk bonds" (or high-yield bonds), and offer higher interest to compensate for the greater risk.`,
    related:['bond','interest-coverage'] },

