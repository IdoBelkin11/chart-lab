  { id:'revenue', cat:'fundamentals', kw:['revenue','sales','top line','הכנסות','מכירות','רבניו'],
    he:`הכנסות (Revenue) הן סך כל הכסף שחברה קיבלה ממכירת המוצרים או השירותים שלה, לפני הפחתת כל הוצאה. זו לרוב השורה העליונה בדוח רווח והפסד ("Top Line"), ולכן שינויים בהכנסות (Revenue Growth) הם אחד הדברים הראשונים שמשקיעים בודקים כדי להבין אם עסקי החברה בכלל גדלים.`,
    en:`Revenue (sales) is the total money a company received from selling its products or services, before subtracting any expenses. It's usually the top line of the income statement, which is why changes in revenue (revenue growth) are one of the first things investors check to see whether the underlying business is even growing.`,
    related:['gross-profit','growth-metrics'] },

  { id:'gross-profit', cat:'fundamentals', kw:['gross profit','רווח גולמי'],
    he:`רווח גולמי הוא ההכנסות פחות עלות המכירה הישירה של המוצר או השירות (חומרי גלם, ייצור וכו') — עוד לפני הוצאות תפעול כלליות כמו שיווק, מחקר ופיתוח או הנהלה. הוא מראה כמה "רווחי" המוצר עצמו, לפני שמסתכלים על שאר עלויות הרצת החברה.`,
    en:`Gross profit is revenue minus the direct cost of producing the product or service (raw materials, manufacturing, etc.) — before general operating expenses like marketing, R&D, or management. It shows how profitable the product itself is, before looking at the rest of the costs of running the company.`,
    related:['gross-margin','operating-income'] },

  { id:'operating-income', cat:'fundamentals', kw:['operating income','operating profit','רווח תפעולי'],
    he:`רווח תפעולי (Operating Income) הוא הרווח מפעילות הליבה של העסק בלבד — הכנסות פחות עלות המכר וגם פחות הוצאות תפעול (שיווק, פיתוח, הנהלה) — לפני הוצאות מימון (ריבית) ומיסים. הוא נותן תמונה נקייה יותר על רווחיות העסק עצמו, בלי השפעות של מבנה החוב או שיעור המס.`,
    en:`Operating income (EBIT) is the profit from the core business alone — revenue minus cost of goods sold and also minus operating expenses (marketing, R&D, admin) — before interest expense and taxes. It gives a cleaner picture of the business's own profitability, without the noise of debt structure or tax rate.`,
    related:['gross-profit','operating-margin'] },

  { id:'net-income', cat:'fundamentals', kw:['net income','net profit','bottom line','רווח נקי'],
    he:`רווח נקי (Net Income) הוא מה שנשאר לחברה אחרי הפחתת כל ההוצאות — כולל ריבית ומיסים — מההכנסות. זו לרוב השורה התחתונה בדוח ("Bottom Line"), ומחלקים אותו במספר המניות כדי לקבל את ה-EPS.`,
    en:`Net income is what's left for the company after subtracting every expense — including interest and taxes — from revenue. It's usually the bottom line of the income statement, and dividing it by the number of shares gives you EPS.`,
    related:['eps','operating-income'] },

  { id:'eps', cat:'fundamentals', kw:['eps','earnings per share','רווח למניה'],
    he:`רווח למניה (EPS) הוא הרווח הנקי השנתי של החברה, מחולק במספר המניות הקיימות. זהו אחד המספרים המרכזיים שמשקיעים עוקבים אחריהם בדוחות רבעוניים — EPS שגדל לאורך זמן הוא בדרך כלל סימן חיובי, ו-EPS שמפתיע כלפי מעלה או מטה לעומת תחזיות אנליסטים יכול להזיז את המניה משמעותית ביום פרסום הדוח.`,
    en:`Earnings per share (EPS) is a company's annual net profit divided by the number of outstanding shares. It's one of the key numbers investors watch every quarter — EPS growing over time is generally a positive sign, and EPS that surprises above or below analyst expectations can move the stock significantly on earnings day.`,
    related:['pe','net-income'] },

  { id:'ebitda', cat:'fundamentals', kw:['ebitda','רווח לפני ריבית מס פחת והפחתות'],
    he:`EBITDA הוא הרווח לפני ריבית, מיסים, פחת והפחתות — ניסיון להראות "כמה כסף העסק מייצר בפועל" לפני השפעות חשבונאיות ומימוניות. משתמשים בו הרבה בהשוואה בין חברות עם מבני חוב או מדיניות פחת שונים, כי הוא "מנטרל" חלק מההבדלים האלה. שונה מ-EBIT (רווח תפעולי): EBIT מחסיר רק ריבית ומיסים, בעוד EBITDA מוסיף בחזרה גם פחת והפחתות — ולכן EBITDA כמעט תמיד גבוה יותר (או שווה) מ-EBIT.`,
    en:`EBITDA (earnings before interest, taxes, depreciation, and amortization) is an attempt to show "how much cash the business actually generates" before accounting and financing effects. It's used a lot to compare companies with different debt structures or depreciation policies, because it neutralizes some of those differences. It differs from EBIT (operating income): EBIT only subtracts out interest and taxes, while EBITDA also adds back depreciation and amortization — so EBITDA is almost always higher than (or equal to) EBIT.`,
    related:['ev-ebitda','operating-income'] },

  { id:'free-cash-flow', cat:'fundamentals', kw:['free cash flow','fcf','תזרים מזומנים חופשי'],
    he:`תזרים מזומנים חופשי (FCF) הוא הכסף שנשאר לחברה אחרי תשלום כל ההוצאות התפעוליות וגם ההשקעות הנדרשות בציוד/תשתית (Capex). הרבה משקיעים מעדיפים להסתכל על FCF ולא רק על רווח נקי, כי רווח נקי כולל פריטים חשבונאיים שאינם תזרים מזומנים אמיתי — FCF מראה כמה כסף "אמיתי" נכנס בפועל, כסף שאפשר לחלק כדיבידנד, לרכוש בחזרה מניות, או להשקיע בצמיחה.`,
    en:`Free cash flow (FCF) is the cash left over after a company pays all operating expenses and also the capital investments it needs (capex). Many investors prefer looking at FCF rather than just net income, because net income includes accounting items that aren't real cash flow — FCF shows how much actual cash comes in, cash that can be paid out as dividends, used for buybacks, or reinvested for growth.`,
    related:['operating-cash-flow','stock-buybacks'] },

  { id:'balance-sheet', cat:'fundamentals', kw:['balance sheet','assets liabilities equity','מאזן','מאזן חברה','נכסים והתחייבויות'],
    he:`מאזן (Balance Sheet) הוא אחד משלושת דוחות הכספיים המרכזיים, ומתאר "תמונת מצב" של החברה בנקודת זמן מסוימת (בניגוד לדוח רווח והפסד, שמתאר תקופה שלמה). המאזן בנוי סביב המשוואה: נכסים (Assets) = התחייבויות (Liabilities) + הון עצמי (Equity). נכסים הם כל מה שיש לחברה ושיש לו ערך — מזומן, מלאי, ציוד, נדל"ן. התחייבויות הן כל מה שהחברה חייבת לאחרים — הלוואות, אג"ח שהנפיקה, ספקים שטרם שולמו. הון עצמי הוא מה שנשאר לבעלי המניות אחרי שמחסירים את ההתחייבויות מהנכסים — במובן מסוים, "השווי הפנקסני" של החברה.`,
    en:`A balance sheet is one of the three core financial statements, and it describes a "snapshot" of a company at a specific point in time (unlike the income statement, which covers a whole period). The balance sheet is built around the equation: Assets = Liabilities + Equity. Assets are everything the company owns that has value — cash, inventory, equipment, real estate. Liabilities are everything the company owes to others — loans, bonds it has issued, unpaid suppliers. Equity is what's left for shareholders after subtracting liabilities from assets — in a sense, the company's "book value."`,
    related:['debt-equity','free-cash-flow'] },

  { id:'operating-cash-flow', cat:'fundamentals', kw:['operating cash flow','cash from operations','תזרים מפעילות שוטפת'],
    he:`תזרים מזומנים מפעילות שוטפת מודד כמה מזומן נכנס בפועל מהפעילות העסקית הרגילה (לא ממכירת נכסים או מגיוס הון). חברה יכולה להראות רווח חשבונאי חיובי אבל תזרים תפעולי שלילי (למשל אם לקוחות משלמים באיחור) — ולכן שווה להסתכל על שני המספרים יחד, לא רק על אחד מהם.`,
    en:`Operating cash flow measures how much cash actually comes in from normal business activity (not from selling assets or raising capital). A company can show positive accounting profit but negative operating cash flow (for example if customers pay late) — which is why it's worth looking at both numbers together, not just one of them.`,
    related:['free-cash-flow','net-income'] },

  { id:'gross-margin', cat:'fundamentals', kw:['gross margin','שולי רווח גולמי'],
    he:`שולי רווח גולמי הם רווח גולמי חלקי הכנסות, באחוזים — כמה נשאר לחברה מכל שקל מכירה אחרי עלות הייצור הישירה בלבד. שולי רווח גולמי גבוהים (נפוצים בתוכנה) מרמזים על עסק שקל להרחיב בלי לגייס עלויות ייצור נוספות בקנה מידה; שולי רווח גולמי נמוכים (נפוצים בקמעונאות) מרמזים על עסק שתלוי בהיקף מכירות גדול.`,
    en:`Gross margin is gross profit divided by revenue, as a percentage — how much is left from every dollar of sales after only the direct production cost. High gross margins (common in software) hint at a business that's easy to scale without adding much production cost; low gross margins (common in retail) hint at a business that relies on large sales volume.`,
    related:['gross-profit','operating-margin'] },

  { id:'operating-margin', cat:'fundamentals', kw:['operating margin','שולי רווח תפעולי'],
    he:`שולי רווח תפעולי הם הרווח התפעולי חלקי הכנסות, באחוזים — עד כמה יעילה החברה בהפיכת מכירות לרווח מהפעילות המרכזית שלה, אחרי הוצאות תפעול. עלייה עקבית בשולי הרווח התפעולי לאורך זמן, בלי שדבר דרמטי השתנה בענף, נחשבת סימן חיובי לניהול יעיל.`,
    en:`Operating margin is operating income divided by revenue, as a percentage — how efficiently the company turns sales into profit from its core activity, after operating expenses. A consistent rise in operating margin over time, without anything dramatic changing in the industry, is generally seen as a sign of efficient management.`,
    related:['gross-margin','net-margin'] },

  { id:'net-margin', cat:'fundamentals', kw:['net margin','net profit margin','שולי רווח נקי'],
    he:`שולי רווח נקי הם רווח נקי חלקי הכנסות, באחוזים — כמה נשאר לחברה בפועל מכל שקל מכירה, אחרי הכל: עלויות, הוצאות תפעול, ריבית ומיסים. חשוב להשוות שולי רווח בין חברות מאותו ענף בלבד, כי "רגיל" משתנה מאוד בין ענף לענף (למשל תוכנה מול קמעונאות).`,
    en:`Net margin is net income divided by revenue, as a percentage — how much a company actually keeps from every dollar of sales after everything: costs, operating expenses, interest, and taxes. It's important to compare margins only within the same industry, because "normal" varies hugely between sectors (for example software versus retail).`,
    related:['operating-margin','net-income'] },

  { id:'roe', cat:'fundamentals', kw:['roe','return on equity','תשואה להון','תשואה על ההון'],
    he:`ROE (תשואה על ההון העצמי) מודד כמה רווח נקי החברה מייצרת ביחס להון העצמי שהמשקיעים שמו בה — במילים אחרות, כמה יעיל השימוש בכסף של בעלי המניות. ROE מעל כ-15% נחשב בדרך כלל חזק ברוב הענפים, אבל שווה לשים לב: ROE גבוה יכול לנבוע גם ממינוף (חוב) גבוה ולא רק מיעילות אמיתית — לכן כדאי לבדוק אותו יחד עם יחס Debt/Equity.`,
    en:`ROE (return on equity) measures how much net profit a company generates relative to the shareholder equity invested in it — in other words, how efficiently it uses shareholders' money. ROE above roughly 15% is generally considered strong in most industries, but a caution worth noting: high ROE can also come from high leverage (debt) rather than true efficiency — so it's worth checking alongside the debt/equity ratio.`,
    related:['roa','roic'] },

  { id:'roa', cat:'fundamentals', kw:['roa','return on assets','תשואה על הנכסים'],
    he:`ROA (תשואה על הנכסים) מודד כמה רווח נקי נוצר ביחס לכלל הנכסים של החברה (לא רק ההון העצמי, אלא גם הנכסים הממומנים בחוב). זה עוזר לנטרל חלק מעיוות המינוף שיכול "לנפח" ROE — חברה עם ROA גבוה מייצרת רווח יעיל מכל הנכסים שהיא מפעילה, בלי קשר לאיך היא מימנה אותם.`,
    en:`ROA (return on assets) measures how much net profit is generated relative to the company's total assets (not just shareholder equity, but also assets financed by debt). It helps neutralize some of the leverage distortion that can inflate ROE — a company with high ROA generates profit efficiently from all the assets it operates, regardless of how it financed them.`,
    related:['roe','roic'] },

  { id:'roic', cat:'fundamentals', kw:['roic','return on invested capital','תשואה על ההון המושקע'],
    he:`ROIC (תשואה על ההון המושקע) מודד כמה רווח תפעולי (אחרי מס) החברה מייצרת ביחס לכל ההון שהושקע בה בפועל — הון עצמי וגם חוב יחד. משקיעים רבים מחשיבים אותו למדד היעיל ביותר להשוואת "איכות" חברות שונות, כי הוא כמעט בלתי תלוי במבנה המימון: ROIC שגבוה משמעותית מעלות ההון של החברה מרמז על יתרון תחרותי אמיתי (Moat).`,
    en:`ROIC (return on invested capital) measures how much after-tax operating profit a company generates relative to all the capital actually invested in it — equity and debt combined. Many investors consider it the most useful metric for comparing the "quality" of different companies, because it's almost independent of financing structure: ROIC significantly above the company's cost of capital hints at a real competitive advantage (moat).`,
    related:['moat','valuation'] },

  { id:'pe', cat:'fundamentals', kw:['p/e','p e ratio','pe ratio','trailing p/e','forward p/e','price to earnings','price-to-earnings','מכפיל רווח','מכפיל','פי אי','p/e גבוה','p/e נמוך'],
    he:`מכפיל רווח (P/E) הוא שווי השוק של המניה חלקי הרווח השנתי למניה. הוא אומר בגדול "כמה שנות רווח נוכחי המשקיעים מוכנים לשלם" כדי לקנות את המניה. "Trailing P/E" מחושב לפי הרווח של 12 החודשים האחרונים בפועל; "Forward P/E" מחושב לפי תחזית הרווח לשנה הקרובה — ולכן Forward P/E יכול להיראות נמוך יותר אם השוק מצפה לצמיחה מהירה ברווחים. מכפיל גבוה יכול לרמז שהשוק מצפה לצמיחה מהירה — או שהמניה יקרה יחסית לרווחיה. מכפיל נמוך יכול לרמז על הזדמנות — או על סיכון שהשוק כבר מתמחר. חשוב להשוות מכפיל בין חברות מאותו ענף, לא בין ענפים שונים, ולשלב אותו עם קצב הצמיחה (ראה PEG).`,
    en:`The P/E ratio (Price-to-Earnings) is a company's share price divided by its annual earnings per share. Roughly, it tells you "how many years of current profit" investors are willing to pay to own the stock. "Trailing P/E" is calculated from the actual last 12 months of earnings; "forward P/E" is calculated from next year's projected earnings — so forward P/E can look lower if the market expects earnings to grow quickly. A high P/E can hint the market expects fast growth — or that the stock is expensive relative to its earnings. A low P/E can hint at a bargain — or at a risk the market has already priced in. It's most meaningful when comparing companies within the same industry, and when combined with the growth rate (see PEG).`,
    related:['eps','peg'] },

  { id:'peg', cat:'fundamentals', kw:['peg','peg ratio'],
    he:`PEG הוא מכפיל הרווח (P/E) מחולק בקצב צמיחת הרווחים הצפוי (באחוזים). הרעיון: P/E לבדו לא אומר אם מחיר גבוה "מוצדק" — חברה עם P/E של 40 אבל צמיחה של 40% בשנה יכולה להיות זולה יחסית, בעוד חברה עם P/E של 15 אבל צמיחה של 2% יכולה להיות יקרה יחסית. באופן כללי, PEG סביב 1 נחשב מחיר "הוגן" ביחס לצמיחה; PEG הרבה מתחת ל-1 יכול לרמז על הזדמנות; PEG הרבה מעל 2 יכול לרמז שהמניה יקרה גם ביחס לצמיחתה, למרות שה-P/E הבודד אולי לא נראה קיצוני.`,
    en:`PEG is the P/E ratio divided by the expected earnings growth rate (as a percentage). The idea: P/E alone doesn't tell you whether a high price is "justified" — a company with a P/E of 40 but 40% annual growth can actually be relatively cheap, while a company with a P/E of 15 but 2% growth can be relatively expensive. Broadly, a PEG around 1 is considered a "fair" price relative to growth; a PEG well below 1 can hint at a bargain; a PEG well above 2 can hint the stock is expensive even relative to its own growth, even though the standalone P/E might not look extreme.`,
    related:['pe','growth-metrics'] },

  { id:'ps-ratio', cat:'fundamentals', kw:['p/s','p/s ratio','price to sales','מכפיל מכירות'],
    he:`מכפיל מכירות (P/S) הוא שווי השוק של החברה חלקי ההכנסות השנתיות שלה. הוא שימושי במיוחד לחברות שעדיין לא רווחיות (ולכן P/E לא ניתן לחישוב) — למשל חברות צמיחה צעירות — כי הכנסות קיימות גם כשאין עדיין רווח.`,
    en:`The P/S ratio (price-to-sales) is a company's market value divided by its annual revenue. It's especially useful for companies that aren't yet profitable (so P/E can't be calculated) — for example young growth companies — since revenue exists even before there's a profit.`,
    related:['pe','revenue'] },

  { id:'pb-ratio', cat:'fundamentals', kw:['p/b','p/b ratio','price to book','מכפיל הון'],
    he:`מכפיל הון (P/B) הוא שווי השוק של החברה חלקי ההון העצמי שלה בספרים (נכסים פחות התחייבויות). מכפיל מתחת ל-1 אומר שהשוק מתמחר את החברה בפחות משווי הנכסים שלה על הנייר — לפעמים הזדמנות, לפעמים סימן שהשוק חושב שהנכסים שווים פחות ממה שרשום. שימושי בעיקר לבנקים וחברות עם הרבה נכסים מוחשיים; פחות רלוונטי לחברות טכנולוגיה שהערך שלהן הוא בעיקר קניין רוחני.`,
    en:`The P/B ratio (price-to-book) is a company's market value divided by its book equity value (assets minus liabilities). A ratio below 1 means the market is pricing the company below its stated asset value on paper — sometimes a bargain, sometimes a sign the market thinks the assets are worth less than recorded. It's most useful for banks and asset-heavy companies; less relevant for tech companies whose value is mostly intellectual property.`,
    related:['pe','ps-ratio'] },

  { id:'ev-ebitda', cat:'fundamentals', kw:['ev/ebitda','ev ebitda','enterprise value'],
    he:`EV/EBITDA משווה את שווי המפעיל הכולל של החברה (שווי שוק ועוד חוב פחות מזומן — Enterprise Value) ל-EBITDA שלה. הוא נחשב טוב יותר מ-P/E להשוואת חברות עם רמות חוב שונות, כי הוא לוקח בחשבון את החוב ואת המזומן, לא רק את מחיר המניה.`,
    en:`EV/EBITDA compares a company's total enterprise value (market cap plus debt minus cash) to its EBITDA. It's considered better than P/E for comparing companies with different debt levels, because it accounts for debt and cash, not just the share price.`,
    related:['ebitda','debt-equity'] },

  { id:'debt-equity', cat:'fundamentals', kw:['debt to equity','debt/equity','d/e ratio','יחס חוב להון'],
    he:`יחס חוב להון (Debt/Equity) משווה כמה חוב יש לחברה ביחס להון העצמי שלה. יחס גבוה מרמז על מינוף גבוה — פוטנציאל תשואה גדול יותר על ההון בתקופות טובות, אבל גם סיכון גדול יותר בתקופות קשות (קשה יותר לעמוד בתשלומי ריבית). יחס "בריא" משתנה מאוד לפי ענף — חברות תשתית ובנקים נוטות למינוף גבוה יותר באופן טבעי מחברות טכנולוגיה.`,
    en:`The debt-to-equity ratio compares how much debt a company has relative to its shareholder equity. A high ratio hints at high leverage — greater potential return on equity in good times, but also greater risk in tough times (harder to keep up with interest payments). A "healthy" ratio varies a lot by industry — utilities and banks naturally carry higher leverage than tech companies.`,
    related:['interest-coverage','roe'] },

  { id:'current-ratio', cat:'fundamentals', kw:['current ratio','יחס שוטף'],
    he:`יחס שוטף הוא נכסים שוטפים (מזומן, מלאי, לקוחות) חלקי התחייבויות שוטפות — מודד אם לחברה יש מספיק נזילות כדי לעמוד בהתחייבויות הקרובות שלה (עד שנה). יחס מעל 1 נחשב בדרך כלל בריא; יחס נמוך משמעותית מ-1 יכול לרמז על בעיית נזילות בטווח הקצר.`,
    en:`The current ratio is current assets (cash, inventory, receivables) divided by current liabilities — it measures whether a company has enough liquidity to meet its near-term obligations (within a year). A ratio above 1 is generally considered healthy; a ratio significantly below 1 can hint at a short-term liquidity problem.`,
    related:['interest-coverage','free-cash-flow'] },

  { id:'interest-coverage', cat:'fundamentals', kw:['interest coverage','interest coverage ratio','כיסוי ריבית'],
    he:`יחס כיסוי ריבית מודד כמה פעמים הרווח התפעולי של החברה מכסה את תשלומי הריבית השנתיים שלה. יחס נמוך (למשל מתחת ל-2) מרמז שלחברה יכול להיות קשה לעמוד בתשלומי החוב אם הרווח יורד — אינדיקטור חשוב לסיכון אשראי.`,
    en:`The interest coverage ratio measures how many times a company's operating income covers its annual interest payments. A low ratio (for example under 2) hints that the company could struggle to service its debt if profit falls — an important credit-risk indicator.`,
    related:['debt-equity','credit-risk-and-ratings'] },

  { id:'payout-ratio', cat:'fundamentals', kw:['payout ratio','dividend payout ratio','יחס חלוקה','שיעור חלוקת רווחים'],
    he:`יחס חלוקה (Payout Ratio) הוא איזה חלק מהרווח הנקי החברה מחלקת בפועל כדיבידנד. יחס נמוך משאיר לחברה מקום לצמוח או להגדיל דיבידנד בעתיד; יחס גבוה מאוד (קרוב ל-100% ומעלה) מרמז שהדיבידנד עלול להיות פחות בר-קיימא אם הרווח ייפגע.`,
    en:`The payout ratio is what share of net income a company actually distributes as dividends. A low ratio leaves room for the company to grow or increase the dividend later; a very high ratio (near or above 100%) hints the dividend may be less sustainable if profit takes a hit.`,
    related:['dividend','dividend-yield'] },

  { id:'growth-metrics', cat:'fundamentals', kw:['earnings growth','revenue growth','growth rate','צמיחת רווחים','צמיחת הכנסות','קצב צמיחה'],
    he:`צמיחת הכנסות וצמיחת רווחים מודדות כמה מהר גדלות המכירות והרווח של החברה, לרוב באחוזים משנה לשנה או מרבעון לרבעון. השוק בדרך כלל מתגמל צמיחה עקבית וחזקה במחיר גבוה יותר יחסית לרווח הנוכחי (P/E גבוה יותר) — ולכן חברת צמיחה שמאכזבת בצמיחה יכולה ליפול חזק גם אם היא עדיין רווחית, כי הציפיות הגבוהות מגולמות כבר במחיר.`,
    en:`Revenue growth and earnings growth measure how fast a company's sales and profit are increasing, usually as a percentage year-over-year or quarter-over-quarter. The market generally rewards strong, consistent growth with a higher price relative to current profit (a higher P/E) — which is why a growth company that disappoints on growth can fall sharply even while still profitable, since high expectations are already priced in.`,
    related:['guidance','peg'] },

  { id:'guidance', cat:'fundamentals', kw:['guidance','earnings guidance','company guidance','תחזית חברה','הנחיה','גיידאנס'],
    he:`Guidance (הנחיית החברה) היא תחזית שהחברה עצמה נותנת למשקיעים לגבי הכנסות או רווח צפויים ברבעונים או שנים הקרובות. השוק מגיב לא רק לתוצאות הרבעון עצמו, אלא גם — ולעיתים בעיקר — לשאלה אם ה-Guidance לרבעון הבא הועלה, הופחת, או נשאר כמות שהוא, כי זה מה שקובע ציפיות עתידיות.`,
    en:`Guidance is a forecast the company itself gives investors about expected revenue or profit for upcoming quarters or years. The market reacts not just to the quarter's actual results, but often mainly to whether guidance for the next quarter was raised, lowered, or left unchanged, since that's what sets future expectations.`,
    related:['earnings-season','growth-metrics'] },

  { id:'moat', cat:'fundamentals', kw:['moat','competitive advantage','economic moat','יתרון תחרותי','מואט'],
    he:`"תעלה" (Moat) הוא כינוי ליתרון תחרותי בר-קיימא שמגן על רווחיות החברה מפני מתחרים — למשל מותג חזק, אפקט רשת, עלות מעבר גבוהה ללקוחות, פטנטים, או יתרון עלות מובנה. חברה עם Moat חזק יכולה לשמור על שולי רווח גבוהים לאורך זמן ארוך יותר, ולכן משקיעים לטווח ארוך מייחסים לזה חשיבות רבה מעבר למספרים הפיננסיים הנוכחיים בלבד.`,
    en:`A "moat" is a durable competitive advantage that protects a company's profitability from competitors — for example a strong brand, a network effect, high customer switching costs, patents, or a structural cost advantage. A company with a strong moat can sustain high margins for longer, which is why long-term investors give it real weight beyond just the current financial numbers.`,
    related:['roic','valuation'] },

  { id:'valuation', cat:'fundamentals', kw:['valuation','how to value a company','שווי חברה','הערכת שווי','וואלואציה','ולואציה'],
    he:`הערכת שווי היא הניסיון להעריך כמה חברה "באמת" שווה, ולא רק כמה השוק מתמחר אותה כרגע. יש כמה גישות מרכזיות: מכפילי שוק (P/E, EV/EBITDA וכו') שמשווים לחברות דומות; DCF שמנסה להוון תזרימי מזומנים עתידיים לערך של היום; והשוואה לנכסים בפועל (P/B). אף שיטה אינה מדויקת — כולן מבוססות על הנחות שיכולות להתברר כשגויות.`,
    en:`Valuation is the attempt to estimate what a company is "really" worth, not just how the market is pricing it right now. There are a few main approaches: market multiples (P/E, EV/EBITDA, etc.) that compare to similar companies; DCF, which tries to discount future cash flows back to today's value; and comparing to actual assets (P/B). No method is exact — they're all built on assumptions that can turn out to be wrong.`,
    related:['dcf','intrinsic-value'] },

  { id:'intrinsic-value', cat:'fundamentals', kw:['intrinsic value','ערך פנימי'],
    he:`ערך פנימי הוא ההערכה של "כמה חברה באמת שווה" בהתבסס על היכולת שלה לייצר רווחים ותזרים מזומנים בעתיד — להבדיל ממחיר השוק הנוכחי, שיכול להיות מושפע גם מרגש, אופנה, או עיוותים זמניים. משקיעי ערך (Value Investors) מחפשים מניות שנסחרות מתחת לערך הפנימי המוערך שלהן.`,
    en:`Intrinsic value is an estimate of "what a company is truly worth" based on its ability to generate future profit and cash flow — as distinct from the current market price, which can also be influenced by emotion, fads, or temporary distortions. Value investors look for stocks trading below their estimated intrinsic value.`,
    related:['dcf','valuation'] },

  { id:'dcf', cat:'fundamentals', kw:['dcf','discounted cash flow','תזרים מזומנים מהוון'],
    he:`מודל DCF (תזרים מזומנים מהוון) מנסה להעריך שווי חברה על ידי תחזית תזרימי המזומנים החופשיים העתידיים שלה, ואז "היוון" שלהם לערך של היום לפי שיעור היוון מסוים — כי שקל שיתקבל בעוד 10 שנים שווה פחות משקל שמתקבל היום. ה"בעיה" המרכזית ב-DCF: התוצאה רגישה מאוד להנחות (קצב צמיחה, שיעור היוון) — שינוי קטן בהנחות יכול לשנות את השווי המחושב באופן דרמטי.`,
    en:`A DCF (discounted cash flow) model tries to estimate a company's value by forecasting its future free cash flows, then "discounting" them back to today's value using a certain discount rate — because a dollar received in 10 years is worth less than a dollar received today. The main problem with DCF: the result is very sensitive to assumptions (growth rate, discount rate) — a small change in assumptions can dramatically change the calculated value.`,
    related:['discount-rate','terminal-value'] },

  { id:'discount-rate', cat:'fundamentals', kw:['discount rate','שיעור היוון'],
    he:`שיעור היוון הוא האחוז שבו "מקטינים" תזרימי מזומנים עתידיים כדי לבטא אותם בערך של היום, בדרך כלל בהתבסס על עלות ההון של החברה ורמת הסיכון שלה. שיעור היוון גבוה יותר (למשל בגלל סיכון גבוה, או ריבית משק גבוהה יותר) מוריד את הערך הנוכחי של רווחים עתידיים — וזה בדיוק הסיבה שחברות צמיחה, שרוב שוויין תלוי ברווחים רחוקים, רגישות כל כך לעליית ריבית.`,
    en:`The discount rate is the percentage used to "shrink" future cash flows to express them in today's value, usually based on the company's cost of capital and risk level. A higher discount rate (for example due to higher risk, or a higher economy-wide interest rate) lowers the present value of future profits — which is exactly why growth companies, whose value depends heavily on distant future earnings, are so sensitive to rising interest rates.`,
    related:['rate-growth-stocks-link','dcf'] },

  { id:'terminal-value', cat:'fundamentals', kw:['terminal value','ערך טרמינלי'],
    he:`ערך טרמינלי הוא האומדן לשווי החברה בסוף תקופת התחזית המפורשת של מודל ה-DCF (למשל אחרי 5-10 שנים), שמייצג את כל תזרימי המזומנים אחרי אותה נקודה כ"נצח". בפועל, לרוב רוב ערך המניה במודל DCF מגיע דווקא מהערך הטרמינלי ולא מהשנים הקרובות — מה שהופך אותו לרכיב הכי לא ודאי אך גם הכי משמעותי במודל.`,
    en:`Terminal value is the estimate of a company's value at the end of a DCF model's explicit forecast period (for example after 5-10 years), representing all the cash flows after that point as an ongoing "perpetuity". In practice, most of the value in a DCF model often comes from the terminal value rather than the near-term years — making it the least certain yet most significant component of the model.`,
    related:['dcf','discount-rate'] },

