// Typo tolerance: both that common misspellings resolve correctly, and that
// the fuzzy matcher doesn't introduce false positives on CORRECT spellings.
// The false-positive half matters just as much as the typo half — Hebrew
// fuzzy matching once caused "diversification" to answer with RSI content
// because "rsi" is hidden inside the word.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');

const TYPOS = [
  ['מה זה טייק פרופית', 'take-profit'],
  ['מה זה טיק פרופיט', 'take-profit'],
  ['מה זה סטופ לוסס', 'stop-loss'],
  ['מה זה פיסונאצי', 'fibonacci'],
  ['מה זה פיבונצי', 'fibonacci'],
  ['מה זה דיבידנט', 'dividend'],
  ['מה זה תנודתיזת', 'volatility'],
  ['מה זה מכפיל רוח', 'pe'],
  ['מה זה נזילזת', 'liquidity'],
  ['מה זה מגמת עליה', 'trend'],
];

const CORRECT_SPELLINGS = [
  ['מה זה דיבידנד', 'dividend'],
  ['מה זה פיבונאצי', 'fibonacci'],
  ['מה זה תנודתיות', 'volatility'],
  ['מה זה נזילות', 'liquidity'],
  ['מה זה סיכון', 'risk'],
  ['מה זה מניה', 'stock'],
  ['מה זה שוק דובי', 'bear-market'],
  ['מה זה שוק שורי', 'bull-market'],
];

(async () => {
  const engine = loadEngine();

  await describe('typo tolerance', async (t) => {
    for(const [q, expected] of TYPOS){
      const r = await engine.generateAiReply(q, 'he');
      t.equal(`"${q}"`, r.topicId, expected);
    }
  });

  await describe('correct spellings unaffected by fuzzy matching (no false positives)', async (t) => {
    for(const [q, expected] of CORRECT_SPELLINGS){
      const r = await engine.generateAiReply(q, 'he');
      t.equal(`"${q}"`, r.topicId, expected);
    }
  });

  await describe('regression guard: "diversification" must never match RSI', async (t) => {
    // "diversification" literally contains the substring "rsi" — a prior
    // fuzzy-matching bonus wasn't boundary-safe and matched on it.
    const r = await engine.generateAiReply('What is diversification?', 'en');
    t.equal('resolves to diversification, not rsi', r.topicId, 'diversification');
  });

  if(require.main === module) finalizeSuites();
})();
