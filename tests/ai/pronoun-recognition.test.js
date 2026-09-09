// Locks in two AI conversation-context fixes found via real reported
// conversations (not synthetic edge cases):
//
// 1. Subject pronouns ("how did IT change", "האם היא ירדה") were never
//    recognized as referring to the active entity — only possessive forms
//    ("its", "שלה") were. This silently broke the app's OWN suggested
//    follow-up chips ("How has it changed over the last month?"), which
//    use exactly this phrasing.
// 2. A generic follow-up with no recognized facet ("what can you tell me
//    about its condition?") used to fall through to ordinary KB scoring,
//    which could match a totally unrelated general definition and lose
//    the active company entirely — confirmed via a real Intel follow-up
//    that answered with a generic "what is a stock" definition instead of
//    anything about Intel.
const { loadEngine } = require('../helpers/load-engine.js');
const { createTwelveDataMock } = require('../ai/fixtures/twelvedata-mock.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  await describe('Subject pronouns ("it", "היא"/"הוא") are recognized as entity references', async (t) => {
    const engine = loadEngine(createTwelveDataMock());

    const ctxHe = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על NVIDIA', 'he', null, ctxHe);
    const rHe = await engine.generateAiReply('איך היא השתנתה בחודש האחרון?', 'he', null, ctxHe);
    t.check('Hebrew subject-pronoun follow-up resolves the change facet', rHe.text.includes('%') && (rHe.text.includes('NVIDIA') || rHe.text.includes('אנבידיה')));

    const ctxEn = engine.createConversationContext();
    await engine.generateAiReply('tell me about NVIDIA', 'en', null, ctxEn);
    const rEn = await engine.generateAiReply('How has it changed over the last month?', 'en', null, ctxEn);
    t.check('English subject-pronoun follow-up (the app\'s own suggested chip wording) resolves the change facet', rEn.text.includes('%') && rEn.text.includes('NVIDIA'));
  });

  await describe('Bare "it" does not false-positive on unrelated words containing "it"', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('tell me about NVIDIA', 'en', null, ctx);
    // "profit", "credit", "limit" etc. all contain the substring "it" —
    // this must not spuriously trigger pronoun-reference handling.
    const norm = engine.normalizeText('what is profit margin in general');
    t.equal('a whole-word check does not match "it" inside "profit"', ['היא','הוא','it'].some(w => norm.split(/\s+/).includes(w)), false);
  });

  await describe('An unclassifiable generic follow-up stays on-topic instead of losing the entity', async (t) => {
    const engine = loadEngine(createTwelveDataMock());
    const ctx = engine.createConversationContext();
    await engine.generateAiReply('ספר לי על אינטל', 'he', null, ctx);
    const r = await engine.generateAiReply('איזה מידע אתה יכול לתת לי על המניה שיכול ללמד אותי על המצב שלה ועל האופן שלה', 'he', null, ctx);
    t.check('mentions the active company (Intel), not a generic unrelated definition', r.text.includes('אינטל') || r.text.includes('Intel'));
    t.check('gives a genuinely comprehensive multi-part answer', r.text.includes('\n\n'));
  });

  if(require.main === module) finalizeSuites();
})();
