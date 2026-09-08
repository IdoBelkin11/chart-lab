// Core regression suite: one broad pass over every KB category, checking
// only that nothing crashes and nothing comes back empty. This is the
// suite that catches "I broke the whole engine" — it existed under this
// exact name and question set throughout development; see git history /
// CLAUDE.md for why specific entries were added.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

const QUESTIONS = require('./fixtures/core-questions.json');

(async () => {
  const engine = loadEngine();

  await describe('core-regression (182 questions, no crash / no empty answer)', async (t) => {
    for(const [q, lang] of QUESTIONS){
      let r;
      try{
        r = await engine.generateAiReply(q, lang);
      }catch(e){
        t.check(`CRASH on "${q}": ${e.message}`, false);
        continue;
      }
      t.check(`empty answer on "${q}"`, !!(r && r.text && r.text.trim()));
    }
  });

  await describe('follow-up continuation ("what about eps?" after "what is p/e")', async (t) => {
    const r1 = await engine.generateAiReply('what is p/e', 'en');
    const r2 = await engine.generateAiReply('what about eps', 'en', r1.topicId);
    t.equal('first topic resolves to pe', r1.topicId, 'pe');
    t.check('second answer is about EPS', r2.text.toLowerCase().includes('earnings per share'));
  });

  if(require.main === module) finalizeSuites();
})();
