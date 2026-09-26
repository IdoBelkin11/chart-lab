// ---------------------------------------------------------------------------
// Risk, module 2 (part two) and the project: R7 (crashes, bubbles and scams),
// R8 (building a first portfolio).
//
// Sources: the approved curriculum and the Artifact's page 10 (10.4 the
// portfolio builder: four assets, three profiles, a good and a very bad year,
// and the three reactions — sell everything, do nothing, buy more).
// Builds on R1 (drawdown and recovery), R2 (diversification), R4 (allocation
// and rebalancing) and R6 (herding) without re-teaching them.
// Every number comes from @core/risk/scenarios or a series.
// ---------------------------------------------------------------------------
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { Diagram, LessonContent } from './types';
import { ASSETS, BIG_FALL, BUBBLE_EPS, MAX_LOSS, PORTFOLIO_START, PROFILES, profileReturn, recoveryPct } from '@core/risk/scenarios';
import { L, ltr, n0, n2, pc, nums, money, rq, drawdown } from './riskKit';

// ---------- R7 · crashes, bubbles and scams ----------
const CR = series.R7_CRASH, BU = series.R7_BUBBLE;
const crPeak = CR.swings[0]!, crLow = CR.swings[1]!, crEnd = CR[CR.length - 1]!.c, crDd = drawdown(crPeak.price, crLow.price);
const buStart = BU[0]!.c, buPeak = BU.swings[0]!, buEnd = BU[BU.length - 1]!.c;
const port = PORTFOLIO_START * (1 - crDd / 100);
const SCAM_FLAGS: Array<[string, string, string, string]> = [
  ['תשואה "מובטחת" וגבוהה', 'A "guaranteed", high return', 'אין השקעה עם תשואה גבוהה ובלי סיכון.', 'No investment has a high return and no risk.'],
  ['לחץ להחליט עכשיו', 'Pressure to decide now', '"ההזדמנות נסגרת היום" נועד למנוע מכם לבדוק.', '"The offer closes today" is meant to stop you checking.'],
  ['גוף לא מפוקח', 'An unregulated firm', 'בודקים ברישום של הרגולטור — בישראל, רשות ניירות ערך.', 'Check the regulator\'s register — in Israel, the Israel Securities Authority.'],
  ['רווח מגיוס חברים', 'Profit from recruiting friends', 'כסף של משקיעים חדשים משלם לוותיקים — עד שהוא נגמר.', 'New investors\' money pays the old ones — until it runs out.'],
  ['קשה למשוך את הכסף', 'Hard to withdraw', 'עיכובים ותירוצים במשיכה הם סימן אזהרה חמור.', 'Delays and excuses on withdrawal are a serious warning sign.'],
  ['שיטה "סודית"', 'A "secret" method', 'אם אי אפשר להסביר מאיפה הרווח — כנראה שאין רווח.', 'If nobody can explain where the profit comes from — there probably is none.']
];
const R7_CHARTS: LessonChartSpec[] = [
  { candles: CR, variant: 'price', options: { showVolume: false, dots: [
      { idx: crPeak.idx, price: crPeak.price, tone: 'bull', labelAlign: 'center', labelDy: -8, label: L(`שיא ${n2(crPeak.price)}`, `Peak ${n2(crPeak.price)}`) },
      { idx: crLow.idx, price: crLow.price, tone: 'bear', labelAlign: 'center', labelDy: 20, label: L(`${pc(-crDd, 0)} · ${n2(crLow.price)}`, `${pc(-crDd, 0)} · ${n2(crLow.price)}`) }] },
    label: L(`ירידה חדה מ־${n2(crPeak.price)} ל־${n2(crLow.price)}, ואחריה התאוששות עד ${n2(crEnd)}`, `A sharp fall from ${n2(crPeak.price)} to ${n2(crLow.price)}, then a recovery to ${n2(crEnd)}`),
    caption: L(`ירידה של ${pc(crDd, 0)}`, `A ${pc(crDd, 0)} fall`), tone: 'bear', height: 420 },
  { candles: BU, variant: 'price', options: { showVolume: false, dots: [{ idx: buPeak.idx, price: buPeak.price, tone: 'bear', labelAlign: 'center', labelDy: -8, label: L(`שיא ${n2(buPeak.price)}`, `Peak ${n2(buPeak.price)}`) }] },
    label: L(`עלייה מ־${n2(buStart)} ל־${n2(buPeak.price)}, מהירה יותר ויותר, ואחריה קריסה עד ${n2(buEnd)}`, `A rise from ${n2(buStart)} to ${n2(buPeak.price)}, faster and faster, then a collapse to ${n2(buEnd)}`),
    caption: L('בועה', 'A bubble'), tone: 'bear', height: 420 }
];

