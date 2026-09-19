import { describe, it, expect } from 'vitest';
import { generateAiReply, createConversationContext } from '@core/ai/index';

// ---------------------------------------------------------------------------
// FUZZY_TERMS is auto-generated from EVERY single-word keyword across the
// whole KB (matchingEngine.js, buildFuzzyTerms), so any two unrelated,
// correctly-spelled English words within edit-distance 2 of each other can
// collide: "correlation" and "correction" are both real, different KB
// keywords that happen to sit that close, so asking about either one
// manufactured a phantom bonus for the other.
//
// The fix (fuzzyBonus in matchingEngine.js) skips fuzzy-correction for any
// word that is ALREADY a real KB term itself — it is not a typo of
// something else, it is a correctly-spelled different concept. This test
// pins both directions of the collision this found, and separately confirms
// the fix didn't disable the feature it was protecting.
// ---------------------------------------------------------------------------

const ask = async (q: string, lang: 'he' | 'en') => generateAiReply(q, lang, null, createConversationContext());

describe('fuzzy typo-correction does not overrule a real, different keyword', () => {
  it('"correlation" resolves to correlation, not a phantom match', async () => {
    expect((await ask('correlation', 'en')).topicId).toBe('correlation');
  });
  it('"correction" (pullback\'s own keyword) still resolves to pullback', async () => {
    expect((await ask('correction', 'en')).topicId).toBe('pullback');
  });
  it('"stocks" being close to the slang "stonks" does not steal an unrelated match', async () => {
    expect((await ask('tax on stocks', 'en')).topicId).toBe('capital-gains-tax-israel');
  });
  it('the real typo-correction use case this system exists for still works', async () => {
    // A misspelling has no legitimate home of its own, so it is still
    // corrected — only a correctly-spelled different word is protected.
    expect((await ask('divdend', 'en')).topicId).toBe('dividend');
    expect((await ask('resistence', 'en')).topicId).toBe('support-resistance');
  });
});

describe('a specific entry does not steal its own more specific children', () => {
  it('gross/operating/net margin resolve to themselves, not the generic margin entry', async () => {
    expect((await ask('gross margin', 'en')).topicId).toBe('gross-margin');
    expect((await ask('operating margin', 'en')).topicId).toBe('operating-margin');
    expect((await ask('net margin', 'en')).topicId).toBe('net-margin');
  });
});
