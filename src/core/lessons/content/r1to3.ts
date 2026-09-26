// ---------------------------------------------------------------------------
// Risk, module 1 — understanding risk: R1 (what risk is: volatility,
// drawdown, the maths of a loss), R2 (diversification and correlation),
// R3 (time, compounding and regular investing).
//
// Sources: the approved curriculum and the Artifact's page 10 (board 10.3:
// ten stocks can be one bet; a correlation matrix; stocks against bonds).
// Builds on F4 (what diversification does) without re-teaching it. Position
// sizing is R4's, stops and targets R5's, the portfolio R8's.
// Every number comes from @core/risk/scenarios, the calculators, or a series.
// ---------------------------------------------------------------------------
import type { LessonChartSpec } from '@core/charts/lessonCharts';
import * as series from '@core/charts/series.js';
import type { Diagram, LessonContent } from './types';
import { BIG_FALL, COMPOUND, DCA, EARLY_LATE, MATRIX_ASSETS, R1_LIMIT, RETURNS, correlation, pricePath, recoveryPct } from '@core/risk/scenarios';
import type { AssetKey } from '@core/risk/scenarios';
import { compoundMonthly } from '@core/calculators/tools';
import { L, ltr, n0, n1, n2, pc, nums, money, rq, avgMove, drawdown, maxDrawdown, dailyVol } from './riskKit';

// ---------- R1 · what risk actually is ----------
const CALM = series.R1_CALM, WILD = series.R1_WILD, DD = series.R1_DD, TRY = series.R1_TRY, QD = series.R1_Q;
const first = (c: typeof CALM) => c[0]!.c, lastC = (c: typeof CALM) => c[c.length - 1]!.c;
const yr = (c: typeof CALM) => (lastC(c) / first(c) - 1) * 100;
const mCalm = avgMove(CALM), mWild = avgMove(WILD);
const ddOf = (c: typeof DD) => ({ peak: c.swings[0]!, trough: c.swings[1]!, dd: drawdown(c.swings[0]!.price, c.swings[1]!.price) });
const dd = ddOf(DD), tr = ddOf(TRY), qd = ddOf(QD);
const peakDots = (c: typeof DD) => { const x = ddOf(c); return [
  { idx: x.peak.idx, price: x.peak.price, tone: 'bull', labelAlign: 'center', labelDy: -8, label: L(`שיא ${n2(x.peak.price)}`, `Peak ${n2(x.peak.price)}`) },
  { idx: x.trough.idx, price: x.trough.price, tone: 'bear', labelAlign: 'center', labelDy: 20, label: L(`שפל ${n2(x.trough.price)}`, `Trough ${n2(x.trough.price)}`) }
]; };
const DROPS = [10, 20, 30, 50];

const R1_CHARTS: LessonChartSpec[] = [
  { candles: CALM, variant: 'price', options: { showVolume: false }, label: L(`מניה רגועה: מ־${n2(first(CALM))} ל־${n2(lastC(CALM))} בתנודות קטנות`, `A calm stock: from ${n2(first(CALM))} to ${n2(lastC(CALM))} in small moves`), caption: L('מניה רגועה', 'A calm stock'), tone: 'bull', height: 300 },
  { candles: WILD, variant: 'price', options: { showVolume: false }, label: L(`מניה תנודתית: מ־${n2(first(WILD))} ל־${n2(lastC(WILD))} דרך עליות וירידות חדות`, `A volatile stock: from ${n2(first(WILD))} to ${n2(lastC(WILD))} through sharp rises and falls`), caption: L('מניה תנודתית', 'A volatile stock'), tone: 'bear', height: 300 },
  { candles: DD, variant: 'price', options: { showVolume: false, dots: peakDots(DD) }, label: L(`ירידה מהשיא: מ־${n2(dd.peak.price)} ל־${n2(dd.trough.price)}, ואחריה התאוששות חלקית`, `A drawdown: from ${n2(dd.peak.price)} to ${n2(dd.trough.price)}, then a partial recovery`), caption: L('ירידה מהשיא', 'A drawdown'), tone: 'bear', height: 420 },
  { candles: TRY, variant: 'price', options: { showVolume: false, dots: peakDots(TRY) }, label: L(`שיא ב־${n2(tr.peak.price)} ושפל ב־${n2(tr.trough.price)}`, `A peak at ${n2(tr.peak.price)} and a trough at ${n2(tr.trough.price)}`), caption: L('מהשפל בחזרה לשיא', 'From the trough back to the peak'), tone: 'neutral', height: 400 },
  { candles: QD, variant: 'price', options: { showVolume: false, dots: peakDots(QD) }, label: L(`שיא ב־${n2(qd.peak.price)} ושפל ב־${n2(qd.trough.price)}`, `A peak at ${n2(qd.peak.price)} and a trough at ${n2(qd.trough.price)}`), caption: L('שיא ושפל', 'Peak and trough'), tone: 'neutral', height: 300 }
];
// The question asks about a 50% fall, so its table stops short of it.
const recoveryTable: Diagram = { type: 'table', title: L('ירידה, והעלייה שצריך כדי לחזור', 'A fall, and the rise needed to get back'), columns: [L('ירידה', 'Fall'), L('עלייה נדרשת', 'Rise needed')], rows: [10, 20, 30, 40].map((d) => ({ label: L(pc(d, 0), pc(d, 0)), cells: [pc(recoveryPct(d))] })) };

