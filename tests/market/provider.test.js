// Tests the MarketDataProvider abstraction itself: that switching providers
// actually changes behavior, that DemoProvider is clearly labeled and
// deterministic, and the hard safety rule — a failed fetch must produce an
// honest "couldn't get it" answer, never a guessed number.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');
const { createTwelveDataMock } = require('../ai/fixtures/twelvedata-mock.js');

(async () => {
  const engine = loadEngine(createTwelveDataMock());

  await describe('provider switching', async (t) => {
    t.equal('default provider is the live one', engine.getActiveMarketDataProvider().id, 'twelvedata');
    engine.setActiveMarketDataProvider(engine.DemoProvider);
    t.equal('switches to demo', engine.getActiveMarketDataProvider().id, 'demo');
    engine.setActiveMarketDataProvider(engine.TwelveDataProvider);
    t.equal('switches back to live', engine.getActiveMarketDataProvider().id, 'twelvedata');
  });

  await describe('Demo Mode is always clearly labeled, in the actual answer text', async (t) => {
    engine.setActiveMarketDataProvider(engine.DemoProvider);
    const r = await engine.generateAiReply('מה המחיר של אפל?', 'he');
    t.check('answer explicitly says this is demo data', r.text.includes('הדגמה'));
    t.check('answer never claims real-time', !r.text.includes('בזמן אמת') || r.text.includes('לא בזמן אמת'));
    engine.setActiveMarketDataProvider(engine.TwelveDataProvider);
  });

  await describe('Demo Mode is deterministic (same ticker -> same numbers)', async (t) => {
    engine.setActiveMarketDataProvider(engine.DemoProvider);
    const r1 = await engine.generateAiReply('מה המחיר של אפל?', 'he');
    const r2 = await engine.generateAiReply('מה המחיר של אפל?', 'he');
    t.equal('identical answer both times', r1.text, r2.text);
    engine.setActiveMarketDataProvider(engine.TwelveDataProvider);
  });

  await describe('Demo Mode resolves even a company outside the curated list', async (t) => {
    engine.setActiveMarketDataProvider(engine.DemoProvider);
    const r = await engine.generateAiReply('תן לי מידע על חברה שלא קיימת בכלל', 'he');
    t.check('produces a demo answer rather than the generic fallback', r.text.includes('הדגמה'));
    engine.setActiveMarketDataProvider(engine.TwelveDataProvider);
  });

  await describe('EVERY stock-data facet carries the Demo Mode label, not just some', async (t) => {
    // Regression guard: formatRisks() used to be the one formatter that
    // never called asOfLine() (every other facet does), so a demo-derived
    // volatility number could be shown with no provenance at all — caught
    // by looping every facet instead of spot-checking one, which is
    // exactly what let this slip through originally.
    engine.setActiveMarketDataProvider(engine.DemoProvider);
    const facetQuestions = [
      ['מה המחיר של אפל', 'price'],
      ['מה ה-RSI של אפל', 'rsi'],
      ['מה המצב הטכני של אפל', 'technical'],
      ['מה המגמה של אפל', 'trend'],
      ['מה הסיכונים של אפל', 'risks'],
      ['תנתח לי את אפל', 'full'],
    ];
    for(const [q, facetName] of facetQuestions){
      const r = await engine.generateAiReply(q, 'he');
      t.check(`"${facetName}" facet is labeled as demo data`, r.text.includes('הדגמה'));
    }
    engine.setActiveMarketDataProvider(engine.TwelveDataProvider);
  });

  await describe('Demo Mode never fabricates a company from a natural-language question', async (t) => {
    // Regression guard: "מי יותר רווחית?" (who is more profitable?) once
    // resolved to a fake synthesized company (e.g. "DEMO4N1O") instead of
    // falling through to the real two-entity comparison mechanism — Demo
    // Mode's search stub used to fabricate a plausible-looking match for
    // ANY non-empty text, including ordinary questions that happened to
    // reach it as a mis-extracted "candidate".
    engine.setActiveMarketDataProvider(engine.DemoProvider);
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על Apple', 'he', null, ctx);
    await engine.generateAiReply('ומה לגבי Tesla', 'he', null, ctx);
    const r = await engine.generateAiReply('מי יותר רווחית?', 'he', null, ctx);
    t.check('answers a real two-entity comparison, not a fabricated company', r.text.includes('Tesla') || r.text.includes('טסלה'));
    t.check('still correctly labeled as demo', r.text.includes('הדגמה'));
    t.check('does not contain a synthesized DEMO-prefixed ticker', !/\bDEMO[A-Z0-9]{3,5}\b/.test(r.text));

    const r2 = await engine.generateAiReply("what's her P/E?", 'en', null, ctx);
    t.check('a pronoun-reference question is also never fabricated into a fake company', !/\bDEMO[A-Z0-9]{3,5}\b/.test(r2.text));
    engine.setActiveMarketDataProvider(engine.TwelveDataProvider);
  });

  await describe('a real fetch failure never produces a fabricated number', async (t) => {
    const failingEngine = loadEngine(async () => { throw new Error('simulated network failure'); });
    const r = await failingEngine.generateAiReply('מה המחיר של אפל?', 'he');
    t.check('no dollar amount appears in a failure response', !/\$\d/.test(r.text));
    t.check('failure is stated honestly', r.text.includes('לא הצלחתי') || r.text.includes("couldn't"));
  });

  if(require.main === module) finalizeSuites();
})();
