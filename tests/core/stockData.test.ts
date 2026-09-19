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

  it('an unrecognized, non-existent ticker still gets the honest off-topic fallback (not fabricated data)', async () => {
    const r = await ask('what do you know about Gauzxyz stock?');
    expect(r.topicId).not.toBe('stock-data');
  });
});
