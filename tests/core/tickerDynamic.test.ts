import { describe, it, expect } from 'vitest';
import { extractHebrewCandidate, resolveTickerDynamic } from '@core/ai/entity/tickers';
import { generateAiReply, createConversationContext } from '@core/ai/index';

describe('Hebrew candidate extraction: comparison connectors', () => {
  it('strips a leading comparison connector, keeping just the company name', () => {
    expect(extractHebrewCandidate('מול גאוזי')).toBe('גאוזי');
    expect(extractHebrewCandidate('לעומת גאוזי')).toBe('גאוזי');
  });

  it('strips a compare instruction verb together with its connector', () => {
    expect(extractHebrewCandidate('תשווה מול גאוזי')).toBe('גאוזי');
    expect(extractHebrewCandidate('השווה לעומת גאוזי')).toBe('גאוזי');
  });
});

describe('Dynamic ticker resolution for an uncurated company named after a comparison', () => {
  it('resolves a company mentioned only as "against X" once the connector is stripped', async () => {
    const resolved = await resolveTickerDynamic('מול גאוזי');
    expect(resolved).not.toBeNull();
    expect(resolved && 'ambiguous' in resolved).toBeFalsy();
  });

  it('a comparison follow-up naming a second, uncurated company resolves via the AI chat, not the off-topic fallback', async () => {
    const ctx = createConversationContext();
    await generateAiReply('what is the price of Nvidia?', 'en', null, ctx);
    const r = await generateAiReply('מול גאוזי', 'he', null, ctx);
    expect(r.topicId).toBe('stock-data');
  });
});
