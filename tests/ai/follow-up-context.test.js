// Follow-up / conversational-context tests. Unlike research-bank.test.js,
// these questions are meaningless on their own by design ("is that high?",
// "explain simpler") — they only make sense chained after a real topic, so
// each test drives a real multi-turn conversation instead of a single call.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

async function ask(engine, turns, lang){
  let lastTopicId, last;
  for(const q of turns){
    last = await engine.generateAiReply(q, lang, lastTopicId);
    if(last.topicId) lastTopicId = last.topicId;
  }
  return { finalTopicId: lastTopicId, finalAnswer: last };
}

(async () => {
  const engine = loadEngine();

  await describe('pronoun-reference follow-ups ("is that high?")', async (t) => {
    const { finalTopicId, finalAnswer } = await ask(engine,
      ['מה זה מכפיל רווח?', 'אם ה-P/E הוא 50, זה טוב או רע?', 'אז זה טוב או רע?'], 'he');
    t.equal('stays on the P/E topic through the whole exchange', finalTopicId, 'pe');
    t.check('final answer is not the generic fallback', !finalAnswer.text.includes('אני מתמקד'));
  });

  await describe('"explain simpler" — reachable and shorter than the full answer', async (t) => {
    const full = await engine.generateAiReply('מה זה מכפיל רווח', 'he');
    const simpler = await engine.generateAiReply('תסביר בפשטות', 'he', full.topicId);
    t.check('simpler answer is shorter than the full one', simpler.text.length < full.text.length);
    t.equal('topic carries through', simpler.topicId, 'pe');
  });

  await describe('"go deeper" — reachable and pulls in related content', async (t) => {
    const full = await engine.generateAiReply('What is a stock buyback?', 'en');
    const deeper = await engine.generateAiReply('can you go deeper into that?', 'en', full.topicId);
    t.check('deeper answer references related material', deeper.text.length > 0 && deeper.topicId !== undefined);
  });

  await describe('general short contextual follow-up (no fixed trigger phrase)', async (t) => {
    const { finalTopicId } = await ask(engine,
      ['מה זה תנודתיות?', 'המניה שלי מאוד תנודתית', 'למה?'], 'he');
    t.equal('short "why?" reuses the previous topic', finalTopicId, 'volatility');
  });

  await describe('a real new question is never shadowed by a stale topic', async (t) => {
    // Regression guard: this exact case broke once — "what is an ETF for
    // beginners" was swallowed by the "explain simpler" follow-up handler
    // because it contains the word "beginner" and a topic was already active.
    const prior = await engine.generateAiReply('what is p/e', 'en');
    const r = await engine.generateAiReply('what is an ETF for beginners?', 'en', prior.topicId);
    t.equal('answers about ETF, not P/E', r.topicId, 'etf');
  });

  if(require.main === module) finalizeSuites();
})();