export const R7: LessonContent = {
  id: 'R7',
  tutor: { topic: 'market-bubbles-crashes', label: L('ירידות חדות, בועות והונאות', 'crashes, bubbles and scams') },
  teach: [
    {
      heading: L(`ירידה של ${pc(crDd, 0)}`, `A ${pc(crDd, 0)} fall`),
      paragraphs: [
        L(`ירידות חדות הן חלק מהשוק, לא תקלה בו. בגרף, המחיר ירד מ־${n2(crPeak.price)} ל־${n2(crLow.price)} — ${pc(crDd, 0)} — ב־${crLow.idx - crPeak.idx} ימי מסחר. מי שהחזיק תיק של ${money(PORTFOLIO_START).he} ראה אותו הופך ל־${money(port).he}.`,
          `Sharp falls are part of the market, not a fault in it. On the chart, the price fell from ${n2(crPeak.price)} to ${n2(crLow.price)} — ${pc(crDd, 0)} — in ${crLow.idx - crPeak.idx} trading days. Someone holding a ${money(PORTFOLIO_START).en} portfolio watched it become ${money(port).en}.`),
        L(`מהשיעור הראשון אתם יודעים את המתמטיקה: כדי לחזור צריך ${pc(recoveryPct(crDd))}. כאן, עד סוף הגרף, המחיר חזר ל־${n2(crEnd)} — עדיין מתחת לשיא. מדדים רחבים חזרו בעבר מכל הירידות הגדולות, אבל לפעמים זה לקח שנים; מניות בודדות — לא תמיד חזרו.`,
          `From the first lesson you know the maths: getting back needs ${pc(recoveryPct(crDd))}. Here, by the end of the chart, the price came back to ${n2(crEnd)} — still below the peak. Broad indexes have come back from every big fall in the past, but sometimes it took years; single stocks did not always come back.`),
        L('השאלה החשובה היא לא איך לנחש את הירידה הבאה — אף אחד לא יודע לעשות את זה בעקביות — אלא מה תעשו כשהיא תגיע. ועל זה מחליטים לפני.', 'The important question is not how to guess the next fall — nobody manages that consistently — but what you will do when it comes. And that is decided beforehand.')
      ],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('איך נראית בועה', 'What a bubble looks like'),
      paragraphs: [
        L(`בועה (Bubble) היא עלייה שמתנתקת מהעסק שמתחת. בגרף, המחיר עלה מ־${n2(buStart)} ל־${n2(buPeak.price)} — פי ${(buPeak.price / buStart).toFixed(1)} — וההאצה בסוף הייתה החדה ביותר. ואז הוא קרס ל־${n2(buEnd)}, ${pc(drawdown(buPeak.price, buEnd), 0)} מהשיא.`,
          `A bubble is a rise that comes loose from the business underneath. On the chart, the price went from ${n2(buStart)} to ${n2(buPeak.price)} — ${(buPeak.price / buStart).toFixed(1)} times — and the acceleration at the end was the sharpest. Then it collapsed to ${n2(buEnd)}, ${pc(drawdown(buPeak.price, buEnd), 0)} below the peak.`),
        L('סימנים מוכרים: המחיר עולה הרבה יותר מהר מהרווחים (מכפילים שלא נראו קודם); "הפעם זה שונה"; אנשים לווים כדי לקנות; וכולם מדברים על זה — הטיית העדר מהשיעור הקודם, בגרסה של שוק שלם.',
          'Familiar signs: the price rises much faster than the profits (multiples never seen before); "this time is different"; people borrow to buy; and everyone is talking about it — the herding from the last lesson, at the scale of a whole market.'),
        L('אבל בועות ברורות בעיקר בדיעבד. מחיר גבוה יכול להמשיך לעלות עוד זמן רב — ולכן ההגנה היא לא לנחש את הפסגה, אלא לשמור על גודל פוזיציה ופיזור שמאפשרים לשרוד אם היא מגיעה.', 'But bubbles are clear mostly in hindsight. A high price can keep rising for a long time — so the defence is not guessing the top, but keeping position size and diversification that let you survive if it comes.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('"כולם מרוויחים" הוא לא ניתוח — הוא סימן אזהרה.', '"Everyone is making money" is not analysis — it is a warning sign.') }],
      work: { kind: 'charts', charts: [1] }
    },
    {
      heading: L('סימנים של הונאה', 'Signs of fraud'),
      paragraphs: [
        L('הונאות השקעה (Investment Scams) מנצלות בדיוק את מה שלמדתם במסלול הזה: שנאת הפסד, פחד להחמיץ, ורצון בתשואה גבוהה בלי סיכון. הן משתנות בצורה, אבל חוזרות על אותם סימנים.',
          'Investment scams exploit exactly what you learned in this track: loss aversion, fear of missing out, and the wish for a high return without risk. They change in form, but repeat the same signs.'),
        L('הכלל הבסיסי: תשואה והבטחה לא הולכות יחד. כל מי שמבטיח רווח גבוה וקבוע — מתאר משהו שלא קיים בשוק. ושיטת פונזי (Ponzi) — שבה כסף של משקיעים חדשים משלם "רווחים" לוותיקים — נראית מצוין בדיוק עד שהגיוס נעצר.',
          'The basic rule: return and promises do not go together. Anyone promising a high, steady profit is describing something that does not exist in the market. And a Ponzi scheme — where new investors\' money pays "profits" to the old ones — looks excellent right until the recruiting stops.'),
        L('לפני שמעבירים כסף: בודקים שהגוף מפוקח, מבינים מאיפה הרווח אמור להגיע, ולא מחליטים תחת לחץ זמן. אם משהו נשמע טוב מכדי להיות אמיתי — כנראה שהוא לא אמיתי.', 'Before transferring money: check that the firm is regulated, understand where the profit is supposed to come from, and never decide under time pressure. If something sounds too good to be true — it probably is.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('שישה סימנים', 'Six signs'), columns: [L('סימן', 'Sign'), L('למה הוא מדאיג', 'Why it is a worry')], rows: SCAM_FLAGS.map(([h, e, wh, we]) => ({ label: L(h, e), cells: [L(wh, we)] })) } }
    }
  ],
  charts: R7_CHARTS,
  activity: {
    kind: 'checklist',
    prompt: L('מה עושים עכשיו?', 'What now?'),
    task: L(`התיק שלכם ירד כמו בגרף — מ־${money(PORTFOLIO_START).he} ל־${money(port).he}. ענו לפי הסדר.`, `Your portfolio fell like the chart — from ${money(PORTFOLIO_START).en} to ${money(port).en}. Answer in order.`),
    chart: 0,
    items: [
      { id: 'sell', question: L('אם מוכרים הכול עכשיו —', 'If you sell everything now —'), options: [{ key: 'lock', label: L('ההפסד על הנייר הופך להפסד אמיתי', 'The loss on paper becomes a real loss') }, { key: 'safe', label: L('ההפסד נמחק', 'The loss is erased') }, { key: 'none', label: L('זה לא משנה דבר', 'It changes nothing') }], correct: 'lock',
        why: L(`עד המכירה, ${money(PORTFOLIO_START - port).he} הם ירידה בשווי. אחרי המכירה — הפסד סופי, בלי חלק בהתאוששות אם תבוא.`, `Until the sale, ${money(PORTFOLIO_START - port).en} is a fall in value. After it — a final loss, with no share in a recovery if one comes.`) },
      { id: 'back', question: L(`כדי לחזור ל־${money(PORTFOLIO_START).he} התיק צריך לעלות ב־`, `To get back to ${money(PORTFOLIO_START).en} the portfolio has to rise by`), options: [{ key: 'r', label: L(pc(recoveryPct(crDd)), pc(recoveryPct(crDd))) }, { key: 'd', label: L(pc(crDd, 0), pc(crDd, 0)) }, { key: 'x', label: L(pc(crDd * 2, 0), pc(crDd * 2, 0)) }], correct: 'r',
        why: L(`${ltr(`${n0(PORTFOLIO_START)} ÷ ${n0(port)} − 1 = ${pc(recoveryPct(crDd))}`)} — המתמטיקה של הפסד מהשיעור הראשון.`, `${n0(PORTFOLIO_START)} ÷ ${n0(port)} − 1 = ${pc(recoveryPct(crDd))} — the maths of a loss from the first lesson.`) },
      { id: 'offer', question: L('מגיעה הודעה: "קרן שמבטיחה 10% בחודש, בלי סיכון — להחזיר את ההפסד מהר". מה זה?', 'A message arrives: "A fund that guarantees 10% a month, risk-free — win back your loss fast". What is it?'), options: [{ key: 'flag', label: L('סימן אזהרה מובהק להונאה', 'A clear warning sign of fraud') }, { key: 'good', label: L('הזדמנות לחזור מהר', 'A chance to get back fast') }, { key: 'check', label: L('כדאי לנסות עם סכום קטן', 'Worth trying with a small amount') }], correct: 'flag',
        why: L('תשואה "מובטחת", גבוהה, "בלי סיכון" — ובדיוק ברגע שבו אתם רוצים להחזיר הפסד. הונאות מכוונות לרגעים כאלה.', 'A "guaranteed", high, "risk-free" return — exactly when you want to win back a loss. Scams aim at moments like this.') },
      { id: 'protect', question: L('מה הכי מגן עליכם לפני הירידה הבאה?', 'What protects you most before the next fall?'), options: [{ key: 'plan', label: L('הקצאה וכללים שנקבעו מראש, בגודל שאפשר לשאת', 'An allocation and rules set in advance, at a size you can bear') }, { key: 'guess', label: L('לנחש מתי השוק יירד ולצאת לפני', 'Guessing when the market will fall and getting out first') }, { key: 'cash', label: L('להחזיק תמיד רק מזומן', 'Always holding only cash') }], correct: 'plan',
        why: L('את הירידה אי אפשר לתזמן; את התגובה אפשר לתכנן. זה בדיוק הפרויקט של השיעור הבא.', 'The fall cannot be timed; the reaction can be planned. That is exactly the next lesson\'s project.') }
    ],
    right: L('מכירה בתחתית הופכת ירידה להפסד, החזרה דורשת יותר ממה שירד, הצעות "להחזיר מהר" הן מלכודת — והתוכנית נכתבת לפני.', 'Selling at the bottom turns a fall into a loss, getting back takes more than was lost, offers to "win it back fast" are a trap — and the plan is written beforehand.'),
    explain: [
      L(`מה כל בחירה עולה: מי שמכר בשפל (${n2(crLow.price)}) נעל ${pc(crDd, 0)} הפסד. מי שהחזיק ראה את המחיר חוזר ל־${n2(crEnd)} עד סוף הגרף — ${pc((crEnd / crLow.price - 1) * 100, 0)} מעל השפל. מי שהשלים את החלק של המניות לפי תוכנית, קנה בזול יותר.`,
        `What each choice costs: whoever sold at the low (${n2(crLow.price)}) locked in a ${pc(crDd, 0)} loss. Whoever held saw the price come back to ${n2(crEnd)} by the end of the chart — ${pc((crEnd / crLow.price - 1) * 100, 0)} above the low. Whoever topped up the stock share according to plan bought cheaper.`),
      L('אבל זה בדיעבד, ובגרף אחד. התאוששות לא מובטחת, במיוחד במניה בודדת. לכן ההחלטה הנכונה היא לא "תמיד להחזיק" — אלא להחזיק תיק שאפשר לשאת את הירידות שלו, ולפעול לפי כללים שנקבעו כשהיה שקט.', 'But that is hindsight, on one chart. A recovery is not guaranteed, especially in a single stock. So the right decision is not "always hold" — it is to hold a portfolio whose falls you can bear, and to act by rules set when things were calm.')
    ]
  },
  apply: rq('r7-apply', 'R7', { type: 'table', title: L('"מועדון השקעות"', 'An "investment club"'), columns: [L('מה מציעים', 'What is offered'), L('פרט', 'Detail')], rows: [
    { label: L('תשואה', 'Return'), cells: [L('5% בשבוע, קבוע', '5% a week, steady')] },
    { label: L('משיכה', 'Withdrawal'), cells: [L('רק אחרי חצי שנה', 'Only after six months')] },
    { label: L('בונוס', 'Bonus'), cells: [L('על כל חבר שמצטרף', 'For every friend who joins')] }
  ] }, 'beginner',
    L('איך לקרוא את ההצעה?', 'How should the offer be read?'),
    [
      ['a', L('סימנים של שיטת פונזי: תשואה קבועה וגבוהה, קושי למשוך, ורווח מגיוס — להתרחק', 'Signs of a Ponzi scheme: a high steady return, hard withdrawal, and profit from recruiting — stay away')],
      ['b', L('השקעה טובה אם החברים מרוויחים', 'A good investment if friends are making money')],
      ['c', L('כדאי להשקיע מעט ולמשוך מהר', 'Worth investing a little and withdrawing fast')],
      ['d', L('הצעה רגילה של קרן', 'An ordinary fund offer')]
    ], 'a',
    L('שלושה סימנים מהטבלה בהצעה אחת: תשואה "קבועה" שאין בשוק, כסף שקשה להוציא, ותגמול על גיוס. "חברים שכבר הרוויחו" הם בדיוק איך שיטת פונזי נראית לפני הקריסה.', 'Three signs from the table in one offer: a "steady" return the market does not have, money that is hard to get out, and rewards for recruiting. "Friends who already made money" is exactly what a Ponzi scheme looks like before the collapse.')),
  takeaway: {
    bottomLine: L('ירידות חדות הן חלק מהשוק; מכירה בתחתית הופכת אותן להפסד. בועה היא מחיר שמתנתק מהעסק. הונאה מבטיחה תשואה בלי סיכון ולוחצת להחליט מהר.', 'Sharp falls are part of the market; selling at the bottom turns them into a loss. A bubble is a price that comes loose from the business. A scam promises return without risk and pushes you to decide fast.'),
    caveat: L('התאוששות אינה מובטחת, ובועות ברורות בעיקר בדיעבד. ההגנה היא תיק בגודל שאפשר לשאת וכללים שנקבעו מראש — לא ניחוש של התחתית או של הפסגה.', 'A recovery is not guaranteed, and bubbles are clear mostly in hindsight. The defence is a portfolio sized so you can bear it and rules set in advance — not guessing the bottom or the top.')
  },
  questions: [
    rq('r7-bubble', 'R7', { type: 'table', title: L('מניה בשנה אחת', 'A stock over one year'), columns: [L('נתון', 'Figure'), L('בתחילת השנה', 'Start of the year'), L('בסוף השנה', 'End of the year')], rows: [
      { label: L('מחיר המניה', 'Share price'), cells: [n2(buStart), n2(buPeak.price)] },
      { label: L('רווח למניה', 'Earnings per share'), cells: [n2(BUBBLE_EPS), n2(BUBBLE_EPS)] }
    ] }, 'intermediate', L('מה הטבלה מרמזת?', 'What does the table hint at?'),
      [['a', L('המחיר התנתק מהרווחים — סימן של בועה', 'The price came loose from the profits — a sign of a bubble')], ['b', L('החברה השתפרה פי כמה', 'The company improved several times over')], ['c', L('המניה זולה', 'The stock is cheap')], ['d', L('שום דבר', 'Nothing')]], 'a',
      L(`המחיר עלה פי ${(buPeak.price / buStart).toFixed(1)} בזמן שהרווח לא זז. כמה משלמים על כל שקל רווח גדל פי ${(buPeak.price / buStart).toFixed(1)} — זה לא עסק שהשתפר, זה מחיר שהתנתק ממנו.`, `The price rose ${(buPeak.price / buStart).toFixed(1)} times while the profit did not move. What is paid for each unit of profit grew ${(buPeak.price / buStart).toFixed(1)} times — that is not a business that improved, it is a price that came loose from it.`)),
    rq('r7-recover', 'R7', { type: 'table', title: L('תיק אחרי ירידה', 'A portfolio after a fall'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [{ label: L('לפני', 'Before'), cells: [money(PORTFOLIO_START)] }, { label: L('אחרי', 'After'), cells: [money(PORTFOLIO_START * (1 - BIG_FALL / 100))] }] }, 'beginner',
      L('בכמה אחוזים התיק צריך לעלות כדי לחזור?', 'By what percentage does the portfolio have to rise to get back?'),
      nums([pc(recoveryPct(BIG_FALL)), pc(BIG_FALL, 0), pc(BIG_FALL * 1.2, 0), pc(recoveryPct(BIG_FALL) * 2)]), 'a',
      L(`${ltr(`${n0(PORTFOLIO_START)} ÷ ${n0(PORTFOLIO_START * (1 - BIG_FALL / 100))} − 1 = ${pc(recoveryPct(BIG_FALL))}`)}.`, `${n0(PORTFOLIO_START)} ÷ ${n0(PORTFOLIO_START * (1 - BIG_FALL / 100))} − 1 = ${pc(recoveryPct(BIG_FALL))}.`)),
    rq('r7-safe', 'R7', { type: 'table', title: L('ארבע הצעות', 'Four offers'), columns: [L('הצעה', 'Offer'), L('פרט', 'Detail')], rows: [
      { label: L('א', 'A'), cells: [L('"תשואה מובטחת של 3% בחודש"', '"A guaranteed 3% a month"')] },
      { label: L('ב', 'B'), cells: [L('"רק היום — מקומות אחרונים"', '"Today only — last places"')] },
      { label: L('ג', 'C'), cells: [L('קרן מפוקחת, בלי הבטחת תשואה, משיכה בכל יום', 'A regulated fund, no return promised, withdraw any day')] },
      { label: L('ד', 'D'), cells: [L('"שיטה סודית, אל תספרו לאף אחד"', '"A secret method, tell no one"')] }
    ] }, 'beginner', L('באיזו הצעה אין סימן אזהרה מהרשימה?', 'Which offer shows none of the warning signs?'),
      [['a', L('א', 'A')], ['b', L('ב', 'B')], ['c', L('ג', 'C')], ['d', L('ד', 'D')]], 'c',
      L('ג: מפוקחת, לא מבטיחה תשואה, ומאפשרת למשוך. זה לא הופך אותה להשקעה טובה — רק לכזו שאפשר לבדוק. בשאר: הבטחה, לחץ, וסודיות.', 'C: regulated, promises no return, and lets you withdraw. That does not make it a good investment — only one you can check. The others: a promise, pressure, and secrecy.'))
  ]
};

// ---------- R8 · the project: a first portfolio ----------
const ret = (id: string, y: 'good' | 'bad') => profileReturn(PROFILES.find((p) => p.id === id)!.weights, y);
const end = (r: number) => PORTFOLIO_START * (1 + r / 100);
const bal = PROFILES.find((p) => p.id === 'm')!;
const balBad = ret('m', 'bad');
const stockAfter = (bal.weights[0]! * (1 + ASSETS[0]!.bad / 100)) / (100 + balBad) * 100;
const fits = PROFILES.filter((p) => -profileReturn(p.weights, 'bad') <= MAX_LOSS);
/** The four assets' returns in a year and each profile's weights — with the profiles' results, or without them when those are what is asked. */
const yearTable = (y: 'good' | 'bad', title: { he: string; en: string }, total = true): Diagram => ({
  type: 'table', title: L(`${title.he} · משקל בכל תיק`, `${title.en} · weight in each portfolio`),
  columns: [L('נכס', 'Asset'), L('תשואה בשנה', 'Return in the year'), ...PROFILES.map((p) => p.name)],
  rows: [
    ...ASSETS.map((a, i) => ({ label: a.name, cells: [pc(a[y], 0), ...PROFILES.map((p) => pc(p.weights[i]!, 0))] })),
    ...(total ? [{ label: L('תשואת התיק', 'Portfolio return'), cells: ['', ...PROFILES.map((p) => pc(profileReturn(p.weights, y)))], kind: 'total' as const }] : [])
  ]
});

export const R8: LessonContent = {
  id: 'R8',
  tutor: { topic: 'portfolio', label: L('בניית תיק', 'building a portfolio') },
  teach: [
    {
      heading: L('מתחילים ממכם, לא מהשוק', 'Start from you, not from the market'),
      paragraphs: [
        L('פרופיל סיכון (Risk Profile) הוא התשובה לשאלה כמה סיכון מתאים לכם — לא לשוק ולא לשכן. הוא נקבע משלושה דברים: מתי תצטרכו את הכסף, כמה ירידה תוכלו לשאת בלי למכור בפאניקה, וכמה ניסיון יש לכם עם ירידות כאלה.',
          'A risk profile is the answer to how much risk fits you — not the market, not the neighbour. It is set by three things: when you will need the money, how big a fall you can bear without selling in a panic, and how much experience you have of such falls.'),
        L(`בפרויקט הזה ההנחה היא שהכסף לא נחוץ בשנים הקרובות, ושהירידה המקסימלית שתוכלו לשאת בשנה רעה היא ${pc(MAX_LOSS, 0)}. המספר הזה — ההפסד המקסימלי שמוכנים לספוג — יקבע את כל השאר.`,
          `In this project the assumption is that the money is not needed in the next few years, and that the largest fall you can bear in a bad year is ${pc(MAX_LOSS, 0)}. That number — the maximum loss you are prepared to take — will decide everything else.`),
        L('שלושה פרופילים נפוצים: זהיר, מאוזן ואגרסיבי. ההבדל ביניהם הוא לא "מי חכם יותר" אלא כמה מהתיק במניות — הנכס שמרוויח הכי הרבה לאורך זמן ויורד הכי חזק בדרך.', 'Three common profiles: cautious, balanced and aggressive. The difference between them is not "who is smarter" but how much of the portfolio is in stocks — the asset that earns the most over time and falls the hardest on the way.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('מה קובע פרופיל סיכון', 'What sets a risk profile'), columns: [L('שאלה', 'Question'), L('למה היא חשובה', 'Why it matters')], rows: [
        { label: L('מתי צריך את הכסף?', 'When is the money needed?'), cells: [L('אופק קצר לא משאיר זמן להתאוששות', 'A short horizon leaves no time to recover')] },
        { label: L('כמה ירידה אפשר לשאת?', 'How big a fall can you bear?'), cells: [L(`בפרויקט: עד ${pc(MAX_LOSS, 0)} בשנה רעה`, `In the project: up to ${pc(MAX_LOSS, 0)} in a bad year`)] },
        { label: L('איך הגבתם לירידות בעבר?', 'How did you react to falls before?'), cells: [L('ההתנהגות בפועל חשובה יותר מהכוונה', 'Actual behaviour matters more than intention')] }
      ] } }
    },
    {
      heading: L('הקצאה: כמה במה', 'Allocation: how much in what'),
      paragraphs: [
        L(`הקצאה (Asset Allocation) מתרגמת את הפרופיל לחלוקה. ארבעה נכסים: ${ASSETS.map((a) => a.name.he).join(', ')}. ${PROFILES.map((p) => `${p.name.he}: ${p.weights[0]}% במניות`).join('; ')}.`,
          `Asset allocation turns the profile into a split. Four assets: ${ASSETS.map((a) => a.name.en).join(', ')}. ${PROFILES.map((p) => `${p.name.en}: ${p.weights[0]}% in stocks`).join('; ')}.`),
        L('למה לא הכול במניות? בגלל מה שראיתם בשיעור על פיזור: אג״ח, זהב ומזומן לא זזים כמו מניות, ולכן הם מרככים את הירידות. המחיר: בשנים טובות, התיק מרוויח פחות.', 'Why not everything in stocks? Because of what you saw in the lesson on diversification: bonds, gold and cash do not move like stocks, so they soften the falls. The price: in good years, the portfolio earns less.'),
        L('המספרים בפרויקט היפותטיים — תשואות שבחרנו כדי להראות שנה טובה ושנה רעה במיוחד, לא תחזית ולא נתוני עבר של מדד מסוים.', 'The project\'s numbers are hypothetical — returns chosen to show a good year and a very bad one, not a forecast and not the past data of any particular index.')
      ],
      work: { kind: 'diagram', diagram: { type: 'stacks', title: L('שלוש הקצאות · %', 'Three allocations · %'), columns: PROFILES.map((p) => ({ label: p.name, total: '100%', parts: ASSETS.map((a, i) => ({ label: a.name, value: p.weights[i]!, shown: pc(p.weights[i]!, 0), tone: a.tone })).filter((x) => x.value > 0) })) } }
    },
    {
      heading: L('שנה טובה', 'A good year'),
      paragraphs: [
        L(`בשנה טובה, המניות עולות ${pc(ASSETS[0]!.good, 0)} ושאר הנכסים זזים מעט. תשואת כל תיק היא סכום התשואות לפי המשקלים: ${PROFILES.map((p) => `${p.name.he} ${pc(profileReturn(p.weights, 'good'))}`).join(', ')}.`,
          `In a good year, stocks rise ${pc(ASSETS[0]!.good, 0)} and the other assets move a little. Each portfolio's return is the sum of returns by weight: ${PROFILES.map((p) => `${p.name.en} ${pc(profileReturn(p.weights, 'good'))}`).join(', ')}.`),
        L(`על ${money(PORTFOLIO_START).he}: ${PROFILES.map((p) => `${p.name.he} מסיים ב־${money(end(profileReturn(p.weights, 'good'))).he}`).join('; ')}. בשנה כזו, האגרסיבי נראה כמו ההחלטה הנכונה.`,
          `On ${money(PORTFOLIO_START).en}: ${PROFILES.map((p) => `${p.name.en} ends at ${money(end(profileReturn(p.weights, 'good'))).en}`).join('; ')}. In a year like this, aggressive looks like the right decision.`),
        L('וזו בדיוק המלכודת: בוחרים תיק לפי השנה הטובה, ומגלים את הסיכון שלו רק בשנה הרעה. לכן השלב הבא הוא העיקר.', 'And that is exactly the trap: a portfolio is chosen by the good year, and its risk is discovered only in the bad one. So the next step is the main one.')
      ],
      work: { kind: 'diagram', diagram: yearTable('good', L('שנה טובה', 'A good year')) }
    }
  ],
  charts: [],
  activity: {
    kind: 'checklist',
    prompt: L('שנה רעה', 'A bad year'),
    task: L(`עכשיו שנה רעה במיוחד: המניות יורדות ${pc(-ASSETS[0]!.bad, 0)}. זכרו — אתם יכולים לשאת עד ${pc(MAX_LOSS, 0)} ירידה. ענו לפי הסדר.`, `Now a very bad year: stocks fall ${pc(-ASSETS[0]!.bad, 0)}. Remember — you can bear up to a ${pc(MAX_LOSS, 0)} fall. Answer in order.`),
    diagram: yearTable('bad', L('שנה רעה במיוחד', 'A very bad year'), false),
    items: [
      { id: 'balanced', question: L(`מה תשואת התיק המאוזן בשנה הרעה?`, `What is the balanced portfolio's return in the bad year?`), options: [{ key: 'r', label: L(pc(balBad), pc(balBad)) }, { key: 'st', label: L(pc(ASSETS[0]!.bad, 0), pc(ASSETS[0]!.bad, 0)) }, { key: 'c', label: L(pc(ret('c', 'bad')), pc(ret('c', 'bad'))) }], correct: 'r',
        why: L(`${ltr(bal.weights.map((w, i) => `${w}% × ${ASSETS[i]!.bad}%`).join(' + '))} = ${pc(balBad)}. אג״ח וזהב ריככו את ${pc(ASSETS[0]!.bad, 0)} של המניות.`, `${bal.weights.map((w, i) => `${w}% × ${ASSETS[i]!.bad}%`).join(' + ')} = ${pc(balBad)}. Bonds and gold softened the stocks' ${pc(ASSETS[0]!.bad, 0)}.`) },
      { id: 'fits', question: L(`אילו תיקים נשארים בתוך הגבול של ${pc(MAX_LOSS, 0)}?`, `Which portfolios stay within the ${pc(MAX_LOSS, 0)} limit?`), options: [{ key: 'c', label: L('רק הזהיר', 'Only cautious') }, { key: 'cm', label: L('הזהיר והמאוזן', 'Cautious and balanced') }, { key: 'all', label: L('שלושתם', 'All three') }], correct: 'c',
        why: L(`${PROFILES.map((p) => `${p.name.he} ${pc(profileReturn(p.weights, 'bad'))}`).join(', ')}. רק ${fits.map((p) => p.name.he).join(', ')} בתוך הגבול.`, `${PROFILES.map((p) => `${p.name.en} ${pc(profileReturn(p.weights, 'bad'))}`).join(', ')}. Only ${fits.map((p) => p.name.en).join(', ')} stays within the limit.`) },
      { id: 'rebalance', question: L(`אחרי השנה הרעה, המניות בתיק המאוזן כבר רק ${pc(stockAfter)} ממנו, במקום ${pc(bal.weights[0]!, 0)}. מה זה איזון מחדש?`, `After the bad year, stocks are only ${pc(stockAfter)} of the balanced portfolio, instead of ${pc(bal.weights[0]!, 0)}. What is rebalancing?`), options: [{ key: 'buy', label: L(`להשלים מניות בחזרה ל־${pc(bal.weights[0]!, 0)} — לקנות אחרי הירידה, לפי התוכנית`, `Topping stocks back up to ${pc(bal.weights[0]!, 0)} — buying after the fall, by the plan`) }, { key: 'sell', label: L('למכור את שאר המניות', 'Selling the rest of the stocks') }, { key: 'wait', label: L('לחכות שהשוק יחליט', 'Waiting for the market to decide') }], correct: 'buy',
        why: L('איזון מחדש מחזיר את המשקלים ליעד: אחרי ירידה הוא קונה את מה שירד, אחרי עלייה מוכר את מה שעלה — בלי לנחש, רק לפי הכלל.', 'Rebalancing brings the weights back to target: after a fall it buys what fell, after a rise it sells what rose — without guessing, just by the rule.') }
    ],
    right: L(`בשנה רעה, רק התיק הזהיר נשאר בתוך ${pc(MAX_LOSS, 0)}. את התיק בוחרים לפי השנה הרעה שאפשר לשאת — לא לפי השנה הטובה.`, `In a bad year, only the cautious portfolio stays within ${pc(MAX_LOSS, 0)}. You choose a portfolio by the bad year you can bear — not by the good year.`),
    explain: [
      L(`מה הייתם עושים? שלוש תגובות, על התיק המאוזן שירד ל־${money(end(balBad)).he}: למכור הכול — הופך ירידה להפסד ומחמיץ את ההתאוששות אם תבוא. לא לגעת — עובד, אם התיק מתאים לכם מלכתחילה. להשלים מניות (איזון מחדש) — קונה בזול לפי כלל, בלי לנחש את התחתית.`,
        `What would you do? Three reactions, on the balanced portfolio that fell to ${money(end(balBad)).en}: sell everything — turns a fall into a loss and misses the recovery if one comes. Do nothing — works, if the portfolio suits you in the first place. Top up stocks (rebalance) — buys cheaper by a rule, without guessing the bottom.`),
      L('ואם כבר בשנה הראשונה גיליתם שהירידה גדולה ממה שאתם יכולים לשאת — זה לא כישלון, זה מידע: הפרופיל שלכם זהיר יותר ממה שחשבתם. מתאימים את ההקצאה כשרגוע, לא באמצע הירידה.', 'And if in the very first year you find the fall is bigger than you can bear — that is not a failure, it is information: your profile is more cautious than you thought. Adjust the allocation when things are calm, not in the middle of the fall.')
    ]
  },
  apply: rq('r8-apply', 'R8', { type: 'table', title: L('בחירה לפי השנה הטובה', 'Choosing by the good year'), columns: [L('תיק אגרסיבי', 'Aggressive portfolio'), L('ערך', 'Value')], rows: [
    { label: L('בשנה טובה', 'In a good year'), cells: [pc(ret('a', 'good'))] },
    { label: L('בשנה רעה', 'In a bad year'), cells: [pc(ret('a', 'bad'))] },
    { label: L('ההפסד המקסימלי שלכם', 'Your maximum loss'), cells: [pc(-MAX_LOSS, 0)] }
  ] }, 'intermediate',
    L('בחרתם אגרסיבי, כי הוא הרוויח הכי הרבה בשנה הטובה. מה הבעיה?', 'You chose aggressive, because it earned the most in the good year. What is the problem?'),
    [
      ['a', L(`בשנה רעה הוא יורד ${pc(-ret('a', 'bad'))} — יותר מפי שניים מהגבול שלכם; סביר שתמכרו בפאניקה`, `In a bad year it falls ${pc(-ret('a', 'bad'))} — more than twice your limit; you would likely sell in a panic`)],
      ['b', L('אין בעיה — לטווח ארוך מניות תמיד מנצחות', 'No problem — over the long run stocks always win')],
      ['c', L('הוא לא מספיק אגרסיבי', 'It is not aggressive enough')],
      ['d', L('הבעיה היא הזהב', 'The problem is the gold')]
    ], 'a',
    L(`${money(PORTFOLIO_START).he} היו הופכים ל־${money(end(ret('a', 'bad'))).he}. תיק שמרוויח יותר בשנים טובות שווה רק אם אפשר להחזיק אותו בשנים רעות. את ההקצאה קובע ההפסד שאפשר לשאת.`, `${money(PORTFOLIO_START).en} would become ${money(end(ret('a', 'bad'))).en}. A portfolio that earns more in good years is only worth it if you can hold it through bad ones. The allocation is set by the loss you can bear.`)),
  takeaway: {
    bottomLine: L('כללים מראש: בוחרים הקצאה לפי ההפסד המקסימלי שאפשר לשאת בשנה רעה; מפזרים בין נכסים שזזים שונה; מגדירים מתי מאזנים מחדש — ופועלים לפי הכללים גם כשזה מפחיד.', 'Rules in advance: choose an allocation by the largest loss you can bear in a bad year; divide it across assets that move differently; set when you rebalance — and follow the rules even when it is frightening.'),
    caveat: L('תשואות הפרויקט היפותטיות. שנה רעה אמיתית יכולה להיות גרועה יותר, והפרופיל שלכם משתנה עם החיים — לכן בודקים את התיק מחדש כשהנסיבות משתנות, לא כשהשוק משתנה.', 'The project\'s returns are hypothetical. A real bad year can be worse, and your profile changes with your life — so revisit the portfolio when your circumstances change, not when the market does.')
  },
  questions: [
    rq('r8-good', 'R8', yearTable('good', L('שנה טובה', 'A good year'), false), 'beginner', L('כמה מרוויח התיק הזהיר בשנה הטובה?', 'How much does the cautious portfolio make in the good year?'),
      nums([pc(ret('c', 'good')), pc(ret('m', 'good')), pc(ASSETS[0]!.good, 0), pc(ret('a', 'good'))]), 'a',
      L(`${ltr(PROFILES[0]!.weights.map((w, i) => `${w}% × ${ASSETS[i]!.good}%`).join(' + '))} = ${pc(ret('c', 'good'))}. פחות מהאחרים — המחיר של ירידה קטנה בשנה רעה.`, `${PROFILES[0]!.weights.map((w, i) => `${w}% × ${ASSETS[i]!.good}%`).join(' + ')} = ${pc(ret('c', 'good'))}. Less than the others — the price of a small fall in a bad year.`)),
    rq('r8-end', 'R8', yearTable('bad', L('שנה רעה במיוחד', 'A very bad year')), 'intermediate', L(`כמה ישאר מ־${money(PORTFOLIO_START).he} בתיק האגרסיבי אחרי השנה הרעה?`, `How much is left of ${money(PORTFOLIO_START).en} in the aggressive portfolio after the bad year?`),
      [['a', money(end(ret('a', 'bad')))], ['b', money(end(ASSETS[0]!.bad))], ['c', money(end(balBad))], ['d', money(end(-MAX_LOSS))]], 'a',
      L(`${ltr(`${n0(PORTFOLIO_START)} × (1 ${pc(ret('a', 'bad'))}) = ${n0(end(ret('a', 'bad')))}`)}.`, `${n0(PORTFOLIO_START)} × (1 ${pc(ret('a', 'bad'))}) = ${n0(end(ret('a', 'bad')))}.`)),
    rq('r8-rule', 'R8', { type: 'stacks', title: L('שלוש הקצאות · %', 'Three allocations · %'), columns: PROFILES.map((p) => ({ label: p.name, total: '100%', parts: ASSETS.map((a, i) => ({ label: a.name, value: p.weights[i]!, shown: pc(p.weights[i]!, 0), tone: a.tone })).filter((x) => x.value > 0) })) }, 'beginner',
      L('מה צריך לקבוע איזו הקצאה מתאימה לכם?', 'What should decide which allocation suits you?'),
      [['a', L('ההפסד שתוכלו לשאת בשנה רעה, ומתי תצטרכו את הכסף', 'The loss you can bear in a bad year, and when you will need the money')], ['b', L('התשואה בשנה הטובה', 'The return in the good year')], ['c', L('מה חברים בחרו', 'What friends chose')], ['d', L('מה השוק עשה החודש', 'What the market did this month')]], 'a',
      L('תשואה בשנה טובה קל לשאת; השאלה היא אם תחזיקו מעמד בשנה רעה. הקצאה נבחרת לפי הרגע הקשה — כי שם מתקבלות ההחלטות הגרועות.', 'A good year\'s return is easy to bear; the question is whether you hold on in a bad one. An allocation is chosen for the hard moment — because that is where the bad decisions are made.'))
  ]
};

export const RISK_3 = [R7, R8];
