/**
 * Quiz domain types — "strategic profile" archetype model.
 *
 * Each scored question is a single-select whose options map to a profile `key`.
 * Scoring counts keys across scored questions and resolves to a dominant
 * profile (with deterministic tie-breaks). One trailing non-scored question
 * captures role. Everything is data-driven from `config.ts`.
 */

export interface QuizOption {
  label: string;
  /** Profile key this option contributes to (e.g. "scout"). */
  key: string;
}

export interface QuizQuestion {
  id: string;
  /** Whether this question contributes to the profile score. */
  scoring: boolean;
  text: string;
  options: QuizOption[];
}

export interface Profile {
  key: string;
  /** Display name, e.g. "The Scout". */
  name: string;
  /** Italic one-liner. */
  mantra: string;
  /** The main read. */
  result: string;
  /** "Where you are exposed". */
  exposed: string;
  /** "What a matched cohort gives you". */
  cohort: string;
}

export interface QuizConfig {
  id: string;
  /** Landing hook. */
  title: string;
  titleEmphasis: string;
  subtitle: string;
  meta: string;
  questions: QuizQuestion[];
  profiles: Record<string, Profile>;
  /** Tie-break priority order (first match wins). */
  priority: string[];
  /** Question ids consulted (in order) to break ties before priority order. */
  tieBreakQuestions: string[];
}

/** Answer set: question id → chosen option key. */
export type AnswerSet = Record<string, string>;
