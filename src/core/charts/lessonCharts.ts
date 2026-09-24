// ---------------------------------------------------------------------------
// Which chart(s) each lesson shows.
//
// Maps a lesson to its series and the drawing options that make the teaching
// point — the annotated zones for support/resistance, the RSI sub-panel for
// the momentum lesson, and so on.
//
// A lesson can show more than one chart. Several lessons' own prose promises
// this ("in each chart below", "the first example below") — the previous
// version of this file only ever wired one chart per lesson, so those extra
// examples were silently missing on screen even though their series data
// (all 19 of them) existed in series.js.
//
// Annotation options (zones/points/dots/segments/highlights/extraLines) are
// described here by TONE and { he, en } label — never by colour or resolved
// text. Colour and the current language are a rendering concern and are
// resolved in @ui/components/charts/Chart.tsx, the same seam this file
// already used for the accessible `label`.
// ---------------------------------------------------------------------------
import type { Localized } from '@core/types/kb';
import * as series from './series.js';

export interface LessonChartSpec {
  candles: unknown[];
  variant: 'price' | 'price-rsi';
  options?: Record<string, unknown>;
  /** Accessible description, per language. A canvas is invisible without it. */
  label: Localized;
  /** The chart's title in its card header. */
  caption?: Localized;
  /** One line under the caption: what to look for in THIS chart. */
  subcaption?: Localized;
  /**
   * Tints the card header and its leading edge. Semantic, not decorative —
   * a bullish example and a bearish one are then distinguishable before
   * either label is read. Defaults to 'neutral' (informational accent).
   */
  tone?: 'neutral' | 'bull' | 'bear' | 'advanced';
  /**
   * Canvas height in CSS pixels. Set per chart because the right height is
   * a property of the CONTENT: a 20-candle single-pattern illustration needs
   * far less vertical room than a 260-candle trend, and giving both the same
   * height is what made the candlestick charts feel enormous relative to the
   * one candle they were pointing at.
   */
  height?: number;
  /**
   * Overrides the width this chart would otherwise be given. Left unset on
   * every chart in the course — the default comes from the series itself (see
   * cardLayout.ts), which is what keeps a chart the same width wherever it
   * appears. Set it only for a chart whose right width genuinely disagrees
   * with its candle count.
   */
  span?: 'full' | 'half';
}

const ma20 = series.ema(series.L3.map((c: { c: number }) => c.c), 20);
const ma150 = series.sma(series.L3.map((c: { c: number }) => c.c), 150);
// The same 20-period average, over a market with no trend in it — see the
// second l3 chart for why that case is worth its own illustration.
const l3ChopMa = series.ema(series.L3_CHOP.map((c: { c: number }) => c.c), 20);