export const R1: LessonContent = {
  id: 'R1',
  tutor: { topic: 'risk', label: L('סיכון', 'risk') },
  teach: [
    {
      heading: L('סיכון הוא אי־ודאות', 'Risk is uncertainty'),
      paragraphs: [
        L('סיכון בשוק ההון הוא לא רק "להפסיד כסף". הוא אי־הוודאות לגבי התוצאה: כמה רחוק המחיר יכול ללכת לכל כיוון לפני שתגיעו ליעד — ומה יקרה אם תצטרכו את הכסף דווקא ברגע רע.',
          'Risk in the market is not only "losing money". It is the uncertainty about the outcome: how far the price can travel either way before you reach your goal — and what happens if you need the money at a bad moment.'),
        L(`שתי המניות בגרפים התחילו באותו מקום והגיעו כמעט לאותו מקום: הרגועה עלתה ב־${pc(yr(CALM))}, התנודתית ב־${pc(yr(WILD))}. אותה תשואה — ודרך שונה לגמרי. מי שהחזיק את התנודתית ראה בדרך ירידה עד ${n2(Math.min(...WILD.map((x) => x.l)))}, והיה צריך להחזיק מעמד.`,
          `The two stocks in the charts started in the same place and ended almost in the same place: the calm one rose ${pc(yr(CALM))}, the volatile one ${pc(yr(WILD))}. The same return — and a completely different ride. Whoever held the volatile one saw it fall as low as ${n2(Math.min(...WILD.map((x) => x.l)))} on the way, and had to hold on.`),
        L('וזה הקשר בין סיכון לסיכוי: נכסים שיכולים להרוויח יותר לאורך זמן בדרך כלל גם זזים יותר בדרך. אין תשואה גבוהה בלי תנודות — ולכן השאלה הראשונה בניהול סיכונים היא כמה תנודות אתם יכולים לשאת בלי לנטוש את התוכנית: ההפסד המקסימלי שאתם מוכנים לספוג.',
          'That is the link between risk and reward: assets that can earn more over time usually swing more on the way. There is no high return without swings — so the first question in risk management is how much swinging you can bear without abandoning the plan: the maximum loss you are prepared to take.')
      ],
      callouts: [{ kind: 'example', lead: L('תצפית', 'Observation'), text: L('אותה נקודת התחלה, אותה נקודת סיום — שתי חוויות שונות לגמרי בדרך.', 'The same start, the same finish — two completely different experiences on the way.') }],
      work: { kind: 'charts', charts: [0, 1] }
    },
    {
      heading: L('תנודתיות: כמה המחיר זז', 'Volatility: how much the price moves'),
      paragraphs: [
        L(`תנודתיות (Volatility) מודדת כמה המחיר זז בדרך כלל. דרך פשוטה לראות אותה: הגודל הממוצע של תנועה יומית. במניה הרגועה — ${pc(mCalm, 2)} ביום; בתנודתית — ${pc(mWild, 2)}, פי ${n1(mWild / mCalm)}.`,
          `Volatility measures how much the price usually moves. A simple way to see it: the average size of a daily move. In the calm stock — ${pc(mCalm, 2)} a day; in the volatile one — ${pc(mWild, 2)}, ${n1(mWild / mCalm)} times as much.`),
        L('תנודתיות היא לא הפסד בפני עצמה: מניה יכולה לזוז הרבה ולהגיע רחוק. אבל היא מגדילה שני דברים — את הסיכוי שתצטרכו למכור ברגע רע, ואת הסיכוי שתמכרו מפחד. שניהם הופכים ירידה זמנית להפסד אמיתי.',
          'Volatility is not a loss in itself: a stock can move a lot and still go far. But it raises two things — the chance you will need to sell at a bad moment, and the chance you will sell out of fear. Both turn a temporary fall into a real loss.'),
        L('מדד שתפגשו לא פעם הוא בטא (Beta): כמה מניה זזה ביחס לשוק כולו. בטא של 1 — זזה כמו השוק; 1.5 — בערך פי אחד וחצי ממנו לכל כיוון. זו עוד דרך לתאר את אותה תנודתיות, ביחס למשהו.',
          'A measure you will meet often is beta: how much a stock moves relative to the whole market. A beta of 1 — it moves like the market; 1.5 — about one and a half times as much, either way. It is another way to describe the same volatility, relative to something.')
      ],
      work: { kind: 'diagram', diagram: { type: 'bars', title: L('גודל ממוצע של תנועה יומית', 'Average size of a daily move'), bars: [
        { label: L('מניה רגועה', 'Calm stock'), value: mCalm, tone: 'ok', shown: L(pc(mCalm, 2), pc(mCalm, 2)) },
        { label: L('מניה תנודתית', 'Volatile stock'), value: mWild, tone: 'err', shown: L(pc(mWild, 2), pc(mWild, 2)) }
      ], caption: L('נתוני הדגמה. אותה תשואה שנתית, תנודתיות שונה מאוד.', 'Demo data. The same yearly return, very different volatility.') } }
    },
    {
      heading: L('ירידה מהשיא', 'The fall from the peak'),
      paragraphs: [
        L(`ירידה מהשיא (Drawdown) מודדת כמה ירדתם מהנקודה הגבוהה ביותר שהייתה לכם. כאן המחיר עלה ל־${n2(dd.peak.price)} וירד ל־${n2(dd.trough.price)}: ${ltr(`1 − ${n2(dd.trough.price)} ÷ ${n2(dd.peak.price)} = ${pc(dd.dd)}`)}.`,
          `A drawdown measures how far you have fallen from the highest point you reached. Here the price rose to ${n2(dd.peak.price)} and fell to ${n2(dd.trough.price)}: 1 − ${n2(dd.trough.price)} ÷ ${n2(dd.peak.price)} = ${pc(dd.dd)}.`),
        L(`זה המספר שאנשים מרגישים. גם בסוף התקופה, ב־${n2(lastC(DD))}, המחיר עדיין ${pc(drawdown(dd.peak.price, lastC(DD)))} מתחת לשיא — למרות שהוא גבוה מנקודת ההתחלה (${n2(first(DD))}).`,
          `That is the number people feel. Even at the end of the period, at ${n2(lastC(DD))}, the price is still ${pc(drawdown(dd.peak.price, lastC(DD)))} below the peak — although it is above where it started (${n2(first(DD))}).`),
        L('הירידה הגדולה ביותר בתקופה נקראת הירידה המקסימלית (Max Drawdown). היא עונה על שאלה פשוטה וחשובה: מה היה הרגע הכי גרוע שמי שהחזיק כאן היה צריך לעבור?',
          'The largest fall in a period is called the maximum drawdown. It answers a simple, important question: what was the worst moment someone holding this had to live through?')
      ],
      work: { kind: 'charts', charts: [2] }
    }
  ],
  charts: R1_CHARTS,
  activity: {
    kind: 'calculate',
    prompt: L('כמה צריך כדי לחזור?', 'How much to get back?'),
    task: L(`המחיר ירד מ־${n2(tr.peak.price)} ל־${n2(tr.trough.price)}. בכמה אחוזים הוא צריך לעלות מהשפל כדי לחזור לשיא? עגלו לספרה אחת אחרי הנקודה.`,
      `The price fell from ${n2(tr.peak.price)} to ${n2(tr.trough.price)}. By what percentage does it have to rise from the trough to get back to the peak? Round to one decimal place.`),
    chart: 3,
    answer: +((tr.peak.price / tr.trough.price - 1) * 100).toFixed(1),
    tolerance: 0.3,
    field: L('עלייה נדרשת, %', 'Rise needed, %'),
    mistakes: [
      { value: tr.dd, tolerance: 0.3, why: L(`זה אחוז הירידה (${pc(tr.dd)}). אבל העלייה מתחילה מבסיס קטן יותר — מהשפל — ולכן צריך אחוז גדול יותר כדי לחזור.`, `That is the percentage of the fall (${pc(tr.dd)}). But the rise starts from a smaller base — the trough — so it takes a bigger percentage to get back.`) },
      { value: tr.peak.price - tr.trough.price, tolerance: 0.05, why: L('אלה הנקודות שהמחיר צריך לעלות. עוד צעד: לחלק במחיר השפל ולהכפיל ב־100.', 'That is the points the price has to climb. One more step: divide by the trough price and multiply by 100.') },
      { value: (tr.trough.price / tr.peak.price) * 100, tolerance: 0.3, why: L('חילקתם הפוך. העלייה נמדדת מהשפל: שיא ÷ שפל, פחות 1.', 'You divided the wrong way. The rise is measured from the trough: peak ÷ trough, minus 1.') }
    ],
    steps: [
      L(`כמה צריך לעלות: ${ltr(`${n2(tr.peak.price)} − ${n2(tr.trough.price)} = ${n2(tr.peak.price - tr.trough.price)}`)}`, `How far to climb: ${n2(tr.peak.price)} − ${n2(tr.trough.price)} = ${n2(tr.peak.price - tr.trough.price)}`),
      L(`באחוזים מהשפל: ${ltr(`${n2(tr.peak.price - tr.trough.price)} ÷ ${n2(tr.trough.price)} × 100 = ${pc(recoveryPct(tr.dd))}`)}`, `As a percentage of the trough: ${n2(tr.peak.price - tr.trough.price)} ÷ ${n2(tr.trough.price)} × 100 = ${pc(recoveryPct(tr.dd))}`)
    ],
    right: L(`${pc(recoveryPct(tr.dd))}: ירידה של ${pc(tr.dd)} דורשת עלייה של ${pc(recoveryPct(tr.dd))} רק כדי לחזור לאותה נקודה.`, `${pc(recoveryPct(tr.dd))}: a fall of ${pc(tr.dd)} needs a rise of ${pc(recoveryPct(tr.dd))} just to get back to the same point.`),
    off: L('עוד לא. העלייה נמדדת מהשפל: (שיא − שפל) ÷ שפל, כפול 100.', 'Not yet. The rise is measured from the trough: (peak − trough) ÷ trough, times 100.'),
    explain: [
      L(`המתמטיקה של הפסד: ירידות ועליות לא סימטריות. ${DROPS.map((d) => `${pc(d, 0)} ← ${pc(recoveryPct(d))}`).join(' · ')}. ככל שהירידה עמוקה יותר, הדרך חזרה מתארכת מהר יותר.`,
        `The maths of a loss: falls and rises are not symmetrical. ${DROPS.map((d) => `${pc(d, 0)} → ${pc(recoveryPct(d))}`).join(' · ')}. The deeper the fall, the faster the way back grows.`),
      L('זו הסיבה שניהול סיכונים מתחיל מלהגביל הפסדים, לא מלהגדיל רווחים: הפסד קטן קל להחזיר; הפסד גדול יכול לקחת שנים. שני השיעורים הבאים על עסקה בודדת — גודל פוזיציה וסטופ — בנויים על הרעיון הזה.',
        'That is why risk management starts from limiting losses, not from growing gains: a small loss is easy to make back; a large one can take years. The lessons on a single trade — position size and the stop — are built on this idea.')
    ]
  },
  apply: rq('r1-apply', 'R1', { type: 'table', title: L('ההפסד שאתם מוכנים לשאת', 'The loss you can bear'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
    { label: L('ההפסד המקסימלי שלכם בשנה רעה', 'Your maximum loss in a bad year'), cells: [pc(R1_LIMIT.maxLoss, 0)] },
    { label: L('הירידה הגדולה ביותר של המניה בעבר', 'The stock\'s largest past fall'), cells: [pc(R1_LIMIT.pastFall, 0)] },
    { label: L('ירידה בחשבון אם כולו במניה', 'Account fall if all of it is in the stock'), cells: [pc(R1_LIMIT.pastFall, 0)] },
    { label: L(`ירידה בחשבון אם ${R1_LIMIT.share}% ממנו במניה`, `Account fall if ${R1_LIMIT.share}% of it is in the stock`), cells: [pc((R1_LIMIT.pastFall * R1_LIMIT.share) / 100, 0)] }
  ] }, 'intermediate',
    L(`אתם יכולים לשאת עד ${R1_LIMIT.maxLoss}% ירידה בשנה רעה. המניה ירדה בעבר ${R1_LIMIT.pastFall}%. מה נובע מזה?`, `You can bear up to a ${R1_LIMIT.maxLoss}% fall in a bad year. The stock has fallen ${R1_LIMIT.pastFall}% before. What follows?`),
    [
      ['a', L('לא לשים עליה את כל החשבון — רק חלק שהירידה שלו נשארת בתוך הגבול שלכם', 'Not to put the whole account on it — only a share whose fall stays within your limit')],
      ['b', L('אסור לקנות אותה אף פעם', 'Never to buy it at all')],
      ['c', L(`ירידה של ${R1_LIMIT.pastFall}% לא תחזור, אז אין בעיה`, `A ${R1_LIMIT.pastFall}% fall will not happen again, so there is no problem`)],
      ['d', L(`לחכות שהיא תרד ${R1_LIMIT.pastFall}% ואז לקנות`, `To wait for it to fall ${R1_LIMIT.pastFall}% and then buy`)]
    ], 'a',
    L(`אם כל החשבון במניה, ירידה כמו בעבר תוריד אותו ב־${R1_LIMIT.pastFall}% — יותר מכפליים מהגבול שלכם. עם ${R1_LIMIT.share}% מהחשבון, אותה ירידה היא ${pc((R1_LIMIT.pastFall * R1_LIMIT.share) / 100, 0)} מהחשבון. הסיכון נקבע גם בכמה שמים, לא רק במה — זה נושא השיעור על גודל פוזיציה.`,
      `With the whole account in the stock, a fall like the past one takes it down ${R1_LIMIT.pastFall}% — more than twice your limit. With ${R1_LIMIT.share}% of the account, the same fall is ${pc((R1_LIMIT.pastFall * R1_LIMIT.share) / 100, 0)} of the account. Risk is set by how much you put in, not only by what — the subject of the lesson on position size.`)),
  takeaway: {
    bottomLine: L('סיכון הוא אי־הוודאות לגבי התוצאה. תנודתיות מודדת כמה המחיר זז; ירידה מהשיא מודדת כמה ירדתם מהנקודה הגבוהה. ירידה של X% דורשת עלייה של יותר מ־X% כדי לחזור.', 'Risk is the uncertainty about the outcome. Volatility measures how much the price moves; a drawdown measures how far you fell from the high point. A fall of X% needs a rise of more than X% to get back.'),
    caveat: L('תנודתיות בעבר לא מבטיחה את העתיד, וירידה מקסימלית של אתמול יכולה להישבר מחר. לכן קובעים מראש את ההפסד שמוכנים לשאת — ומתאימים אליו את הגודל.', 'Past volatility does not promise the future, and yesterday\'s maximum drawdown can be broken tomorrow. So you set in advance the loss you can bear — and size to it.')
  },
  questions: [
    rq('r1-drawdown', 'R1', 4, 'beginner', L('מה הייתה הירידה מהשיא?', 'What was the drawdown?'),
      nums([pc(qd.dd), pc(recoveryPct(qd.dd)), pc(qd.peak.price - qd.trough.price, 0), pc(100 - qd.dd)]), 'a',
      L(`${ltr(`1 − ${n2(qd.trough.price)} ÷ ${n2(qd.peak.price)} = ${pc(qd.dd)}`)}. ${pc(recoveryPct(qd.dd))} הוא כמה צריך לעלות כדי לחזור — מספר אחר.`, `1 − ${n2(qd.trough.price)} ÷ ${n2(qd.peak.price)} = ${pc(qd.dd)}. ${pc(recoveryPct(qd.dd))} is how much it has to rise to get back — a different number.`)),
    rq('r1-half', 'R1', recoveryTable, 'beginner', L('תיק ירד ב־50%. בכמה הוא צריך לעלות כדי לחזור?', 'A portfolio fell 50%. By how much does it have to rise to get back?'),
      nums([pc(recoveryPct(50), 0), pc(50, 0), pc(150, 0), pc(75, 0)]), 'a',
      L(`${ltr(`1 ÷ (1 − 0.5) − 1 = ${pc(recoveryPct(50), 0)}`)}: חצי מהכסף צריך להכפיל את עצמו. זו הסיבה שמגבילים הפסדים לפני שהם גדלים.`, `1 ÷ (1 − 0.5) − 1 = ${pc(recoveryPct(50), 0)}: half the money has to double. That is why losses are limited before they grow.`)),
    rq('r1-riskier', 'R1', { type: 'table', title: L('שתי מניות, שנה אחת', 'Two stocks, one year'), columns: [L('נתון', 'Figure'), L('מניה 1', 'Stock 1'), L('מניה 2', 'Stock 2')], rows: [
      { label: L('תשואה בשנה', 'Return in the year'), cells: [pc(yr(CALM)), pc(yr(WILD))] },
      { label: L('תנועה יומית ממוצעת', 'Average daily move'), cells: [pc(mCalm, 2), pc(mWild, 2)] }
    ] }, 'intermediate', L('איזו מניה מסוכנת יותר?', 'Which stock is riskier?'),
      [['a', L('מניה 2 — אותה תשואה, תנודות גדולות פי כמה', 'Stock 2 — the same return, swings several times bigger')], ['b', L('מניה 1 — היא עלתה יותר', 'Stock 1 — it rose more')], ['c', L('שתיהן באותה מידה — התשואה זהה', 'Both equally — the return is the same')], ['d', L('אי אפשר לדעת בלי מחיר', 'You cannot tell without the price')]], 'a',
      L(`תשואה דומה (${pc(yr(CALM))} מול ${pc(yr(WILD))}), אבל התנועה היומית של מניה 2 גדולה פי ${n1(mWild / mCalm)}. הסיכון נמדד בדרך, לא רק בסוף.`, `A similar return (${pc(yr(CALM))} against ${pc(yr(WILD))}), but stock 2's daily move is ${n1(mWild / mCalm)} times bigger. Risk is measured along the way, not only at the end.`))
  ]
};

