// Questions derived from research into what real investors actually ask
// (misconceptions, Israeli tax/vehicles, real-world scenarios, forum-style
// phrasing). Each should resolve to a real answer — none should fall
// through to the generic "I don't have a good answer" message.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

const QUESTIONS = require('./fixtures/research-bank.json');

const FALLBACK_MARKERS = ['אני מתמקד בנושאי שוק ההון', "I'm focused on stock-market topics"];
function isFallback(text){
  return FALLBACK_MARKERS.some(m => text.includes(m)) || text.length < 5;
}

(async () => {
  const engine = loadEngine();

  await describe('research-bank (52 questions resolve to a real answer)', async (t) => {
    for(const [q, lang] of QUESTIONS){
      const r = await engine.generateAiReply(q, lang);
      t.check(`fell to fallback: "${q}"`, !isFallback(r.text));
    }
  });

  if(require.main === module) finalizeSuites();
})();
