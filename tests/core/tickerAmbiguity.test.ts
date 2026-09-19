import { describe, it, expect } from 'vitest';
import { generateAiReply, createConversationContext } from '@core/ai/index';
import { normalizeText } from '@core/ai/engine/text.js';
import { resolveTicker } from '@core/ai/entity/tickers.js';

// ---------------------------------------------------------------------------
// "cost" and "target" are ticker aliases (Costco, Target Corp) that are ALSO
// ordinary English words used constantly in unrelated financial vocabulary.
// An unqualified word-boundary match on a bare alias fired inside "dollar
// cost averaging" and "price target [fibonacci]", silently answering with
// one company's live data instead of the KB topic actually asked about.
//
// Found by the exhaustive sweep in kbCoverage.test.ts, not guessed. The fix
// (tickers.js, resolveTicker) requires an explicit company-question signal
// for these specific aliases, unless the alias IS the whole message.
// ---------------------------------------------------------------------------

const ask = async (q: string, lang: 'he'|'en') => generateAiReply(q, lang, null, createConversationContext());

describe('ticker resolution stays scoped to real company questions', () => {
  it('dollar cost averaging is not hijacked by Costco', async () => {
    const r = await ask('dollar cost averaging', 'en');
    expect(r.topicId).toBe('dollar-cost-averaging');
  });
  it('a price target question is not hijacked by Target Corp', async () => {
    const r = await ask('price target fibonacci', 'en');
    expect(r.topicId).toBe('fibonacci-extensions');
  });
  it('resolveTicker still resolves a bare "cost" or "target" alone', () => {
    // The pure resolver, not the full network-dependent reply pipeline —
    // fetching real data isn't available in this environment either way.
    expect(resolveTicker(normalizeText('cost'))?.ticker).toBe('COST');
    expect(resolveTicker(normalizeText('target'))?.ticker).toBe('TGT');
  });
  it('resolveTicker still resolves "cost" paired with a real company signal', () => {
    expect(resolveTicker(normalizeText('cost stock price'))?.ticker).toBe('COST');
    expect(resolveTicker(normalizeText('what is target dividend'))?.ticker).toBe('TGT');
  });
  it('resolveTicker does NOT resolve "cost"/"target" inside an unrelated phrase', () => {
    expect(resolveTicker(normalizeText('dollar cost averaging'))).toBeNull();
    expect(resolveTicker(normalizeText('price target fibonacci'))).toBeNull();
  });
});
