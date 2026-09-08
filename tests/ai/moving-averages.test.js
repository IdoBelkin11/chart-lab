// Period-specific moving averages: "ממוצע 150" and "ממוצע 20" are different
// questions and must get different, period-specific answers — not the one
// generic moving-average definition repeated regardless of the number.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

(async () => {
  const engine = loadEngine();

  await describe('each documented period returns period-specific content', async (t) => {
    const cases = [
      ['מה זה ממוצע 9', ['ממוצע נע 9']],
      ['מה זה ממוצע 20', ['ממוצע נע 20', 'תמיכה דינמית']],
      ['מה זה ממוצע 50', ['ממוצע נע 50', 'צלב זהב']],
      ['מה זה ממוצע 100', ['ממוצע נע 100']],
      ['מה זה ממוצע 150', ['ממוצע נע 150', 'מינרביני']],
      ['מה זה ממוצע 200', ['ממוצע נע 200', 'שנת מסחר']],
    ];
    for(const [q, mustInclude] of cases){
      const r = await engine.generateAiReply(q, 'he');
      for(const phrase of mustInclude) t.check(`"${q}" mentions "${phrase}"`, r.text.includes(phrase));
    }
  });

  await describe('unlisted periods still get a sensible banded answer', async (t) => {
    const cases = [
      ['מה זה ממוצע 5', 'קצר'],
      ['מה זה ממוצע 75', 'בינוני'],
      ['מה זה ממוצע 250', 'ארוך'],
    ];
    for(const [q, mustInclude] of cases){
      const r = await engine.generateAiReply(q, 'he');
      t.check(`"${q}" -> ${mustInclude}`, r.text.includes(mustInclude));
    }
  });

  await describe('typos in the word "ממוצע" itself are tolerated', async (t) => {
    const cases = [
      ['מה זה ממומע 20', 'ממוצע נע 20'],
      ['ממומע 150', 'ממוצע נע 150'],
      ['מה זה ממוצא 50', 'ממוצע נע 50'],
    ];
    for(const [q, mustInclude] of cases){
      const r = await engine.generateAiReply(q, 'he');
      t.check(`"${q}"`, r.text.includes(mustInclude));
    }
  });

  await describe('generic moving-average question (no number) still works', async (t) => {
    const r = await engine.generateAiReply('מה זה ממוצע נע', 'he');
    t.check('mentions moving average generically', r.text.includes('ממוצע נע'));
  });

  if(require.main === module) finalizeSuites();
})();
