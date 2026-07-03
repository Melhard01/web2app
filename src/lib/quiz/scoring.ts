import type { AnswerSet, Profile, QuizConfig } from "./types";

/**
 * Count chosen option keys across the scored questions. The result is the raw
 * per-profile score that both the dominant-profile resolution and the report
 * radar are built from. Side-effect free (runs on server or client).
 */
export function tallyScores(
  config: QuizConfig,
  answers: AnswerSet,
): Record<string, number> {
  const tally: Record<string, number> = {};
  for (const p of Object.keys(config.profiles)) tally[p] = 0;

  for (const q of config.questions) {
    if (!q.scoring) continue;
    const key = answers[q.id];
    if (key && key in tally) tally[key] += 1;
  }
  return tally;
}

/** Number of questions that contribute to the score = the max any axis can hit. */
export function maxPossibleScore(config: QuizConfig): number {
  return config.questions.filter((q) => q.scoring).length;
}

/**
 * Resolve the dominant profile from an answer set. Deterministic + side-effect
 * free. Mirrors the brand-preview logic:
 *   1. Count keys across scored questions.
 *   2. Highest count wins.
 *   3. On a tie, consult tieBreakQuestions in order — if the user's answer there
 *      is among the tied keys, it wins.
 *   4. Otherwise fall back to the configured priority order.
 */
export function computeProfile(config: QuizConfig, answers: AnswerSet): string {
  const tally = tallyScores(config, answers);

  const max = Math.max(...Object.keys(config.profiles).map((k) => tally[k]));
  const top = config.priority.filter((k) => tally[k] === max);
  if (top.length === 1) return top[0];

  for (const qid of config.tieBreakQuestions) {
    const a = answers[qid];
    if (a && top.includes(a)) return a;
  }

  for (const k of config.priority) {
    if (top.includes(k)) return k;
  }
  return config.priority[config.priority.length - 1];
}

export interface ProfileReport {
  profileKey: string;
  profile: Profile;
  /** Raw per-profile score (key → count) across the scored questions. */
  scores: Record<string, number>;
  /** Highest score any single axis can reach (= number of scored questions). */
  maxScore: number;
  /** Captured role key (non-scored), if answered. */
  role?: string;
}

export function buildReport(config: QuizConfig, answers: AnswerSet): ProfileReport {
  const profileKey = computeProfile(config, answers);
  return {
    profileKey,
    profile: config.profiles[profileKey],
    scores: tallyScores(config, answers),
    maxScore: maxPossibleScore(config),
    role: answers["role"],
  };
}
