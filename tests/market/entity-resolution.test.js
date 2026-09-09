// Company/ticker resolution — the hardest part of this system. Twelve
// Data's database is English-only, so a literal Hebrew string never
// matches; these tests exercise the full pipeline: candidate extraction ->
// transliteration -> search -> rank -> safety filtering.
const { loadEngine } = require('../helpers/load-engine.js');
const { describe, finalizeSuites } = require('../helpers/test-runner.js');
const { createTwelveDataMock } = require('../ai/fixtures/twelvedata-mock.js');

(async () => {
  await describe('static curated list resolves instantly, no network', async (t) => {
    const engine = loadEngine(async () => { throw new Error('should not fetch for a static match'); });
    const r = await engine.generateAiReply('מה המחיר של אפל?', 'he');
    // no network call means no fabricated number either — this only
    // reaches the honest "no key/couldn't fetch" fallback, which is fine;
    // the point is resolveTicker itself must not have needed the network.
    t.check('static resolveTicker finds Apple without any fetch', engine.resolveTicker(engine.normalizeText('מה המחיר של אפל')).ticker === 'AAPL');
  });

  await describe('dynamic resolution: real companies via Hebrew transliteration', async (t) => {
    const engine = loadEngine(createTwelveDataMock({
      symbolSearchResults: {
        'gauz': [{ symbol:'GAUZ', instrument_name:'Gauzy Ltd', exchange:'NASDAQ', instrument_type:'Common Stock' }],
        'san disk': [{ symbol:'SNDK', instrument_name:'SanDisk Corporation', exchange:'NASDAQ', instrument_type:'Common Stock' }],
      }
    }));
    const gauzy = await engine.resolveTickerDynamic('תן לי מידע על גאוזי');
    t.equal('Gauzy resolves correctly (needs vav=u AND final-yod=y together)', gauzy && gauzy.ticker, 'GAUZ');

    const sandisk = await engine.resolveTickerDynamic('תן לי מידע על מניית סאן דיסק');
    t.equal('SanDisk resolves via plain transliteration', sandisk && sandisk.ticker, 'SNDK');
  });

  await describe('general filler-word stripping (not just fixed trigger phrases)', async (t) => {
    const engine = loadEngine(createTwelveDataMock({
      symbolSearchResults: { 'gauz': [{ symbol:'GAUZ', instrument_name:'Gauzy Ltd', exchange:'NASDAQ', instrument_type:'Common Stock' }] }
    }));
    // Regression guard: "תן לי מידע על X" has no company-specific trigger
    // word in it at all ("מניית"/"חברת"/etc.) — only the general
    // filler-stripping fallback finds a candidate here.
    const r = await engine.resolveTickerDynamic('תן לי מידע על גאוזי');
    t.equal('resolves without any trigger phrase', r && r.ticker, 'GAUZ');
  });

  await describe('filler-word stripping never eats a real company name\'s first letter', async (t) => {
    // Regression guard: blind prefix-stripping once turned "מובילאיי"
    // (Mobileye) into "ובילאיי" by treating the real first letter as if it
    // were a grammatical prefix (like the ה/ל/ב/ו/מ/כ/ש in "והמניה").
    const engine = loadEngine();
    const candidate = engine.extractHebrewCandidate('ספר לי על מובילאיי');
    t.equal('keeps the real first letter', candidate, 'מובילאיי');
  });

  await describe('leveraged/derivative products are filtered out, never substituted', async (t) => {
    const engine = loadEngine(createTwelveDataMock({
      symbolSearchResults: {
        'sandisk': [
          { symbol:'3SND', instrument_name:'Leverage Shares 3x Long SanDisk (SNDK) ETP', exchange:'LSE', instrument_type:'Common Stock' },
          { symbol:'SNDK', instrument_name:'SanDisk Corporation', exchange:'NASDAQ', instrument_type:'Common Stock' }
        ]
      }
    }));
    const r = await engine.resolveTickerDynamic('מניית sandisk sndk');
    t.equal('picks the real stock over the leveraged ETP despite identical category tagging', r && r.ticker, 'SNDK');

    const onlyLeveragedMock = loadEngine(createTwelveDataMock({
      symbolSearchResults: {
        'sandisk': [{ symbol:'3SND', instrument_name:'Leverage Shares 3x Long SanDisk ETP', exchange:'LSE', instrument_type:'Common Stock' }]
      }
    }));
    const r2 = await onlyLeveragedMock.resolveTickerDynamic('מניית sandisk');
    t.equal('returns null rather than substituting a leveraged product for the real stock', r2, null);
  });

  await describe('a company in the static curated list resolves without needing the network', async (t) => {
    const engine = loadEngine(async () => { throw new Error('should not need network — DDOG is in the static list'); });
    const resolved = engine.resolveTicker(engine.normalizeText('what is the price of Datadog Corp XYZ'));
    t.equal('static list finds it directly', resolved && resolved.ticker, 'DDOG');
  });

  await describe('an ordinary conceptual question never triggers a network lookup', async (t) => {
    const engine = loadEngine(async () => { throw new Error('should never fetch for a plain concept question'); });
    const r = await engine.generateAiReply('מה זה מניה', 'he');
    t.equal('answers the concept normally', r.topicId, 'stock');
  });

  if(require.main === module) finalizeSuites();
})();