// ---------- R2 · diversification and correlation ----------
const K = (a: AssetKey, b: AssetKey) => correlation(RETURNS[a], RETURNS[b]);
const path = (k: AssetKey) => pricePath(RETURNS[k]);
const candlesOf = (k: AssetKey) => series.closesToCandles(path(k), '2024-01-02');
const mix = (a: AssetKey, b: AssetKey) => RETURNS[a].map((x, i) => (x + RETURNS[b][i]!) / 2);
const ddStocks = maxDrawdown(path('stocks')), ddMix = maxDrawdown(pricePath(mix('stocks', 'bonds')));
const volBanks = dailyVol(mix('bankA', 'bankB')), volBankBond = dailyVol(mix('bankA', 'bonds')), volBankA = dailyVol(RETURNS.bankA);
const matrix: Diagram = {
  type: 'table', title: L('מטריצת מתאם · תשואות מדומות', 'Correlation matrix · simulated returns'),
  columns: [L('נכס', 'Asset'), ...MATRIX_ASSETS.map((a) => a.name)],
  rows: MATRIX_ASSETS.map((a) => ({ label: a.name, cells: MATRIX_ASSETS.map((b) => n2(K(a.key, b.key))) }))
};
const R2_CHARTS: LessonChartSpec[] = [
  { candles: candlesOf('bankA'), variant: 'price', options: { showVolume: false, extraLines: [{ tone: 'ema20', values: path('bankB').slice(1) }] },
    label: L(`שתי מניות בנקים, בנרות ובקו, מתחילות מ־100: מתאם של ${n2(K('bankA', 'bankB'))}`, `Two bank stocks, as candles and as a line, starting from 100: a correlation of ${n2(K('bankA', 'bankB'))}`),
    caption: L('שתי מניות בנקים', 'Two bank stocks'), subcaption: L('נרות: בנק א׳ · קו כתום: בנק ב׳ · נתונים מדומים.', 'Candles: bank A · orange line: bank B · simulated data.'), tone: 'neutral', height: 400 },
  { candles: candlesOf('stocks'), variant: 'price', options: { showVolume: false, extraLines: [{ tone: 'sma50', values: path('bonds').slice(1) }] },
    label: L(`מדד מניות בנרות ואג״ח בקו, מתחילים מ־100: מתאם של ${n2(K('stocks', 'bonds'))}`, `A stock index as candles and bonds as a line, starting from 100: a correlation of ${n2(K('stocks', 'bonds'))}`),
    caption: L('מניות מול אג״ח', 'Stocks against bonds'), subcaption: L('נרות: מניות · קו כחול: אג״ח · נתונים מדומים.', 'Candles: stocks · blue line: bonds · simulated data.'), tone: 'neutral', height: 400 }
];

