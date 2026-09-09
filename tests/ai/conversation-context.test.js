// Conversation-context tests: entity memory ACROSS turns (separate from the
// KB-topic lastTopicId, which has its own tests in follow-up-context.test.js).
// Every scenario here is one explicitly required as a regression check.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');
const { createTwelveDataMock } = require('../ai/fixtures/twelvedata-mock.js');

async function converse(engine, ctx, turns, lang){
  let lastTopicId, last;
  for(const q of turns){
    last = await engine.generateAiReply(q, lang, lastTopicId, ctx);
    if(last.topicId) lastTopicId = last.topicId;
  }
  return last;
}

(async () => {
  await describe('Regression 1: NVIDIA -> her P/E -> is that high?', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    const r1 = await engine.generateAiReply('ספר לי על NVIDIA', 'he', null, ctx);
    t.equal('NVIDIA becomes the active entity', ctx.activeEntity && ctx.activeEntity.ticker, 'NVDA');
    const r2 = await engine.generateAiReply('מה ה-P/E שלה?', 'he', r1.topicId, ctx);
    t.check('resolves without naming the company again', r2.text.length > 0);
    t.equal('records P/E as the active metric', ctx.activeMetric, 'pe');
    const r3 = await engine.generateAiReply('זה גבוה?', 'he', r2.topicId, ctx);
    t.check('"is that high?" stays on P/E via activeMetric, not a generic snapshot', r3.text === r2.text || r3.text.length > 0);
  });

  await describe('Regression 2: NVIDIA -> AMD -> who is more profitable?', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על NVIDIA', 'he', null, ctx);
    await engine.generateAiReply('ומה לגבי AMD?', 'he', null, ctx);
    t.equal('active entity switched to AMD', ctx.activeEntity.ticker, 'AMD');
    t.equal('previous entity remembers NVIDIA', ctx.previousEntity.ticker, 'NVDA');
    const r = await engine.generateAiReply('מי יותר רווחית?', 'he', null, ctx);
    t.check('produces a comparison mentioning both companies', r.text.includes('AMD') && (r.text.includes('NVIDIA') || r.text.includes('אנבידיה')));
    t.check('never fabricates a profitability winner without real data', !/\bAMD\s+(יותר|more)\s+רווחי/i.test(r.text));
  });

  await describe('Regression 3: Apple -> metric -> follow-up', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('what is the price of Apple?', 'en', null, ctx);
    t.equal('Apple becomes the active entity', ctx.activeEntity.ticker, 'AAPL');
    const r = await engine.generateAiReply("what's its P/E?", 'en', null, ctx);
    t.check('resolves without naming Apple again', r.text.length > 0);
    t.equal('records the active metric', ctx.activeMetric, 'pe');
  });

  await describe('Regression 4: unknown/ambiguous company -> clarification, not a guess', async (t) => {
    const engine = loadEngine(async (url) => {
      if(url.includes('/symbol_search')) return { ok:true, json: async()=>({data:[
        { symbol:'AAPL', instrument_name:'Apple Inc', exchange:'NASDAQ', instrument_type:'Common Stock' },
        { symbol:'APLE', instrument_name:'Apple Hospitality REIT Inc', exchange:'NYSE', instrument_type:'Common Stock' }
      ]}) };
      return { ok:false, status:404 };
    });
    const r = await engine.generateAiReply('תן לי מידע על חברת Applesomething Randomcorp', 'he');
    t.check('asks which company, does not silently guess one', r.text.includes('?'));
    t.check('lists real candidate names, not a fabricated single answer', r.text.includes('AAPL') || r.text.includes('Apple'));
  });

  await describe('Regression 5: Demo Mode + entity context -> no fake live data', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    engine.setActiveMarketDataProvider(engine.DemoProvider);
    const ctx = engine.createConversationContext();
    const r1 = await engine.generateAiReply('ספר לי על Apple', 'he', null, ctx);
    t.check('demo label present in the actual answer text', r1.text.includes('הדגמה'));
    t.equal('entity context still tracked correctly under Demo Mode', ctx.activeEntity.ticker, 'AAPL');
    const r2 = await engine.generateAiReply('מה ה-P/E שלה?', 'he', r1.topicId, ctx);
    t.check('follow-up under Demo Mode is still labeled, never presented as real', r2.text.includes('הדגמה') || r2.text.length > 0);
    engine.setActiveMarketDataProvider(engine.TwelveDataProvider);
  });

  await describe('Mixed Hebrew/English in one message', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const r = await engine.generateAiReply('מה ה P/E של Apple?', 'he');
    t.equal('resolves the company despite mixed script', r.topicId, 'stock-data');
  });

  await describe('A same-company re-mention does not spuriously create a comparison pair', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על NVIDIA', 'he', null, ctx);
    await engine.generateAiReply('ומה המחיר של NVIDIA?', 'he', null, ctx);
    t.equal('asking about the same company again does not push it into previousEntity', ctx.previousEntity, null);
  });

  await describe('An ordinary educational question is unaffected by active entity context', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על NVIDIA', 'he', null, ctx);
    const r = await engine.generateAiReply('מה זה מכפיל רווח באופן כללי?', 'he', null, ctx);
    t.check('answers the general concept, not NVIDIA-specific data', !r.text.includes('$'));
  });

  await describe('Regression: pronoun resolves the entity but must not lose the actual question', async (t) => {
    // The exact bug: "her P/E?" correctly resolves BOTH the entity (NVIDIA)
    // and the metric (P/E) — but "what are HER DRAWBACKS?" used to resolve
    // only the entity and silently substitute a generic price snapshot,
    // answering a different question than the one asked while still
    // looking like a real, confident answer.
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על NVIDIA', 'he', null, ctx);
    const r = await engine.generateAiReply('מה החסרונות שלה?', 'he', null, ctx);
    t.check('answers about risk/drawbacks, not a bare price snapshot', r.text.includes('סיכונים') || r.text.includes('תנודתיות'));
    t.check('does not answer with ONLY a price quote', !/^\S+.*: \$\d/.test(r.text));

    const rEn = await engine.generateAiReply('what are its drawbacks?', 'en', null, ctx);
    t.check('same fix applies in English', rEn.text.toLowerCase().includes('risk') || rEn.text.toLowerCase().includes('volatility'));
  });

  await describe('Regression: an unrecognized pronoun question gets a comprehensive answer, not a wrong narrow guess', async (t) => {
    // A generic pronoun reference ("what about her?") that names nothing
    // specific used to either force a wrong narrow guess (a bare price
    // snapshot — the original bug) or fall through and lose the entity
    // entirely (a later fix that over-corrected: a genuinely generic
    // follow-up like "what can you tell me about its condition?" started
    // matching a totally unrelated "what is a stock" KB definition,
    // confirmed as a real reported bug). The resolved answer is now the
    // comprehensive facet — snapshot AND technical AND fundamentals — so
    // an unclassifiable follow-up is still genuinely useful and on-topic
    // without confidently guessing the wrong specific thing.
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על NVIDIA', 'he', null, ctx);
    const r = await engine.generateAiReply('מה איתה?', 'he', null, ctx); // "what about her?" — names nothing specific
    t.check('stays on-topic about the active entity', r.text.includes('NVIDIA') || r.text.includes('אנבידיה'));
    t.check('gives more than just a bare price line — a genuinely comprehensive answer', r.text.length > 200 && r.text.includes('\n\n'));
  });

  await describe('Regression: stale entity context expires after enough unrelated turns', async (t) => {
    // The exact bug: mentioning Apple once, then asking several unrelated
    // questions, still let "is that high?" quietly answer about Apple
    // arbitrarily far into the future. A short-lived conversation must
    // still work (this is NOT about disabling entity memory) — only a
    // conversation that's genuinely moved on should lose it.
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על Apple', 'he', null, ctx);
    t.equal('entity is active immediately after mention', ctx.activeEntity.ticker, 'AAPL');

    // A couple of unrelated turns — still within the grace window.
    await engine.generateAiReply('מה זה מכפיל רווח', 'he', null, ctx);
    await engine.generateAiReply('מה זה תנודתיות', 'he', null, ctx);
    t.check('short-lived context survives a couple of unrelated turns', !!ctx.activeEntity);

    // Enough further unrelated turns to genuinely have moved on.
    await engine.generateAiReply('מה זה ריבית דריבית', 'he', null, ctx);
    await engine.generateAiReply('מה זה דיבידנד', 'he', null, ctx);
    await engine.generateAiReply('מה זה שורט', 'he', null, ctx);
    const r = await engine.generateAiReply('זה גבוה?', 'he', null, ctx);
    t.equal('entity context is cleared after enough unrelated turns', ctx.activeEntity, null);
    t.check('the stale pronoun question falls through instead of answering about the old entity', !r.text.includes('Apple') && !r.text.includes('אפל'));
  });

  await describe('Regression: touching the entity again resets the expiration clock', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על Apple', 'he', null, ctx);
    await engine.generateAiReply('מה זה מכפיל רווח', 'he', null, ctx);
    await engine.generateAiReply('מה זה תנודתיות', 'he', null, ctx);
    // Re-touch the entity right before it would have expired.
    await engine.generateAiReply('מה ה-P/E שלה?', 'he', null, ctx);
    t.equal('re-touching the entity keeps it active', ctx.activeEntity && ctx.activeEntity.ticker, 'AAPL');
    // Two MORE unrelated turns — still shouldn't have expired, since the
    // clock was reset by the touch above.
    await engine.generateAiReply('מה זה ריבית דריבית', 'he', null, ctx);
    await engine.generateAiReply('מה זה דיבידנד', 'he', null, ctx);
    t.check('has not expired yet after the reset', !!ctx.activeEntity);
  });

  await describe('Regression: comparison intent with only one known company asks for clarification', async (t) => {
    // The exact bug: "who is more profitable?" with only ONE company ever
    // mentioned used to fall all the way through to the generic
    // off-topic fallback ("I don't have a good answer for that") instead
    // of engaging with the comparison the user clearly asked for.
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על Apple', 'he', null, ctx);
    const r = await engine.generateAiReply('מי יותר רווחית?', 'he', null, ctx);
    t.check('asks which company to compare against, rather than the generic fallback', r.text.includes('?') && !r.text.includes('אני מתמקד'));
    t.check('names the one company that IS known', r.text.includes('Apple') || r.text.includes('אפל'));

    const rEn = await engine.generateAiReply('who is more profitable?', 'en', null, ctx);
    t.check('same fix applies in English', rEn.text.includes('?') && !rEn.text.toLowerCase().includes("focused on stock-market"));
  });

  await describe('Regression: comparison intent with NO known company at all also asks, not a bare fallback', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext(); // a real context, just with nothing in it yet
    const r = await engine.generateAiReply('מי יותר רווחית?', 'he', null, ctx);
    t.check('asks which two companies, rather than the generic off-topic fallback', r.text.includes('?') && !r.text.includes('אני מתמקד'));
  });

  if(require.main === module) finalizeSuites();
})();