export const LESSON_CHARTS: Record<string, LessonChartSpec[]> = {
  l1: [
    {
      candles: series.L1,
      variant: 'price',
      options: { showVolume: true },
      label: {
        he: 'גרף נרות המראה אזורי תמיכה והתנגדות שהמחיר נבדק בהם שוב ושוב',
        en: 'Candlestick chart showing support and resistance areas price repeatedly tests'
      },
      caption: { he: 'איפה המחיר נעצר שוב ושוב', en: 'Where price keeps stalling' },
      subcaption: { he: 'חפשו אזור שהמחיר הגיב ממנו יותר מפעם אחת — לא קו בודד.', en: 'Look for an area price reacted from more than once — not a single line.' },
      tone: 'neutral',
      height: 440
      // No zones by default — this lesson's exercise asks the learner to
      // guess the zone first. LessonRoute overlays the answer as zones
      // (tone: 'support' / 'resistance') only once revealed.
    },
    {
      // The lesson says "an area, not a single line". This is the chart that
      // shows why: the SAME price action reads as five failures against an
      // exact line and five holds against a band. Both are drawn here at once
      // so the comparison needs no second chart and no memory.
      candles: series.L1_ZONE,
      variant: 'price',
      options: {
        showVolume: false,
        zones: [
          {
            range: series.L1_ZONE.band,
            tone: 'support',
            // Read off the derived band, so the label cannot drift from what is
            // actually drawn.
            label: {
              he: `האזור — ${series.L1_ZONE.band[0]} עד ${series.L1_ZONE.band[1]}`,
              en: `The area — ${series.L1_ZONE.band[0]} to ${series.L1_ZONE.band[1]}`
            }
          }
        ],
        segments: [
          {
            x1: 0, y1: series.L1_ZONE.exactLine,
            x2: series.L1_ZONE.length - 1, y2: series.L1_ZONE.exactLine,
            tone: 'bear', dash: [4, 4], labelAt: 'end', labelAlign: 'right',
            label: {
              he: `הקו המדויק — ${series.L1_ZONE.exactLine}`,
              en: `The exact line — ${series.L1_ZONE.exactLine}`
            }
          }
        ]
      },
      label: {
        he: `גרף שבו המחיר חוזר שוב ושוב לאזור ${series.L1_ZONE.band[0]}–${series.L1_ZONE.band[1]}: חלק מהפניות עוצרות מעל הקו ${series.L1_ZONE.exactLine} וחלק חוצות אותו, אך כולן נשארות בתוך הרצועה`,
        en: `Chart where price returns repeatedly to the ${series.L1_ZONE.band[0]}–${series.L1_ZONE.band[1]} area: some turns stop above the ${series.L1_ZONE.exactLine} line and some cut through it, yet all of them stay inside the band`
      },
      caption: { he: 'למה זה אזור ולא קו', en: 'Why it is an area, not a line' },
      subcaption: {
        he: `חלק מהפניות עצרו מעל ${series.L1_ZONE.exactLine} וחלק ירדו מתחתיו — אבל כולן בתוך הרצועה. מי שצייר קו רואה כישלונות; מי שצייר רצועה רואה את אותו אזור מחזיק.`,
        en: `Some turns stopped above ${series.L1_ZONE.exactLine} and some dropped below it — but every one is inside the band. Draw the line and you see failures; draw the band and you see the same area holding.`
      },
      tone: 'neutral',
      height: 380
    }
  ],

  l2: [
    {
      candles: series.L2,
      variant: 'price',
      options: {
        showVolume: true,
        zones: [
          { range: series.L2.resistZone, tone: 'resistance', label: { he: 'התנגדות ~140$', en: 'Resistance ~$140' } }
        ],
        points: [
          { idx: series.l2BreakIdx, tone: 'bull', align: 'center', label: { he: 'פריצה + קפיצת נפח', en: 'Breakout + volume spike' } },
          // Below the candles: the retest is only a few sessions after the
          // breakout, so above-candle labels for both would overlap.
          { idx: series.l2RetestIdx, tone: 'support', align: 'center', place: 'below', label: { he: 'ריטסט', en: 'Retest' } }
        ]
      },
      label: {
        he: 'גרף נרות המראה פריצה מעל התנגדות ולאחריה ריטסט של אותה רמה',
        en: 'Candlestick chart showing a breakout above resistance followed by a retest of that level'
      },
      caption: { he: 'פריצה, ואז בדיקה חוזרת', en: 'Breakout, then retest' },
      subcaption: { he: 'שימו לב לקפיצת הנפח בנר הפריצה, ואז לחזרה לאותו אזור.', en: 'Note the volume spike on the breakout candle, then the return to that same area.' },
      tone: 'bull',
      height: 460
    },
    {
      candles: series.L2_REAL,
      variant: 'price',
      options: {
        showVolume: false,
        zones: [{ range: series.L2_REAL.resistZone, tone: 'resistance', label: { he: 'רמת ההתנגדות הישנה', en: 'The old resistance level' } }]
      },
      label: {
        he: 'גרף המראה ריטסט אמיתי — המחיר נעצר בקרבת הרמה הישנה וממשיך למעלה',
        en: 'Chart showing a genuine retest — price stalls near the old level and continues up'
      },
      caption: { he: 'ריטסט אמיתי', en: 'Genuine retest' },
      subcaption: { he: 'המחיר נעצר בקרבת הרמה הישנה ולא נשאר מתחתיה — ואז ממשיך.', en: 'Price stalls near the old level without staying below it — then continues.' },
      tone: 'bull',
      height: 380
    },
    {
      candles: series.L2_FALSE,
      variant: 'price',
      options: {
        showVolume: false,
        zones: [{ range: series.L2_FALSE.resistZone, tone: 'resistance', label: { he: 'רמת ההתנגדות הישנה', en: 'The old resistance level' } }]
      },
      label: {
        he: 'גרף המראה פריצה כושלת — המחיר נשאר מתחת לרמה הישנה וממשיך למטה',
        en: 'Chart showing a failed breakout — price stays under the old level and continues down'
      },
      caption: { he: 'פריצה כושלת', en: 'Failed breakout' },
      subcaption: { he: 'אותה התחלה — אבל המחיר נשאר מתחת לרמה, וזו האזהרה.', en: 'The same start — but price stays under the level, and that is the warning.' },
      tone: 'bear',
      height: 380
    }
  ],

  // 20-period EMA + 150-period SMA — matching the exact pair the lesson's
  // "deeper" text discusses (Minervini's Trend Template), not an arbitrary
  // 20/50. The previous version passed an `ma: [20, 50]` option that
  // drawChart.js never reads, so no average line was ever drawn at all.
  l3: [
    {
      candles: series.L3,
      variant: 'price',
      options: {
        showVolume: false,
        extraLines: [
          { tone: 'ema20', values: ma20 },
          { tone: 'sma150', values: ma150 }
        ]
      },
      label: {
        he: 'גרף עם ממוצע נע (EMA) של 20 יום וממוצע (SMA) של 150 יום המחליקים את תנועת המחיר',
        en: 'Chart with a 20-day EMA and a 150-day SMA smoothing the price action'
      },
      caption: { he: 'ממוצע 20 (כתום) מול ממוצע 150 (טורקיז)', en: '20 average (orange) vs 150 average (teal)' },
      subcaption: { he: 'הכתום נצמד למחיר; הטורקיז מתאר את המגמה הרחבה — ומתחיל מאוחר יותר.', en: 'The orange hugs price; the teal describes the broad trend — and starts later.' },
      tone: 'neutral',
      height: 460
    },
    {
      // The other half of the lesson: an average is an average of the PAST, so
      // it can only turn after price already has. In a trend that lag is
      // harmless, which is why every textbook example is a trend. In a range it
      // is the whole story — and a learner who only ever sees the trend case
      // walks away thinking the line is a signal rather than a description.
      candles: series.L3_CHOP,
      variant: 'price',
      options: {
        showVolume: false,
        extraLines: [{ tone: 'ema20', values: l3ChopMa }]
      },
      label: {
        he: 'גרף של שוק דשדוש שבו המחיר חוצה את הממוצע הנע שוב ושוב, בלי שאף חצייה מובילה למגמה',
        en: 'Chart of a sideways market where price crosses the moving average repeatedly, with no crossing leading to a trend'
      },
      caption: { he: 'כשאין מגמה, הממוצע מצטלב בלי סוף', en: 'With no trend, the average crosses endlessly' },
      subcaption: {
        he: 'ספרו כמה פעמים המחיר חצה את הקו. כל חצייה נראית בדיוק כמו זו שעובדת במגמה — ההבדל הוא לא בחצייה, אלא בשאלה אם יש מגמה מלכתחילה.',
        en: 'Count the crossings. Each one looks exactly like the one that works in a trend — the difference is not the crossing, it is whether there is a trend at all.'
      },
      tone: 'bear',
      height: 380
    }
  ],

  // Candlesticks: one pattern per chart, each with its dotted focus box —
  // exactly what the lesson's intro promises ("the dotted box marks the
  // candle to focus on in each chart below").
  l4: [
    {
      candles: series.C_HAMMER,
      variant: 'price',
      options: { showVolume: false, highlights: [{ i1: series.C_HAMMER.highlightIdx, tone: 'gold', label: { he: 'פטיש (Hammer)', en: 'Hammer' } }] },
      label: { he: 'גרף נרות המראה תבנית פטיש — נר עם צל תחתון ארוך וגוף קטן בראשו', en: 'Candlestick chart showing a hammer pattern — a long lower shadow with a small body at the top' },
      caption: { he: 'פטיש (Hammer)', en: 'Hammer' },
      subcaption: { he: 'צל תחתון ארוך, גוף קטן בראשו — בסוף ירידה.', en: 'Long lower shadow, small body at the top — at the end of a decline.' },
      tone: 'bull',
      height: 330
    },
    {
      candles: series.C_STAR,
      variant: 'price',
      options: { showVolume: false, highlights: [{ i1: series.C_STAR.highlightIdx, tone: 'gold', label: { he: 'כוכב נופל (Shooting Star)', en: 'Shooting star' } }] },
      label: { he: 'גרף נרות המראה תבנית כוכב נופל — נר עם צל עליון ארוך בסוף מגמת עלייה', en: 'Candlestick chart showing a shooting star — a long upper shadow at the end of an uptrend' },
      caption: { he: 'כוכב נופל (Shooting Star)', en: 'Shooting star' },
      subcaption: { he: 'התמונה ההפוכה: צל עליון ארוך בסוף עלייה.', en: 'The mirror image: a long upper shadow at the end of a rise.' },
      tone: 'bear',
      height: 330
    },
    {
      candles: series.C_DOJI,
      variant: 'price',
      options: { showVolume: false, highlights: [{ i1: series.C_DOJI.highlightIdx, tone: 'gold', label: { he: 'דוג׳י (Doji)', en: 'Doji' } }] },
      label: { he: 'גרף נרות המראה נר דוג׳י — גוף כמעט אפסי בשיא מגמת עלייה', en: 'Candlestick chart showing a doji — a near-zero body at the top of an uptrend' },
      caption: { he: 'דוג׳י (Doji)', en: 'Doji' },
      subcaption: { he: 'גוף כמעט אפסי — פתיחה וסגירה כמעט זהות. חוסר החלטה.', en: 'A near-zero body — open and close almost identical. Indecision.' },
      tone: 'neutral',
      height: 330
    },
    {
      candles: series.C_BULLE,
      variant: 'price',
      options: {
        showVolume: false,
        highlights: [{ i1: series.C_BULLE.highlightIdx, i2: series.C_BULLE.highlightIdx2, tone: 'gold', label: { he: 'בליעה עולה (Bullish Engulfing)', en: 'Bullish engulfing' } }]
      },
      label: { he: 'גרף נרות המראה בליעה עולה — נר ירוק גדול הבולע נר אדום קטן שלפניו', en: 'Candlestick chart showing a bullish engulfing pattern — a large green candle swallowing the small red one before it' },
      caption: { he: 'בליעה עולה (Bullish Engulfing)', en: 'Bullish engulfing' },
      subcaption: { he: 'שני נרות: הירוק מכסה את כל טווח האדום שלפניו.', en: 'Two candles: the green one covers the whole range of the red before it.' },
      tone: 'bull',
      height: 330
    },
    {
      candles: series.C_BEARE,
      variant: 'price',
      options: {
        showVolume: false,
        highlights: [{ i1: series.C_BEARE.highlightIdx, i2: series.C_BEARE.highlightIdx2, tone: 'gold', label: { he: 'בליעה יורדת (Bearish Engulfing)', en: 'Bearish engulfing' } }]
      },
      label: { he: 'גרף נרות המראה בליעה יורדת — נר אדום גדול הבולע נר ירוק קטן שלפניו', en: 'Candlestick chart showing a bearish engulfing pattern — a large red candle swallowing the small green one before it' },
      caption: { he: 'בליעה יורדת (Bearish Engulfing)', en: 'Bearish engulfing' },
      subcaption: { he: 'אותו רעיון, כיוון הפוך: האדום בולע את הירוק.', en: 'Same idea, opposite direction: the red one engulfs the green.' },
      tone: 'bear',
      height: 330
    }
  ],

  l5: [
    {
      candles: series.L5,
      variant: 'price',
      options: {
        showVolume: false,
        dots: [
          { idx: series.L5.lowIdx, price: series.L5.swingLow, tone: 'bull', labelAlign: 'left', label: { he: 'שפל התנועה', en: 'Swing low' } },
          { idx: series.L5.highIdx, price: series.L5.swingHigh, tone: 'bear', labelAlign: 'right', label: { he: 'שיא התנועה', en: 'Swing high' } }
        ],
        segments: series.L5.fibLevels.map((f: { ratio: number; price: number }) => ({
          x1: 0,
          y1: f.price,
          x2: series.L5.length - 1,
          y2: f.price,
          tone: 'gold',
          dash: [5, 4],
          labelAt: 'end',
          labelAlign: 'right',
          label: { he: `${(f.ratio * 100).toFixed(1)}% — ${f.price.toFixed(0)}$`, en: `${(f.ratio * 100).toFixed(1)}% — $${f.price.toFixed(0)}` }
        }))
      },
      label: {
        he: 'גרף המראה תנועה ואת רמות הנסיגה (פיבונאצ׳י) שהמחיר תיקן אליהן',
        en: 'Chart showing a move and the Fibonacci retracement levels price pulled back to'
      },
      caption: { he: 'התנועה, והתיקון שאחריה', en: 'The move, and the pullback after it' },
      subcaption: { he: 'הרמות נמדדות מהשפל לשיא. שימו לב איפה התיקון נעצר.', en: 'The levels are measured from the low to the high. Notice where the pullback stalled.' },
      tone: 'advanced',
      height: 470
    },
    {
      // Drawn exactly like the chart above — same construction, same levels —
      // and price goes straight through every one of them and closes below the
      // low it started from. Included deliberately: every Fibonacci
      // illustration in circulation is one where the level held, and a tool
      // only ever shown working is taught as a floor rather than as a place
      // people happen to be watching.
      candles: series.L5_FAIL,
      variant: 'price',
      options: {
        showVolume: false,
        dots: [
          { idx: series.L5_FAIL.lowIdx, price: series.L5_FAIL.swingLow, tone: 'bull', labelAlign: 'left', label: { he: 'שפל התנועה', en: 'Swing low' } },
          { idx: series.L5_FAIL.highIdx, price: series.L5_FAIL.swingHigh, tone: 'bear', labelAlign: 'right', label: { he: 'שיא התנועה', en: 'Swing high' } }
        ],
        segments: series.L5_FAIL.fibLevels.map((f: { ratio: number; price: number }) => ({
          x1: 0,
          y1: f.price,
          x2: series.L5_FAIL.length - 1,
          y2: f.price,
          tone: 'gold',
          dash: [5, 4],
          labelAt: 'end',
          labelAlign: 'right',
          label: { he: `${(f.ratio * 100).toFixed(1)}%`, en: `${(f.ratio * 100).toFixed(1)}%` }
        }))
      },
      label: {
        he: 'גרף שבו התיקון חוצה את כל רמות הפיבונאצ׳י וממשיך אל מתחת לשפל שממנו נמדדו',
        en: 'Chart where the pullback cuts through every Fibonacci level and continues below the low they were measured from'
      },
      caption: { he: 'ואיך זה נראה כשזה לא עובד', en: 'And what it looks like when it does not work' },
      subcaption: {
        he: 'אותה שיטת מדידה בדיוק — והמחיר עבר את כל הרמות וירד מתחת לשפל ההתחלתי. הרמות מסמנות איפה אנשים מסתכלים, לא איפה המחיר חייב לעצור.',
        en: 'The exact same measurement — and price went through every level and below the starting low. The levels mark where people are watching, not where price has to stop.'
      },
      tone: 'bear',
      height: 470
    }
  ],

  l6: [
    {
      candles: series.RSI_OB,
      variant: 'price-rsi',
      options: {},
      label: { he: 'גרף מחיר עם פאנל RSI מתחתיו, המראה מצב של קניית יתר', en: 'Price chart with an RSI panel beneath it, showing an overbought condition' },
      caption: { he: 'קניית יתר — RSI מעל 70', en: 'Overbought — RSI above 70' },
      subcaption: { he: 'שימו לב: ה-RSI נשאר מעל 70 לאורך זמן והמחיר ממשיך לעלות.', en: 'Notice: RSI stays above 70 for a long stretch while price keeps rising.' },
      tone: 'bear',
      height: 460
    },
    {
      candles: series.RSI_OS,
      variant: 'price-rsi',
      options: {},
      label: { he: 'גרף מחיר עם פאנל RSI מתחתיו, המראה מצב של מכירת יתר ואז ריבאונד', en: 'Price chart with an RSI panel beneath it, showing an oversold condition followed by a bounce' },
      caption: { he: 'מכירת יתר — RSI מתחת ל-30', en: 'Oversold — RSI below 30' },
      subcaption: { he: 'ירידה מתמשכת אל תוך האזור הירוק, ואז ריבאונד.', en: 'A sustained decline into the green band, then a bounce.' },
      tone: 'bull',
      height: 460
    },
    {
      candles: series.RSI_DIV,
      variant: 'price-rsi',
      options: {
        divergence: { peak1Idx: series.RSI_DIV.peak1Idx, peak2Idx: series.RSI_DIV.peak2Idx },
        divergenceLabels: { he: ['שיא מחיר גבוה יותר', 'שיא RSI נמוך יותר'], en: ['Higher price high', 'Lower RSI high'] }
      },
      label: { he: 'גרף מחיר עם פאנל RSI מתחתיו, המראה דיוורגנס שלילי', en: 'Price chart with an RSI panel beneath it, showing bearish divergence' },
      caption: { he: 'דיוורגנס שלילי (Bearish Divergence)', en: 'Bearish divergence' },
      subcaption: { he: 'המחיר קובע שיא גבוה יותר — אבל ה-RSI קובע שיא נמוך יותר.', en: 'Price makes a higher high — but RSI makes a lower high.' },
      tone: 'advanced',
      height: 460
    }
  ],

  // Chart patterns: each shape gets its own chart, with the dashed structure
  // lines / extreme markers the lesson's intro promises.
  l7: [
    {
      candles: series.P_DBL_BOTTOM,
      variant: 'price',
      options: {
        showVolume: true,
        dots: [
          { idx: series.P_DBL_BOTTOM.b1Idx, price: series.P_DBL_BOTTOM[series.P_DBL_BOTTOM.b1Idx]!.l, tone: 'bull', labelAlign: 'center', label: { he: 'שפל 1', en: 'Bottom 1' } },
          { idx: series.P_DBL_BOTTOM.b2Idx, price: series.P_DBL_BOTTOM[series.P_DBL_BOTTOM.b2Idx]!.l, tone: 'bull', labelAlign: 'center', label: { he: 'שפל 2', en: 'Bottom 2' } }
        ],
        segments: [{ x1: 0, y1: series.P_DBL_BOTTOM[series.P_DBL_BOTTOM.neckIdx]!.h, x2: series.P_DBL_BOTTOM.length - 1, y2: series.P_DBL_BOTTOM[series.P_DBL_BOTTOM.neckIdx]!.h, tone: 'gold', dash: [5, 4], labelAt: 'end', labelAlign: 'right', label: { he: 'קו הצוואר', en: 'Neckline' } }]
      },
      label: { he: 'גרף המראה תבנית תחתית כפולה — שני שפלים בגובה דומה לפני עלייה', en: 'Chart showing a double-bottom pattern — two lows at a similar level before a move up' },
      caption: { he: 'תחתית כפולה (Double Bottom)', en: 'Double bottom' },
      subcaption: { he: 'שני שפלים בגובה דומה, וקו הצוואר שמעליהם.', en: 'Two lows at a similar level, with the neckline above them.' },
      tone: 'bull',
      height: 400
    },
    {
      candles: series.P_DBL_TOP,
      variant: 'price',
      options: {
        showVolume: true,
        dots: [
          { idx: series.P_DBL_TOP.t1Idx, price: series.P_DBL_TOP[series.P_DBL_TOP.t1Idx]!.h, tone: 'bear', labelAlign: 'center', label: { he: 'שיא 1', en: 'Top 1' } },
          { idx: series.P_DBL_TOP.t2Idx, price: series.P_DBL_TOP[series.P_DBL_TOP.t2Idx]!.h, tone: 'bear', labelAlign: 'center', label: { he: 'שיא 2', en: 'Top 2' } }
        ],
        segments: [{ x1: 0, y1: series.P_DBL_TOP[series.P_DBL_TOP.neckIdx]!.l, x2: series.P_DBL_TOP.length - 1, y2: series.P_DBL_TOP[series.P_DBL_TOP.neckIdx]!.l, tone: 'gold', dash: [5, 4], labelAt: 'end', labelAlign: 'right', label: { he: 'קו הצוואר', en: 'Neckline' } }]
      },
      label: { he: 'גרף המראה תבנית תקרה כפולה — שני שיאים בגובה דומה לפני ירידה', en: 'Chart showing a double-top pattern — two highs at a similar level before a move down' },
      caption: { he: 'תקרה כפולה (Double Top)', en: 'Double top' },
      subcaption: { he: 'אותו מבנה הפוך: שני שיאים דומים וקו צוואר מתחתם.', en: 'The same structure inverted: two similar highs and a neckline below them.' },
      tone: 'bear',
      height: 400
    },
    {
      candles: series.P_HS,
      variant: 'price',
      options: {
        showVolume: true,
        dots: [
          { idx: series.P_HS.shoulder1Idx, price: series.P_HS[series.P_HS.shoulder1Idx]!.h, tone: 'text', labelAlign: 'center', label: { he: 'כתף', en: 'Shoulder' } },
          { idx: series.P_HS.headIdx, price: series.P_HS[series.P_HS.headIdx]!.h, tone: 'bear', labelAlign: 'center', label: { he: 'ראש', en: 'Head' } },
          { idx: series.P_HS.shoulder2Idx, price: series.P_HS[series.P_HS.shoulder2Idx]!.h, tone: 'text', labelAlign: 'center', label: { he: 'כתף', en: 'Shoulder' } }
        ],
        segments: [{
          x1: series.P_HS.trough1Idx, y1: series.P_HS[series.P_HS.trough1Idx]!.l,
          x2: series.P_HS.trough2Idx, y2: series.P_HS[series.P_HS.trough2Idx]!.l,
          tone: 'gold', dash: [5, 4], labelAt: 'end', labelAlign: 'right', label: { he: 'קו הצוואר', en: 'Neckline' }
        }]
      },
      label: { he: 'גרף המראה תבנית ראש וכתפיים', en: 'Chart showing a head-and-shoulders pattern' },
      caption: { he: 'ראש וכתפיים (Head & Shoulders)', en: 'Head & shoulders' },
      subcaption: { he: 'שיא מרכזי גבוה בין שתי כתפיים נמוכות יותר.', en: 'A tall central peak between two lower shoulders.' },
      tone: 'bear',
      height: 400
    },
    {
      candles: series.P_FLAG,
      variant: 'price',
      options: {
        showVolume: true,
        segments: [{
          x1: series.P_FLAG.poleStartIdx, y1: series.P_FLAG[series.P_FLAG.poleStartIdx]!.l,
          x2: series.P_FLAG.poleTopIdx, y2: series.P_FLAG[series.P_FLAG.poleTopIdx]!.h,
          tone: 'gold', dash: [5, 4], labelAt: 'end', labelAlign: 'right', label: { he: 'התורן (Pole)', en: 'The pole' }
        }],
        dots: [{ idx: series.P_FLAG.flagEndIdx, price: series.P_FLAG[series.P_FLAG.flagEndIdx]!.l, tone: 'text', labelAlign: 'center', label: { he: 'סוף הדגל', en: 'End of flag' } }]
      },
      label: { he: 'גרף המראה תבנית דגל — עלייה חדה ואז נסיגה מדורגת לפני המשך', en: 'Chart showing a flag pattern — a sharp move then a gentle pullback before continuation' },
      caption: { he: 'דגל (Flag)', en: 'Flag' },
      subcaption: { he: 'עלייה חדה (התורן), נסיגה מדורגת, ואז המשך.', en: 'A sharp move up (the pole), a gentle drift down, then continuation.' },
      tone: 'bull',
      height: 400
    },
    {
      candles: series.P_TRIANGLE,
      variant: 'price',
      options: {
        showVolume: true,
        dots: [
          { idx: series.P_TRIANGLE.touch1Idx, price: series.P_TRIANGLE[series.P_TRIANGLE.touch1Idx]!.h, tone: 'text', labelAlign: 'center', label: { he: 'מגע', en: 'Touch' } },
          { idx: series.P_TRIANGLE.touch2Idx, price: series.P_TRIANGLE[series.P_TRIANGLE.touch2Idx]!.h, tone: 'text', labelAlign: 'center', label: { he: 'מגע', en: 'Touch' } },
          { idx: series.P_TRIANGLE.touch3Idx, price: series.P_TRIANGLE[series.P_TRIANGLE.touch3Idx]!.h, tone: 'text', labelAlign: 'center', label: { he: 'מגע', en: 'Touch' } },
          { idx: series.P_TRIANGLE.breakIdx, price: series.P_TRIANGLE[series.P_TRIANGLE.breakIdx]!.h, tone: 'bull', labelAlign: 'right', label: { he: 'פריצה', en: 'Breakout' } }
        ],
        segments: [{
          x1: series.P_TRIANGLE.low1Idx, y1: series.P_TRIANGLE[series.P_TRIANGLE.low1Idx]!.l,
          x2: series.P_TRIANGLE.low2Idx, y2: series.P_TRIANGLE[series.P_TRIANGLE.low2Idx]!.l,
          tone: 'gold', dash: [5, 4], label: { he: 'קו תמיכה עולה', en: 'Rising support line' }
        }]
      },
      label: { he: 'גרף המראה תבנית משולש — טווח מתכנס ואז פריצה', en: 'Chart showing a triangle pattern — a narrowing range then a breakout' },
      caption: { he: 'משולש (Triangle)', en: 'Triangle' },
      subcaption: { he: 'שיאים באותו גובה ושפלים עולים — טווח שמתכנס לפני פריצה.', en: 'Flat highs and rising lows — a range narrowing before a breakout.' },
      tone: 'neutral',
      height: 400
    }
  ]
};

export function chartsForLesson(lessonId: string): LessonChartSpec[] {
  return LESSON_CHARTS[lessonId] ?? [];
}