export const R2: LessonContent = {
  id: 'R2',
  tutor: { topic: 'diversification', label: L('פיזור ומתאם', 'diversification and correlation') },
  teach: [
    {
      heading: L('עשר מניות זה לא תמיד פיזור', 'Ten stocks is not always diversification'),
      paragraphs: [
        L('בשיעור על פיזור ראיתם שסל רחב מרכך את התנודות של מניה בודדת. אבל לא כל סל: אם כל המניות בו עולות ויורדות ביחד, זה בעצם אותו הימור עשר פעמים.',
          'In the lesson on diversification you saw that a broad basket softens the swings of a single stock. But not every basket: if all its stocks rise and fall together, it is really the same bet ten times.'),
        L(`בגרף, שתי מניות בנקים — מדומות, אבל בנויות כמו בנקים אמיתיים: שתיהן תלויות באותה כלכלה, באותה ריבית, באותן חדשות. הן זזות כמעט יחד: ${n2(K('bankA', 'bankB'))} — מספר שנקרא מתאם (Correlation).`,
          `In the chart, two bank stocks — simulated, but built like real banks: both depend on the same economy, the same interest rates, the same news. They move almost together: ${n2(K('bankA', 'bankB'))} — a number called correlation.`),
        L(`מה זה עושה לסיכון? אם מחלקים חשבון שווה בשווה בין שתיהן, התנודה היומית יורדת רק מ־${pc(volBankA, 2)} ל־${pc(volBanks, 2)} — כמעט כלום. להחזיק שתי מניות שזזות יחד זה לא לפזר.`,
          `What does that do to risk? Splitting an account evenly between them only brings the daily swing down from ${pc(volBankA, 2)} to ${pc(volBanks, 2)} — almost nothing. Holding two stocks that move together is not diversifying.`)
      ],
      work: { kind: 'charts', charts: [0] }
    },
    {
      heading: L('מתאם: מ־1− עד 1', 'Correlation: from −1 to 1'),
      paragraphs: [
        L('מתאם הוא מספר בין 1− ל־1 שמתאר עד כמה שני נכסים זזים יחד. קרוב ל־1: עולים ויורדים ביחד. קרוב ל־0: לא קשורים זה לזה. שלילי: נוטים לזוז הפוך — כשאחד יורד, השני לרוב עולה.',
          'Correlation is a number between −1 and 1 describing how much two assets move together. Close to 1: they rise and fall together. Close to 0: unrelated. Negative: they tend to move opposite — when one falls, the other usually rises.'),
        L(`בנתונים המדומים של השיעור: שני הבנקים ${n2(K('bankA', 'bankB'))}; מניות וזהב ${n2(K('stocks', 'gold'))} — כמעט לא קשורים; מניות ואג״ח ${n2(K('stocks', 'bonds'))} — נוטים לזוז הפוך.`,
          `In this lesson's simulated data: the two banks ${n2(K('bankA', 'bankB'))}; stocks and gold ${n2(K('stocks', 'gold'))} — barely related; stocks and bonds ${n2(K('stocks', 'bonds'))} — tending to move opposite.`),
        L('פיזור אמיתי הוא לשלב נכסים עם מתאם נמוך או שלילי — כך שכשחלק מהתיק נופל, חלק אחר מחזיק אותו.', 'Real diversification is combining assets with low or negative correlation — so that when part of the portfolio falls, another part holds it up.')
      ],
      callouts: [{ kind: 'caveat', lead: L('שימו לב', 'Watch out'), text: L('מתאם מתאר את העבר. במשברים, נכסים רבים נוטים פתאום לזוז יחד — בדיוק כשהפיזור הכי נחוץ.', 'Correlation describes the past. In crises, many assets suddenly tend to move together — exactly when diversification is needed most.') }],
      work: { kind: 'diagram', diagram: { type: 'table', title: L('שלושה זוגות', 'Three pairs'), columns: [L('זוג', 'Pair'), L('מתאם', 'Correlation'), L('משמעות', 'Meaning')], rows: [
        { label: L('בנק א׳ ובנק ב׳', 'Bank A and bank B'), cells: [n2(K('bankA', 'bankB')), L('זזים יחד', 'Move together')] },
        { label: L('מניות וזהב', 'Stocks and gold'), cells: [n2(K('stocks', 'gold')), L('כמעט לא קשורים', 'Barely related')] },
        { label: L('מניות ואג״ח', 'Stocks and bonds'), cells: [n2(K('stocks', 'bonds')), L('נוטים לזוז הפוך', 'Tend to move opposite')] }
      ] } }
    },
    {
      heading: L('מניות מול אג״ח', 'Stocks against bonds'),
      paragraphs: [
        L(`בגרף, מדד מניות ואג״ח ממשלתי באותה תקופה מדומה. המתאם ביניהם ${n2(K('stocks', 'bonds'))}: לא הפוכים לגמרי, אבל כשהמניות ירדו, האג״ח נטו להחזיק או לעלות.`,
          `In the chart, a stock index and government bonds over the same simulated period. Their correlation is ${n2(K('stocks', 'bonds'))}: not fully opposite, but when stocks fell, bonds tended to hold or rise.`),
        L(`התוצאה: הירידה הגדולה ביותר של המניות לבדן הייתה ${pc(ddStocks)}; תיק של חצי מניות וחצי אג״ח ירד לכל היותר ${pc(ddMix)}. התיק המשולב עדיין עולה ויורד — אבל הרגעים הכי גרועים בו רכים יותר.`,
          `The result: the stocks' largest fall on their own was ${pc(ddStocks)}; a portfolio of half stocks and half bonds fell at most ${pc(ddMix)}. The mixed portfolio still rises and falls — but its worst moments are softer.`),
        L('בשנים רבות אג״ח ממשלתיות ריככו ירידות של מניות — אבל לא בכולן. כשהריבית עולה חזק, שניהם יכולים לרדת יחד. פיזור מקטין סיכון; הוא לא מבטל אותו.', 'In many years government bonds softened stock falls — but not in all. When interest rates rise sharply, both can fall together. Diversification reduces risk; it does not remove it.')
      ],
      work: { kind: 'charts', charts: [1] }
    }
  ],
  charts: R2_CHARTS,
  activity: {
    kind: 'checklist',
    prompt: L('קראו את המטריצה', 'Read the matrix'),
    task: L('מטריצת מתאם מראה כל זוג נכסים פעם אחת בשורה ופעם בעמודה. קראו אותה, שאלה אחרי שאלה.', 'A correlation matrix shows each pair of assets once in a row and once in a column. Read it, one question at a time.'),
    diagram: matrix,
    items: [
      { id: 'opposite', question: L('איזה נכס זז הכי הרבה הפוך מהמניות?', 'Which asset moved most opposite to stocks?'), options: [{ key: 'bonds', label: L('אג״ח', 'Bonds') }, { key: 'gold', label: L('זהב', 'Gold') }, { key: 'cash', label: L('מזומן', 'Cash') }], correct: 'bonds',
        why: L(`אג״ח: ${n2(K('stocks', 'bonds'))} — המספר השלילי ביותר בשורת המניות. זהב (${n2(K('stocks', 'gold'))}) ומזומן (${n2(K('stocks', 'cash'))}) קרובים ל־0.`, `Bonds: ${n2(K('stocks', 'bonds'))} — the most negative number in the stocks row. Gold (${n2(K('stocks', 'gold'))}) and cash (${n2(K('stocks', 'cash'))}) are close to 0.`) },
      { id: 'diagonal', question: L('למה האלכסון כולו 1.00?', 'Why is the diagonal all 1.00?'), options: [{ key: 'self', label: L('כל נכס זז בדיוק כמו עצמו', 'Every asset moves exactly like itself') }, { key: 'best', label: L('אלה הנכסים הכי טובים', 'Those are the best assets') }, { key: 'error', label: L('טעות בטבלה', 'An error in the table') }], correct: 'self',
        why: L('על האלכסון כל נכס מושווה לעצמו — מתאם של 1 בהגדרה. המידע נמצא מחוץ לאלכסון.', 'On the diagonal each asset is compared with itself — a correlation of 1 by definition. The information is off the diagonal.') },
      { id: 'zero', question: L(`מתאם של ${n2(K('stocks', 'gold'))} בין מניות לזהב אומר ש־`, `A correlation of ${n2(K('stocks', 'gold'))} between stocks and gold means`), options: [{ key: 'unrelated', label: L('התנועות שלהם כמעט לא קשורות', 'Their moves are barely related') }, { key: 'opposite', label: L('תמיד זזים הפוך', 'They always move opposite') }, { key: 'same', label: L('זזים יחד', 'They move together') }], correct: 'unrelated',
        why: L('קרוב ל־0 — אין דפוס ברור. גם זה מפזר: נכס שלא קשור למניות לא נופל איתן בהכרח.', 'Close to 0 — no clear pattern. That diversifies too: an asset unrelated to stocks does not necessarily fall with them.') },
      { id: 'future', question: L('האם המספרים האלה יחזיקו גם בשנה הבאה?', 'Will these numbers hold next year too?'), options: [{ key: 'maybe', label: L('לא בטוח — מתאם משתנה, במיוחד במשברים', 'Not for sure — correlation changes, especially in crises') }, { key: 'yes', label: L('כן — מתאם הוא תכונה קבועה', 'Yes — correlation is a fixed property') }, { key: 'no', label: L('לא — הם יתהפכו', 'No — they will flip') }], correct: 'maybe',
        why: L('מתאם נמדד על תקופה שעברה. הוא נקודת מוצא טובה לתכנון — לא הבטחה.', 'Correlation is measured over a past period. It is a good starting point for planning — not a promise.') }
    ],
    right: L('אג״ח הם המפזר החזק ביותר למניות בנתונים האלה, זהב ומזומן כמעט לא קשורים אליהן — וכל זה מתאר עבר, לא עתיד.', 'Bonds are the strongest diversifier for stocks in this data, gold and cash are barely related to them — and all of it describes the past, not the future.'),
    explain: [
      L(`פיזור אמיתי: לא כמה נכסים, אלא כמה שונים הם. בנק א׳ עם בנק ב׳: תנודה יומית של ${pc(volBanks, 2)}. בנק א׳ עם אג״ח: ${pc(volBankBond, 2)}. אותו מספר נכסים — תיק רגוע הרבה יותר.`,
        `Real diversification: not how many assets, but how different they are. Bank A with bank B: a daily swing of ${pc(volBanks, 2)}. Bank A with bonds: ${pc(volBankBond, 2)}. The same number of assets — a much calmer portfolio.`)
    ]
  },
  apply: rq('r2-apply', 'R2', { type: 'table', title: L('שני תיקים, שני נכסים בכל אחד', 'Two portfolios, two assets each'), columns: [L('תיק', 'Portfolio'), L('מתאם בין הנכסים', 'Correlation between the assets'), L('תנודה יומית', 'Daily swing')], rows: [
    { label: L('חצי בנק א׳, חצי בנק ב׳', 'Half bank A, half bank B'), cells: [n2(K('bankA', 'bankB')), pc(volBanks, 2)] },
    { label: L('חצי בנק א׳, חצי אג״ח', 'Half bank A, half bonds'), cells: [n2(K('bankA', 'bonds')), pc(volBankBond, 2)] }
  ] }, 'intermediate',
    L('לשני התיקים יש בדיוק שני נכסים. למה אחד רגוע בהרבה?', 'Both portfolios hold exactly two assets. Why is one much calmer?'),
    [['a', L('הנכסים בו זזים שונה זה מזה — המתאם נמוך', 'Its assets move differently from each other — the correlation is low')], ['b', L('יש בו יותר נכסים', 'It holds more assets')], ['c', L('אג״ח תמיד עולות', 'Bonds always rise')], ['d', L('במקרה', 'By chance')]], 'a',
    L(`המתאם בין בנק לאג״ח (${n2(K('bankA', 'bonds'))}) נמוך בהרבה מבין שני הבנקים (${n2(K('bankA', 'bankB'))}). מה שמרכך תיק הוא כמה שונים הנכסים — לא כמה יש.`, `The correlation between a bank and bonds (${n2(K('bankA', 'bonds'))}) is far lower than between the two banks (${n2(K('bankA', 'bankB'))}). What softens a portfolio is how different the assets are — not how many there are.`)),
  takeaway: {
    bottomLine: L('מתאם מודד עד כמה נכסים זזים יחד, מ־1− עד 1. פיזור אמיתי משלב נכסים שזזים שונה — מתאם נמוך או שלילי — ולא רק הרבה נכסים דומים.', 'Correlation measures how much assets move together, from −1 to 1. Real diversification combines assets that move differently — low or negative correlation — not just many similar assets.'),
    caveat: L('מתאם הוא תכונה של העבר, והוא משתנה — במשברים נכסים רבים נופלים יחד. פיזור מקטין סיכון, לא מבטל אותו.', 'Correlation is a property of the past, and it changes — in crises many assets fall together. Diversification reduces risk; it does not remove it.')
  },
  questions: [
    rq('r2-same-bet', 'R2', { type: 'table', title: L('מתאמים', 'Correlations'), columns: [L('זוג', 'Pair'), L('מתאם', 'Correlation')], rows: [
      { label: L('בנק א׳ ובנק ב׳', 'Bank A and bank B'), cells: [n2(K('bankA', 'bankB'))] },
      { label: L('מניות ואג״ח', 'Stocks and bonds'), cells: [n2(K('stocks', 'bonds'))] },
      { label: L('מניות וזהב', 'Stocks and gold'), cells: [n2(K('stocks', 'gold'))] }
    ] }, 'beginner', L('איזה זוג הוא "אותו הימור פעמיים"?', 'Which pair is "the same bet twice"?'),
      [['a', L('בנק א׳ ובנק ב׳', 'Bank A and bank B')], ['b', L('מניות ואג״ח', 'Stocks and bonds')], ['c', L('מניות וזהב', 'Stocks and gold')], ['d', L('אף אחד', 'None')]], 'a',
      L(`מתאם של ${n2(K('bankA', 'bankB'))} — קרוב ל־1: הם עולים ויורדים כמעט יחד.`, `A correlation of ${n2(K('bankA', 'bankB'))} — close to 1: they rise and fall almost together.`)),
    rq('r2-negative', 'R2', matrix, 'beginner', L(`מה אומר המתאם בין מניות לאג״ח (${n2(K('stocks', 'bonds'))})?`, `What does the correlation between stocks and bonds (${n2(K('stocks', 'bonds'))}) say?`),
      [['a', L('הם נוטים לזוז הפוך — לא תמיד', 'They tend to move opposite — not always')], ['b', L('כשמניות יורדות, אג״ח תמיד עולות', 'When stocks fall, bonds always rise')], ['c', L('הם זזים יחד', 'They move together')], ['d', L('אג״ח מסוכנות יותר', 'Bonds are riskier')]], 'a',
      L('מתאם שלילי מתאר נטייה, לא כלל. בחלק מהימים שניהם ירדו יחד — ובשנים של עליית ריבית חדה זה קורה יותר.', 'A negative correlation describes a tendency, not a rule. On some days both fell together — and in years of sharp rate rises that happens more.')),
    rq('r2-drawdown', 'R2', { type: 'table', title: L('הירידה הגדולה ביותר בתקופה', 'The largest fall in the period'), columns: [L('תיק', 'Portfolio'), L('ירידה מקסימלית', 'Maximum drawdown')], rows: [
      { label: L('מניות בלבד', 'Stocks only'), cells: [pc(ddStocks)] },
      { label: L('חצי מניות, חצי אג״ח', 'Half stocks, half bonds'), cells: [pc(ddMix)] }
    ] }, 'intermediate', L('מה עשה הפיזור לרגע הכי גרוע בתיק?', 'What did diversification do to the portfolio\'s worst moment?'),
      [['a', L('ריכך אותו — הירידה המקסימלית קטנה', 'It softened it — the maximum drawdown shrank')], ['b', L('ביטל אותו', 'It removed it')], ['c', L('החמיר אותו', 'It made it worse')], ['d', L('לא שינה דבר', 'It changed nothing')]], 'a',
      L(`מ־${pc(ddStocks)} ל־${pc(ddMix)}. עדיין יש ירידה — פיזור מקטין את הרגעים הגרועים, לא מבטל אותם.`, `From ${pc(ddStocks)} to ${pc(ddMix)}. There is still a fall — diversification shrinks the worst moments, it does not remove them.`))
  ]
};

