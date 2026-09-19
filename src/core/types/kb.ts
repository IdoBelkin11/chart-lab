// ---------------------------------------------------------------------------
// Core domain types.
//
// These describe the knowledge base and the learning model. They live in
// @core because they are UI-agnostic: nothing here mentions React, the DOM,
// or CSS. That is the boundary we agreed on — if this project ever moves to
// React Native, everything typed by this file moves with it unchanged.
// ---------------------------------------------------------------------------

/** The two supported interface languages. */
export type Lang = 'he' | 'en';

/** Colour scheme. Persisted; an explicit choice beats the OS preference. */
export type Theme = 'dark' | 'light';

/** Text that exists in both languages. */
export interface Localized {
  he: string;
  en: string;
}

/** Worked examples, which "give me another example" rotates through. */
export interface ExampleSet {
  he: string[];
  en: string[];
}

/**
 * A knowledge-base entry.
 *
 * A *facet* is an ordinary entry that additionally sets `parent` and
 * `priority` — that pairing is the whole mechanism by which a specific
 * question ("what is a golden cross?") outranks its broad parent topic
 * ("what are moving averages?") in the same scorer.
 */
export interface KbEntry {
  id: string;
  cat: string;
  /** Matching terms, both languages, lowercase. */
  kw: string[];
  he: string;
  en: string;
  /** Scoring bonus. Facets carry one so they beat their parent. */
  priority?: number;
  /** Set on facets: the broad topic this narrows. */
  parent?: string;
  /** Set on comparison facets: exactly the two ids being contrasted. */
  compares?: [string, string];
  related?: string[];
  examples?: ExampleSet | string[];
  /** Aspect-specific answers, e.g. definition vs pros vs cons. */
  facets?: Record<string, Localized>;
}

/** Where a learner stands on one lesson. */
export type LessonState = 'not-started' | 'learning' | 'completed';

export interface LessonProgress {
  completed: string[];
  visited: string[];
  lastVisited: string | null;
}

/** How the current topic was determined — recorded so it is debuggable. */
export type TopicSource = 'explicit' | 'active-lesson' | 'last-visited';

export interface CurrentTopic {
  lessonId: string;
  index: number;
  source: TopicSource;
  label: string;
  kbTopicId: string | null;
  followupTopicId: string | null;
}

/**
 * A quiz question.
 *
 * Options are KEYED ('a'..'d'), not positional, and the answer is recorded as
 * `correctKey`. That matters: keys survive shuffling, whereas an index would
 * silently point at the wrong option the moment the order changed.
 */
export interface QuizOption {
  key: string;
  text: Localized;
}

export interface QuizQuestion {
  id: string;
  /**
   * Which lesson teaches this question, e.g. 'l3'. Absent for general-bank
   * questions that belong to no single chapter. This is what "Practice this"
   * selects on — see @core/quiz/topicScoping.
   */
  lesson?: string;
  category: string;
  difficulty?: string;
  question: Localized;
  options: QuizOption[];
  correctKey: string;
  explanation: Localized;
}

/** A normalized market quote. Shape owned by Chart Lab, not by a vendor. */
export interface Quote {
  symbol: string;
  name?: string;
  exchange?: string;
  price: number;
  previousClose: number | null;
  changePct: number | null;
  currency: string;
  asOf: string | null;
  isDemo: boolean;
  source: string;
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

/**
 * The market-data contract. Implemented by the demo provider, the backend
 * proxy, and the direct vendor provider — the UI never knows which is live.
 */
export interface MarketDataProvider {
  id: string;
  isDemo: boolean;
  sourceLabel: string;
  hasApiKey(): boolean;
  getQuote(symbol: string): Promise<Quote | null>;
  getHistory(symbol: string, days: number): Promise<Candle[]>;
  getFundamentals(symbol: string): Promise<Record<string, unknown> | null>;
  searchSymbol(query: string): Promise<Array<Record<string, unknown>>>;
}

/**
 * What the AI engine returns.
 *
 * The ported JavaScript returns several differently-shaped object literals
 * depending on which path answered, so TypeScript infers an awkward union
 * where `topicId` exists on some branches and not others. Declaring the
 * contract here is what the UI actually codes against — and it documents
 * that a reply always carries text, and usually knows which topic answered.
 */
export interface AiReply {
  text: string;
  /** The KB entry that produced the answer, when one did. */
  topicId?: string;
  /** Ids for follow-up suggestion chips. */
  relatedIds?: string[];
  /** True when the reply is the topic browser rather than an answer. */
  browse?: boolean;
  entityContext?: unknown;
}
