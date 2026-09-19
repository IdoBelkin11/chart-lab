import { describe, it, expect } from 'vitest';
import { generateAiReply, createConversationContext, kbById, setAmbientLessonTopic, followupChipsFor, KB } from '@core/ai/index';

const ask = async (q: string, lang: 'he' | 'en' = /[\u0590-\u05FF]/.test(q) ? 'he' : 'en') =>
  generateAiReply(q, lang, null, createConversationContext());

describe('AI engine survives the ESM port', () => {
  it('answers a broad topic question', async () => {
    const r = await ask('מה זה ממוצעים נעים?');
    expect(r.topicId).toBe('moving-averages');
    expect(r.text.length).toBeGreaterThan(200);
  });

  it('resolves a specific facet, not its parent', async () => {
    expect((await ask('מה זה צלב זהב?')).topicId).toBe('golden-cross');
    expect((await ask('מה זה צלב מוות?')).topicId).toBe('death-cross');
    expect((await ask("מה החסרונות של פיבונאצ'י?")).topicId).toBe('fibonacci-limitations');
    expect((await ask('what does RSI above 70 mean?')).topicId).toBe('rsi-overbought');
    expect((await ask('מה ההבדל בין SMA ל EMA?')).topicId).toBe('sma-vs-ema');
  });

  it('a focused answer does not dump the parent topic', async () => {
    const parent = kbById('moving-averages')!;
    const gc = await ask('מה זה צלב זהב?');
    expect(gc.text.includes(parent.he.slice(0, 60))).toBe(false);
    expect(gc.text.length).toBeGreaterThan(300);
  });

  it('an explicit new topic overrides context', async () => {
    const ctx = createConversationContext();
    await generateAiReply('מה זה ממוצעים נעים?', 'he', null, ctx);
    const r = await generateAiReply('מה זה RSI?', 'he', 'moving-averages', ctx);
    expect(r.topicId).toBe('rsi');
  });

  it('an unrelated question is not forced into the current topic', async () => {
    const ctx = createConversationContext();
    await generateAiReply('מה זה צלב זהב?', 'he', null, ctx);
    const r = await generateAiReply('מה זה דיבידנד?', 'he', 'golden-cross', ctx);
    expect(r.topicId).toBe('dividend');
  });

  it('rotates examples instead of repeating', async () => {
    const ctx = createConversationContext();
    await generateAiReply('מה זה צלב זהב?', 'he', null, ctx);
    const a = await generateAiReply('תן לי דוגמה', 'he', 'golden-cross', ctx);
    const b = await generateAiReply('תן לי דוגמה אחרת', 'he', 'golden-cross', ctx);
    const body = (t: string) => t.replace(/^[^\n]*\n\n/, '').slice(0, 60);
    expect(body(a.text)).not.toBe(body(b.text));
  });

  it('ambient lesson topic is injected, not read from the DOM', async () => {
    // The engine no longer queries document at all — this is the seam that
    // replaced it.
    expect(() => setAmbientLessonTopic('rsi')).not.toThrow();
    setAmbientLessonTopic(null);
  });
});

describe('an unknown subject is not answered with the previous topic', () => {
  it('resolves as its own new subject, instead of re-serving what was just discussed', async () => {
    const ctx = createConversationContext();
    const first = await generateAiReply('מה זה מגמה', 'he', null, ctx);
    expect(first.topicId).toBe('trend');

    // Five words, matches nothing in the KB. The short-follow-up fallback
    // used to assume any short unmatched message was still ABOUT the
    // previous topic, so this was answered with the full trend explanation
    // — confidently, fluently, and about something the visitor had not
    // asked about. "gauz" is itself a real (if obscure) company this
    // engine now resolves dynamically (see tickers.js) — the guard's job
    // is only to stop the wrong silent re-serve, not to guarantee an
    // off-topic message for every unmatched word.
    const reply = await generateAiReply('תן לי מידע על gauz', 'he', first.topicId!, ctx);
    expect(reply.text).not.toMatch(/מגמת עלייה/);
    expect(reply.topicId).toBe('stock-data');
  });

  it('genuine short follow-ups still resolve against the previous topic', async () => {
    const ctx = createConversationContext();
    const first = await generateAiReply('מה זה מגמה', 'he', null, ctx);
    const reply = await generateAiReply('זה טוב או רע?', 'he', first.topicId!, ctx);
    // The guard must be narrow enough not to break the thing it protects.
    expect(reply.topicId).toBe('trend');
  });

  it('an unknown English subject behaves the same way, never fabricated as if it were real', async () => {
    const ctx = createConversationContext();
    const first = await generateAiReply('what is a trend', 'en', null, ctx);
    const reply = await generateAiReply('tell me about zorblax', 'en', first.topicId!, ctx);
    // "zorblax" isn't a real company, so in production (a real market-data
    // provider) this would correctly find nothing and fall to the honest
    // off-topic message. This suite runs against Demo Mode, whose provider
    // is documented to synthesize a clearly-fake match for any plausible-
    // looking attempt rather than claim to have no data — so the bar here
    // is that it's never silently presented as real, not that it's absent.
    expect(reply.topicId).not.toBe('trend');
    expect(reply.text).toMatch(/Demo Mode/i);
  });
});

describe('follow-up chip labels are readable or absent', () => {
  it('never produces a nonsense question from a long descriptive keyword', () => {
    // The concrete failure: "מה זה פריצה נפח גבוה rsi מעל 70?" — scenario
    // entries are keyed on long phrases, and the old fallback wrapped the
    // first keyword it found in "what is …?" regardless of length.
    for (const entry of KB) {
      for (const lang of ['he', 'en'] as const) {
        const label = followupChipsFor(entry.id, lang) as string | null;
        if (label === null) continue;       // absent is a fine outcome
        expect(label.split(' ').length, `${entry.id}/${lang}: ${label}`).toBeLessThanOrEqual(6);
        expect(label.length, `${entry.id}/${lang}: ${label}`).toBeLessThanOrEqual(44);
      }
    }
  });

  it('never leaks an internal sentinel keyword into a suggestion', () => {
    for (const entry of KB) {
      for (const lang of ['he', 'en'] as const) {
        const label = followupChipsFor(entry.id, lang) as string | null;
        if (label) expect(label, entry.id).not.toMatch(/__/);
      }
    }
  });
});
