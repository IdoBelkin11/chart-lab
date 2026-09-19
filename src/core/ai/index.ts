// ---------------------------------------------------------------------------
// AI layer: the single entry point the UI imports.
//
// Every module underneath is pure — no DOM, no React, no globals. The old
// build relied on script concatenation, so each file simply assumed the
// others' symbols existed; here the dependency graph is explicit, which is
// what surfaced (and fixed) a circular import between the engine and the
// intent layer during the port.
// ---------------------------------------------------------------------------
import type { AiReply, Lang } from '@core/types/kb';
import { generateAiReply as rawGenerate } from './engine/matchingEngine.js';

export { KB, kbById, kbFacetsOf } from './kb/index';
export { normalizeText } from './engine/text.js';
export { setAmbientLessonTopic } from './ambientTopic.js';
// Follow-up chips and the topic browser. Both were ported and then left
// unreachable: the engine returns `relatedIds` on every answer and `browse:
// true` for "list the topics", and the UI used neither — so two features
// were being computed on every turn and thrown away.
export {
  followupChipsFor,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  topicsInCategory
} from './engine/followupChips.js';
export { createConversationContext } from './context/conversationContext.js';
export { TICKER_MAP } from './entity/tickers.js';
export { DemoProvider } from './market/demoProvider.js';
export { TwelveDataProvider } from './market/twelveDataProvider.js';
export { BackendProvider } from './market/backendProvider.js';
export {
  getMarketData,
  setActiveMarketDataProvider,
  pickDefaultMarketProvider
} from './market/index.js';

/**
 * Ask the tutor a question.
 *
 * Typed wrapper over the ported engine: the underlying JS returns several
 * object shapes depending on which path answered, and this narrows them to
 * one documented contract so the UI has something stable to code against.
 */
export function generateAiReply(
  question: string,
  lang: Lang,
  lastTopicId: string | null,
  conversationContext: unknown
): Promise<AiReply> {
  return rawGenerate(question, lang, lastTopicId, conversationContext) as Promise<AiReply>;
}
