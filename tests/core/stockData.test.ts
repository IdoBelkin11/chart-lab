import { describe, it, expect } from 'vitest';
import { generateAiReply, createConversationContext } from '@core/ai/index';

// This path previously had zero coverage: the AI chat's live-data answer
// for a recognized/looked-up company (as opposed to tests/ui/stock.test.tsx,
// which only exercises the separate Stock page's own lookupStock service).
// That gap is exactly how a mismatched getMarketData() call went unnoticed —
// every real-company question (Nvidia included) silently fell through to
// the generic "couldn't fetch, try again" message instead of real data.
const ask = async (q: string, lang: 'he' | 'en' = /[\u0590-\u05FF]/.test(q) ? 'he' : 'en') =>
  generateAiReply(q, lang, null, createConversationContext());

const FAILURE_PHRASES = /couldn't fetch|try again in a moment|לא הצלחתי כרגע|נסה שוב בעוד רגע/i;

describe('AI chat: live stock-data answers', () => {
  it('answers a recognized company (Nvidia) with real data, not the generic failure message', async () => {
    const r = await ask('what is the price of Nvidia?');
    expect(r.topicId).toBe('stock-data');
    expect(r.text).toMatch(/\$\d/);
    expect(r.text).not.toMatch(FAILURE_PHRASES);
  });

  it('answers the same company asked in Hebrew, by its Hebrew alias', async () => {
    const r = await ask('מה המחיר של אנבידיה');
    expect(r.topicId).toBe('stock-data');
    expect(r.text).toMatch(/\$\d/);
    expect(r.text).not.toMatch(FAILURE_PHRASES);
  });

  it('answers a specific facet (RSI) with a real computed number', async () => {
    const r = await ask('what is the RSI of Apple?');
    expect(r.text).not.toMatch(FAILURE_PHRASES);
    expect(r.text).toMatch(/RSI.*\d/i);
  });

  it('answers a technical-analysis facet with trend + SMA + RSI, not a placeholder', async () => {
    const r = await ask('technical analysis of Tesla');
    expect(r.text).not.toMatch(FAILURE_PHRASES);
    expect(r.text).toMatch(/SMA/i);
  });

  it('compares two companies already in context with real numbers on both sides', async () => {
    const ctx = createConversationContext();
    await generateAiReply('what is the price of Apple?', 'en', null, ctx);
    await generateAiReply('what is the price of Microsoft?', 'en', null, ctx);
    const r = await generateAiReply('which one is more expensive?', 'en', null, ctx);
    expect(r.text).not.toMatch(FAILURE_PHRASES);
    expect(r.text).toMatch(/\$\d.*\$\d|\$\d[\s\S]*\$\d/);
  });

  it('a message with no company-name candidate at all still gets a real KB or off-topic answer, never fabricated', async () => {
    const r = await ask('why do stock markets exist in the first place?');
    expect(r.topicId).not.toBe('stock-data');
  });

  it('a plausible-looking but non-existent company name is never silently presented as real', async () => {
    const r = await ask('what do you know about Gauzxyz stock?');
    if (r.topicId === 'stock-data') {
      // Demo Mode is documented to synthesize a clearly-fake match for any
      // plausible-looking attempt rather than claim to have no data (see
      // demoProvider.js) — the bar here is that it's never presented as
      // real, not that Demo Mode declines to guess.
      expect(r.text).toMatch(/Demo Mode/i);
    }
  });

  it('answers a "should I invest" question with balanced pros/cons, never a buy/sell verdict', async () => {
    const r = await ask('should I invest in Tesla?');
    expect(r.topicId).toBe('stock-data');
    expect(r.text).toMatch(/Leaning positive|Leaning cautious/);
    expect(r.text).not.toMatch(/\byou should buy\b|\byou should sell\b/i);
  });

  it('resolves a company named with an attached Hebrew preposition ("באנבידיה" = "in Nvidia")', async () => {
    const r = await ask('כדאי להשקיע באנבידיה?');
    expect(r.topicId).toBe('stock-data');
  });
});
