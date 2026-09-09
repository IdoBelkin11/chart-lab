// "Answer the question, not the topic." A facet request (drawbacks/
// advantages of X) must return ONLY that facet, not the whole entry — and a
// comparison question must promote the dedicated comparison entry over a
// single concept that happens to score just as high.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  const engine = loadEngine();

  await describe('facet precision — single concepts', async (t) => {
    const takeProfit = await engine.generateAiReply('מה זה טייק פרופיט', 'he');
    // A brief one-sentence CONTRAST is the intended design (per the
    // original scoping requirement: "can add: it differs from Stop Loss,
    // whose purpose is to limit a loss — but must not go on to explain
    // Stop Loss itself"). The guard is against the FULL stop-loss
    // definition leaking in, not against the word appearing at all.
    t.check('mentions stop-loss only in passing, not as a full explanation', !takeProfit.text.includes('פקודה שסוגרת את העסקה אוטומטית אם המחיר יורד'));
    t.check('take-profit answer stays reasonably short (not over-answering)', takeProfit.text.length < 300);

    const bear = await engine.generateAiReply('מה זה שוק דובי?', 'he');
    t.check('bear-market answer does not also explain bull market at length', bear.text.length < 400);
    t.equal('resolves to the dedicated bear-market entry', bear.topicId, 'bear-market');
  });

  await describe('facet precision — pros/cons requests', async (t) => {
    const cons = await engine.generateAiReply('מה החסרונות של סרגל פיבונאצי', 'he');
    t.check('drawbacks answer is about drawbacks', cons.text.includes('חיסרון') || cons.text.includes('חסרונות'));
    t.check('drawbacks answer does not re-explain what Fibonacci is from scratch', !cons.text.includes('38.2%'));

    const pros = await engine.generateAiReply('מה היתרונות של ETF', 'he');
    t.check('advantages answer is about advantages', pros.text.includes('יתרון') || pros.text.includes('יתרונות'));
  });

  await describe('comparison intent beats a single concept with an equal score', async (t) => {
    const r = await engine.generateAiReply('מה ההבדל בין שוק דובי לשוק שורי?', 'he');
    t.equal('resolves to the comparison entry, not just one side', r.topicId, 'bull-vs-bear-market');
  });

  await describe('a concept mistaken for another related concept', async (t) => {
    // "risk/reward ratio" must not be answered as if the user asked about
    // "risk" alone just because the word appears in the phrase.
    const r = await engine.generateAiReply('מה זה יחס סיכון סיכוי', 'he');
    t.equal('resolves to risk-reward-ratio, not bare risk', r.topicId, 'risk-reward-ratio');
  });

  if(require.main === module) finalizeSuites();
})();
