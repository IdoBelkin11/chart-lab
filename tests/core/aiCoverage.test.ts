// ---------------------------------------------------------------------------
// Question coverage: does a plainly-phrased beginner question reach the RIGHT
// topic?
//
// This started as a throwaway QA sweep that counted how many questions got
// *any* answer. That number was 95% and it was misleading: four of the
// questions it scored as answered were being answered by the wrong entry —
// "how do I buy a stock?" returned the definition of a stock, "what's the risk
// of investing in stocks?" returned it too. A coverage number that counts a
// wrong answer as a hit measures nothing, so the table below pins the expected
// topic id for each question instead.
//
// Why these questions specifically: the KB was authored concept-first, so it
// was strong on "what is RSI" and weak on the questions a beginner asks
// *before* they know the concept has a name — "how do I read a chart", "how do
// I know when to sell", "why am I losing money". Those are the entry points to
// the whole subject. Each row here is a phrasing that once failed.
//
// Adding a row is cheap and is the right response to any question a visitor
// asks that lands somewhere odd.
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { generateAiReply, createConversationContext } from '@core/ai/index';

const ask = (q: string) =>
  generateAiReply(q, /[֐-׿]/.test(q) ? 'he' : 'en', null, createConversationContext());

/** [question, the entry that should answer it] */
const EXPECTED: Array<[string, string]> = [
  // --- named concepts, the KB's original strength: these guard against a
  //     newly-added broad keyword stealing a question that already worked ---
  ['מה זה תמיכה?', 'support-resistance'],
  ['מה זה פריצה?', 'breakout-retest'],
  ['מה זה ממוצע נע?', 'moving-averages'],
  ['מה זה נר יפני?', 'candlestick'],
  ['מה זה RSI?', 'rsi'],
  ['מה זה תבנית גרף?', 'chart-patterns'],
  ['מה זה נפח מסחר?', 'volume'],
  ['מה זה מגמה?', 'trend'],
  ['מה זה מניה?', 'stock'],
  ['מה זה בורסה?', 'exchange'],
  ['מה זה מדד?', 'index'],
  ['מה זה ETF?', 'etf'],
  ['מה זה דיבידנד?', 'dividend'],
  ['מה זה שווי שוק?', 'market-cap'],
  ['מה זה P/E?', 'pe'],
  ['מה זה נזילות?', 'liquidity'],
  ['מה זה סטופ לוס?', 'stop-loss'],
  ['מה זה פיזור סיכונים?', 'diversification'],
  ['what is support?', 'support-resistance'],
  ['what does P/E mean?', 'pe'],
  ['what is a stop loss?', 'stop-loss'],
  ['what is market cap?', 'market-cap'],
  ['what is a breakout?', 'breakout-retest'],

  // --- the beginner entry points: no answer at all before this test existed ---
  ['איך קוראים גרף?', 'how-to-read-a-chart'],
  ['אני לא מבין את הגרף', 'how-to-read-a-chart'],
  ['how do I read a chart?', 'how-to-read-a-chart'],
  ['איך יודעים מתי למכור?', 'when-to-sell'],
  ['when should I sell?', 'when-to-sell'],
  ['למה אני מפסיד כסף?', 'why-am-i-losing-money'],
  ['why am I losing money?', 'why-am-i-losing-money'],
  ['מה זה סימול?', 'ticker-symbol'],

  // --- content existed, only the plain phrasing was missing ---
  ['מה זה ספרד?', 'bid-ask-spread'],
  ['לא הבנתי מה זה רסי', 'rsi'],
  ['כמה כסף צריך כדי להתחיל?', 'minimum-to-start-investing'],
  ['האם כדאי להשקיע עכשיו?', 'market-timing'],

  // --- answered, but by the wrong entry: the umbrella `stock` entry matches
  //     the bare word "מניה" and used to outscore the specific topic ---
  ['איך קונים מניה?', 'broker'],
  ['איך בוחרים מניה?', 'how-to-analyze'],
  ['מה הסיכון בהשקעה במניות?', 'risk'],
  ['מה ההבדל בין מניה לאגח?', 'stocks-vs-bonds-safety'],
  ['מה עדיף מניה או ETF?', 'index-investing-vs-stockpicking'],

  // --- phrasings that already resolved correctly, pinned so they stay that way ---
  ['איך מתחילים להשקיע?', 'getting-started-investing'],
  ['איך מנהלים סיכון?', 'risk'],
  ['תסביר לי על ממוצעים נעים', 'moving-averages'],
  ['רגע מה זה בדיוק פריצה', 'breakout-retest'],
  ['מה ההבדל בין SMA ל-EMA?', 'sma-vs-ema'],
  ['מה ההבדל בין S&P 500 לנאסדק?', 'sp500-vs-nasdaq100']
];

describe('question coverage', () => {
  it.each(EXPECTED)('%s -> %s', async (question, topicId) => {
    expect((await ask(question)).topicId).toBe(topicId);
  });
});

// ---------------------------------------------------------------------------
// The fabrication guard.
//
// This is the most serious bug the engine has had, so it gets a test of its
// own rather than a row above. DemoProvider's searchSymbol used to synthesize
// a match for ANY text, on the theory that labelling it "(Demo)" kept it
// honest. It did not: because it answered for any text, every unrecognised
// question reaching the entity path minted a company out of it. "מה מזג האוויר
// היום?" came back as ticker DEMO1854 at $62.03; "what does P/E mean?" came
// back as a company named "E mean" with a P/E of 33.0 — a real-looking price,
// a real-looking date, and a topicId of 'stock-data', so the engine stopped
// falling back honestly and started confidently answering with invented
// securities.
//
// A provider with no company database must answer "not found", which is what
// a real provider does for a name that is not a company.
// ---------------------------------------------------------------------------
describe('never invents a company', () => {
  const OFF_TOPIC = [
    'מה מזג האוויר היום?',
    'תכתוב לי שיר',
    'מי ראש הממשלה?',
    'what is the weather today?',
    'write me a poem'
  ];

  it.each(OFF_TOPIC)('falls back honestly on %s', async (question) => {
    const r = await ask(question);
    expect(r.topicId).toBeUndefined();
    // The tell-tale shapes of the old bug: a synthesized ticker, or a price.
    expect(r.text).not.toMatch(/DEMO[0-9A-Z]{3,}/);
    expect(r.text).not.toMatch(/\$\d/);
  });

  it('still answers about the companies it genuinely knows', async () => {
    // The curated ticker list resolves before any provider search, so closing
    // the fabrication hole must not have cost real coverage.
    const r = await ask('מה מחיר המניה של אפל?');
    expect(r.topicId).toBeDefined();
  });
});