// ---------- R3 · time, compounding and regular investing ----------
const grow = (x: number, r: number, y: number) => x * (1 + r / 100) ** y;
const C = COMPOUND, cYears = [5, 10, 15, 20];
const TRY3 = { amount: 20000, ratePct: 5, years: 15 };
const tryFv = grow(TRY3.amount, TRY3.ratePct, TRY3.years);
const early = compoundMonthly(0, EARLY_LATE.early.monthly, EARLY_LATE.ratePct, EARLY_LATE.until - EARLY_LATE.early.age).at(-1)!;
const late = compoundMonthly(0, EARLY_LATE.late.monthly, EARLY_LATE.ratePct, EARLY_LATE.until - EARLY_LATE.late.age).at(-1)!;
const dcaShares = DCA.prices.map((p) => DCA.monthly / p), dcaTotal = dcaShares.reduce((s, x) => s + x, 0), dcaInvested = DCA.monthly * DCA.prices.length;
const dcaAvgCost = dcaInvested / dcaTotal, dcaAvgPrice = DCA.prices.reduce((s, x) => s + x, 0) / DCA.prices.length, dcaValue = dcaTotal * DCA.prices.at(-1)!;
const Q_DCA = { monthly: 600, prices: [20, 10, 20] };
const qShares = Q_DCA.prices.map((p) => Q_DCA.monthly / p), qAvgCost = (Q_DCA.monthly * Q_DCA.prices.length) / qShares.reduce((s, x) => s + x, 0);
const growthBars: Diagram = { type: 'bars', title: L(`${money(C.amount).he} בתשואה של ${C.ratePct}% בשנה`, `${money(C.amount).en} at ${C.ratePct}% a year`), bars: cYears.map((y) => ({ label: L(`אחרי ${y} שנים`, `After ${y} years`), value: grow(C.amount, C.ratePct, y), tone: 'learn' as const, shown: money(grow(C.amount, C.ratePct, y)) })), caption: L('תשואה קבועה להמחשה — בשוק אמיתי היא משתנה משנה לשנה.', 'A fixed return for illustration — in a real market it changes year to year.') };

export const R3: LessonContent = {
  id: 'R3',
  tutor: { topic: 'compound-interest', label: L('ריבית דריבית והפקדה קבועה', 'compounding and regular investing') },
  teach: [
    {
      heading: L('רווח שמרוויח', 'Profit that earns'),
      paragraphs: [
        L(`ריבית דריבית (Compounding) היא מה שקורה כשהרווח נשאר בפנים ומתחיל להרוויח בעצמו. ${money(C.amount).he} בתשואה של ${C.ratePct}% בשנה: אחרי שנה — ${money(grow(C.amount, C.ratePct, 1)).he}; אחרי ${C.years} שנה — ${money(grow(C.amount, C.ratePct, C.years)).he}.`,
          `Compounding is what happens when profit stays in and starts earning itself. ${money(C.amount).en} at ${C.ratePct}% a year: after one year — ${money(grow(C.amount, C.ratePct, 1)).en}; after ${C.years} years — ${money(grow(C.amount, C.ratePct, C.years)).en}.`),
        L(`שימו לב לקצב: ב־5 השנים הראשונות הסכום גדל ב־${money(grow(C.amount, C.ratePct, 5) - C.amount).he}; ב־5 האחרונות — ב־${money(grow(C.amount, C.ratePct, 20) - grow(C.amount, C.ratePct, 15)).he}. אותה תשואה, בסיס גדול יותר.`,
          `Notice the pace: in the first 5 years the amount grew by ${money(grow(C.amount, C.ratePct, 5) - C.amount).en}; in the last 5 — by ${money(grow(C.amount, C.ratePct, 20) - grow(C.amount, C.ratePct, 15)).en}. The same return, a bigger base.`),
        L(`ומה הקשר לסיכון? זמן. מי שמשקיע לטווח ארוך יכול לשאת ירידות בדרך — יש לו שנים לחכות להתאוששות. מי שצריך את הכסף בעוד שנה לא יכול: ירידה של ${BIG_FALL}% ברגע הלא נכון היא הפסד אמיתי. אופק ההשקעה (Time Horizon) קובע כמה סיכון מתאים.`,
          `And the link to risk? Time. Someone investing for the long run can bear falls on the way — they have years to wait for a recovery. Someone who needs the money in a year cannot: a ${BIG_FALL}% fall at the wrong moment is a real loss. The time horizon decides how much risk fits.`)
      ],
      work: { kind: 'diagram', diagram: growthBars }
    },
    {
      heading: L('להתחיל מוקדם', 'Starting early'),
      paragraphs: [
        L(`שני חוסכים, ${EARLY_LATE.ratePct}% בשנה, עד גיל ${EARLY_LATE.until}. הראשונה מתחילה בגיל ${EARLY_LATE.early.age} עם ${money(EARLY_LATE.early.monthly).he} בחודש; השני מתחיל בגיל ${EARLY_LATE.late.age} ומפקיד כפול — ${money(EARLY_LATE.late.monthly).he} בחודש.`,
          `Two savers, ${EARLY_LATE.ratePct}% a year, until age ${EARLY_LATE.until}. The first starts at ${EARLY_LATE.early.age} with ${money(EARLY_LATE.early.monthly).en} a month; the second starts at ${EARLY_LATE.late.age} and deposits double — ${money(EARLY_LATE.late.monthly).en} a month.`),
        L(`הם מגיעים כמעט לאותו סכום: ${money(early.balance).he} מול ${money(late.balance).he}. אבל הראשונה הפקידה מכיסה ${money(early.deposited).he}, והשני ${money(late.deposited).he}. עשר שנים נוספות של ריבית דריבית שוות כאן ${money(late.deposited - early.deposited).he} של הפקדות.`,
          `They end up with almost the same amount: ${money(early.balance).en} against ${money(late.balance).en}. But the first put in ${money(early.deposited).en} of their own money, and the second ${money(late.deposited).en}. Ten more years of compounding are worth ${money(late.deposited - early.deposited).en} of deposits here.`)
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`עד גיל ${EARLY_LATE.until}, ב־${EARLY_LATE.ratePct}% בשנה`, `Until age ${EARLY_LATE.until}, at ${EARLY_LATE.ratePct}% a year`), columns: [L('נתון', 'Figure'), L(`מתחילה ב־${EARLY_LATE.early.age}`, `Starts at ${EARLY_LATE.early.age}`), L(`מתחיל ב־${EARLY_LATE.late.age}`, `Starts at ${EARLY_LATE.late.age}`)], rows: [
        { label: L('הפקדה חודשית', 'Monthly deposit'), cells: [money(EARLY_LATE.early.monthly), money(EARLY_LATE.late.monthly)] },
        { label: L('סך ההפקדות', 'Total deposited'), cells: [money(early.deposited), money(late.deposited)] },
        { label: L('בסוף', 'At the end'), cells: [money(early.balance), money(late.balance)], kind: 'total' }
      ] } }
    },
    {
      heading: L('הפקדה קבועה: לא לנחש את הרגע', 'Regular investing: not guessing the moment'),
      paragraphs: [
        L(`הפקדה קבועה (Dollar-Cost Averaging): אותו סכום בכל חודש, בלי קשר למחיר. ${money(DCA.monthly).he} בחודש, כשהמחיר עבר ${DCA.prices.join(' ← ')}: כשהמחיר נמוך, אותו סכום קונה יותר מניות — ${DCA.prices.map((p, i) => `${n1(dcaShares[i]!)} ב־${p}`).join(', ')}.`,
          `Dollar-cost averaging: the same amount every month, whatever the price. ${money(DCA.monthly).en} a month, as the price went ${DCA.prices.join(' → ')}: when the price is low, the same amount buys more shares — ${DCA.prices.map((p, i) => `${n1(dcaShares[i]!)} at ${p}`).join(', ')}.`),
        L(`בסוף: ${n1(dcaTotal)} מניות בעלות ממוצעת של ${n2(dcaAvgCost)} — פחות מהמחיר הממוצע באותם חודשים (${n2(dcaAvgPrice)}). המחיר חזר בדיוק לנקודת ההתחלה, והתיק שווה ${money(dcaValue).he} על ${money(dcaInvested).he} שהופקדו.`,
          `At the end: ${n1(dcaTotal)} shares at an average cost of ${n2(dcaAvgCost)} — below the average price over those months (${n2(dcaAvgPrice)}). The price came back exactly to where it started, and the portfolio is worth ${money(dcaValue).en} on ${money(dcaInvested).en} deposited.`),
        L('הפקדה קבועה לא מבטיחה רווח — אם המחיר רק יורד, גם היא מפסידה. מה שהיא עושה הוא לפטור אתכם מלנחש מתי השוק בתחתית (Market Timing), משהו שכמעט אף אחד לא מצליח לעשות בעקביות.',
          'Regular investing does not promise a profit — if the price only falls, it loses too. What it does is spare you from guessing when the market is at the bottom (market timing), something almost nobody manages to do consistently.')
      ],
      work: { kind: 'diagram', diagram: { type: 'table', title: L(`${money(DCA.monthly).he} בכל חודש`, `${money(DCA.monthly).en} every month`), columns: [L('חודש', 'Month'), L('מחיר', 'Price'), L('מניות שנקנו', 'Shares bought')], rows: [
        ...DCA.prices.map((p, i) => ({ label: L(String(i + 1), String(i + 1)), cells: [n2(p), n1(dcaShares[i]!)] })),
        { label: L('סך הכול', 'Total'), cells: [L(`ממוצע ${n2(dcaAvgPrice)}`, `average ${n2(dcaAvgPrice)}`), n1(dcaTotal)], kind: 'total' as const }
      ] } }
    }
  ],
  charts: [],
  activity: {
    kind: 'calculate',
    prompt: L('כמה זה יהיה?', 'How much will it be?'),
    task: L(`${money(TRY3.amount).he} מושקעים בתשואה של ${TRY3.ratePct}% בשנה, והרווח נשאר בפנים. כמה יהיה שם אחרי ${TRY3.years} שנה? עגלו לשקל.`, `${money(TRY3.amount).en} invested at ${TRY3.ratePct}% a year, with the profit left in. How much will be there after ${TRY3.years} years? Round to the nearest whole unit.`),
    diagram: { type: 'table', title: L('הנתונים', 'The figures'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
      { label: L('סכום התחלתי', 'Starting amount'), cells: [money(TRY3.amount)] },
      { label: L('תשואה שנתית', 'Yearly return'), cells: [pc(TRY3.ratePct, 0)] },
      { label: L('שנים', 'Years'), cells: [String(TRY3.years)] }
    ], caption: L('סכום בסוף = סכום התחלתי × (1 + תשואה)^שנים', 'End amount = starting amount × (1 + return)^years') },
    answer: Math.round(tryFv),
    tolerance: 30,
    field: L('סכום בסוף', 'Amount at the end'),
    mistakes: [
      { value: TRY3.amount * (1 + (TRY3.ratePct / 100) * TRY3.years), tolerance: 30, why: L(`זו ריבית פשוטה: ${TRY3.ratePct}% מהסכום ההתחלתי בכל שנה. בריבית דריבית, כל שנה מרוויחה גם על הרווח של השנים הקודמות.`, `That is simple interest: ${TRY3.ratePct}% of the starting amount each year. With compounding, each year also earns on the previous years' profit.`) },
      { value: TRY3.amount * (1 + TRY3.ratePct / 100), tolerance: 5, why: L('זו שנה אחת בלבד. מעלים בחזקת מספר השנים.', 'That is one year only. Raise to the power of the number of years.') }
    ],
    steps: [
      L(`${ltr(`1 + ${TRY3.ratePct / 100} = ${1 + TRY3.ratePct / 100}`)}`, `1 + ${TRY3.ratePct / 100} = ${1 + TRY3.ratePct / 100}`),
      L(`${ltr(`${1 + TRY3.ratePct / 100}^${TRY3.years} = ${((1 + TRY3.ratePct / 100) ** TRY3.years).toFixed(3)}`)}`, `${1 + TRY3.ratePct / 100}^${TRY3.years} = ${((1 + TRY3.ratePct / 100) ** TRY3.years).toFixed(3)}`),
      L(`${ltr(`${n0(TRY3.amount)} × ${((1 + TRY3.ratePct / 100) ** TRY3.years).toFixed(3)} = ${n0(tryFv)}`)}`, `${n0(TRY3.amount)} × ${((1 + TRY3.ratePct / 100) ** TRY3.years).toFixed(3)} = ${n0(tryFv)}`)
    ],
    right: L(`${money(tryFv).he}: יותר מכפליים. בריבית פשוטה היו מגיעים ל־${money(TRY3.amount * (1 + (TRY3.ratePct / 100) * TRY3.years)).he} בלבד.`, `${money(tryFv).en}: more than double. With simple interest it would reach only ${money(TRY3.amount * (1 + (TRY3.ratePct / 100) * TRY3.years)).en}.`),
    off: L('עוד לא. סכום × (1 + תשואה) בחזקת מספר השנים.', 'Not yet. Amount × (1 + return) to the power of the number of years.'),
    explain: [
      L(`מה הזמן עשה: ${money(tryFv - TRY3.amount * (1 + (TRY3.ratePct / 100) * TRY3.years)).he} מהסכום הם "רווח על רווח" — מה שהריבית הפשוטה לא נותנת. וככל שהשנים מתארכות, החלק הזה גדל מהר יותר מכל השאר.`,
        `What time did: ${money(tryFv - TRY3.amount * (1 + (TRY3.ratePct / 100) * TRY3.years)).en} of the amount is "profit on profit" — what simple interest does not give. And the longer the years, the faster that part grows compared with the rest.`),
      L('אבל בשוק אמיתי התשואה לא קבועה: יש שנים של ירידה. הזמן עובד בשבילכם רק אם לא תצטרכו למכור באחת מהן — ולכן כסף שנחוץ בקרוב לא שייך לנכסים תנודתיים.', 'But in a real market the return is not fixed: there are down years. Time works for you only if you do not have to sell in one of them — which is why money needed soon does not belong in volatile assets.')
    ]
  },
  apply: rq('r3-apply', 'R3', { type: 'table', title: L('כסף לדירה בעוד שנתיים', 'Money for a flat in two years'), columns: [L('נתון', 'Figure'), L('ערך', 'Value')], rows: [
    { label: L('מתי צריך את הכסף', 'When the money is needed'), cells: [L('בעוד שנתיים', 'In two years')] },
    { label: L('ירידה שכבר קרתה במדד מניות רחב בשנה אחת', 'A fall a broad stock index has had in one year'), cells: [pc(BIG_FALL, 0)] },
    { label: L('עלייה שנדרשת אחריה כדי לחזור', 'The rise needed after it to get back'), cells: [pc(recoveryPct(BIG_FALL))] }
  ] }, 'intermediate',
    L('אתם צריכים את הכסף לדירה בעוד שנתיים. איפה כדאי שהוא יהיה?', 'You need the money for a flat in two years. Where should it be?'),
    [['a', L('בנכס יציב — פיקדון או אג״ח קצר; אין זמן לחכות להתאוששות', 'In something stable — a deposit or short bonds; there is no time to wait for a recovery')], ['b', L('כולו במניות — לטווח ארוך הן מרוויחות יותר', 'All in stocks — over the long run they earn more')], ['c', L('במניה אחת תנודתית, כדי להספיק להרוויח', 'In one volatile stock, to make a profit in time')], ['d', L('לא משנה — הכול עולה בסוף', 'It does not matter — everything rises in the end')]], 'a',
    L(`מניות מרוויחות לאורך זמן — אבל שנתיים זה לא הרבה זמן. ירידה של ${BIG_FALL}% דורשת ${pc(recoveryPct(BIG_FALL))} כדי לחזור, וזה יכול לקחת שנים. האופק קובע את הסיכון המתאים, לא התשואה הצפויה.`, `Stocks earn over time — but two years is not a long time. A ${BIG_FALL}% fall needs ${pc(recoveryPct(BIG_FALL))} to get back, and that can take years. The horizon decides the right risk, not the expected return.`)),
  takeaway: {
    bottomLine: L('ריבית דריבית מגדילה את הכסף מהר יותר ככל שעובר זמן — ולכן להתחיל מוקדם שווה הרבה. הפקדה קבועה פוטרת מהצורך לנחש את התחתית. אופק ההשקעה קובע כמה סיכון מתאים.', 'Compounding grows money faster the longer it runs — so starting early is worth a lot. Regular investing spares you from guessing the bottom. The time horizon decides how much risk fits.'),
    caveat: L('התשואות בדוגמאות קבועות להמחשה; בשוק אמיתי יש שנים רעות. זמן עובד בשבילכם רק אם לא תצטרכו למכור בזמן ירידה.', 'The returns in the examples are fixed for illustration; a real market has bad years. Time works for you only if you do not need to sell during a fall.')
  },
  questions: [
    rq('r3-avg-cost', 'R3', { type: 'table', title: L(`${money(Q_DCA.monthly).he} בכל חודש`, `${money(Q_DCA.monthly).en} every month`), columns: [L('חודש', 'Month'), L('מחיר', 'Price')], rows: Q_DCA.prices.map((p, i) => ({ label: L(String(i + 1), String(i + 1)), cells: [n2(p)] })) }, 'intermediate',
      L('מה העלות הממוצעת למניה אחרי שלושה חודשים?', 'What is the average cost per share after three months?'),
      nums([n2(qAvgCost), n2(Q_DCA.prices.reduce((s, x) => s + x, 0) / Q_DCA.prices.length), n2(10), n2(20)]), 'a',
      L(`נקנו ${qShares.map((x) => n0(x)).join(' + ')} = ${n0(qShares.reduce((s, x) => s + x, 0))} מניות ב־${money(Q_DCA.monthly * 3).he}: עלות ממוצעת ${n2(qAvgCost)} — פחות מהמחיר הממוצע (${n2(Q_DCA.prices.reduce((s, x) => s + x, 0) / 3)}), כי בחודש הזול נקנו יותר מניות.`,
        `${qShares.map((x) => n0(x)).join(' + ')} = ${n0(qShares.reduce((s, x) => s + x, 0))} shares were bought for ${money(Q_DCA.monthly * 3).en}: an average cost of ${n2(qAvgCost)} — below the average price (${n2(Q_DCA.prices.reduce((s, x) => s + x, 0) / 3)}), because the cheap month bought more shares.`)),
    rq('r3-ten-years', 'R3', { ...growthBars, bars: growthBars.bars.filter((_, i) => cYears[i] !== 10) } as Diagram, 'beginner', L(`כמה יהיו ${money(C.amount).he} אחרי 10 שנים?`, `What will ${money(C.amount).en} be after 10 years?`),
      [['a', money(grow(C.amount, C.ratePct, 10))], ['b', money(C.amount * (1 + (C.ratePct / 100) * 10))], ['c', money(grow(C.amount, C.ratePct, 20))], ['d', money(grow(C.amount, C.ratePct, 5))]], 'a',
      L(`${ltr(`${n0(C.amount)} × ${1 + C.ratePct / 100}^10 = ${n0(grow(C.amount, C.ratePct, 10))}`)} — כמעט כפליים. בריבית פשוטה: ${money(C.amount * (1 + (C.ratePct / 100) * 10)).he}.`, `${n0(C.amount)} × ${1 + C.ratePct / 100}^10 = ${n0(grow(C.amount, C.ratePct, 10))} — almost double. With simple interest: ${money(C.amount * (1 + (C.ratePct / 100) * 10)).en}.`)),
    rq('r3-early', 'R3', { type: 'table', title: L(`עד גיל ${EARLY_LATE.until}`, `Until age ${EARLY_LATE.until}`), columns: [L('חוסך', 'Saver'), L('סך ההפקדות', 'Total deposited'), L('בסוף', 'At the end')], rows: [
      { label: L(`מתחילה ב־${EARLY_LATE.early.age}`, `Starts at ${EARLY_LATE.early.age}`), cells: [money(early.deposited), money(early.balance)] },
      { label: L(`מתחיל ב־${EARLY_LATE.late.age}`, `Starts at ${EARLY_LATE.late.age}`), cells: [money(late.deposited), money(late.balance)] }
    ] }, 'intermediate', L('מה הטבלה מראה?', 'What does the table show?'),
      [['a', L('כמעט אותו סכום בסוף — אבל המאוחר הפקיד הרבה יותר מכיסו', 'Almost the same amount at the end — but the late starter put in far more of their own money')], ['b', L('להתחיל מאוחר תמיד משתלם יותר', 'Starting late always pays more')], ['c', L('ההפקדה החודשית לא משנה', 'The monthly deposit does not matter')], ['d', L('שניהם הפקידו אותו דבר', 'Both deposited the same')]], 'a',
      L(`${money(early.balance).he} מול ${money(late.balance).he}, אבל ${money(early.deposited).he} מול ${money(late.deposited).he} מהכיס. את ההפרש עשו עשר שנים נוספות של ריבית דריבית.`, `${money(early.balance).en} against ${money(late.balance).en}, but ${money(early.deposited).en} against ${money(late.deposited).en} out of pocket. Ten more years of compounding made up the difference.`))
  ]
};

export const RISK_1 = [R1, R2, R3];
