// منطق الجولة الصرف (بلا React) — قابل للاختبار مباشرة.

import { normalize } from "../../../lib/arabic";
import type { Team, TeamIndex } from "../types";

/** يضيف فريقاً لقائمة "خارج المحاولة" لهذه الجولة بلا تكرار. */
export function addLockout(locked: TeamIndex[], team: TeamIndex): TeamIndex[] {
  return locked.includes(team) ? locked : [...locked, team];
}

/** الجولة تنتهي بلا فائز إذا استُنفدت محاولات الفريقين (0 و1). */
export function isRoundExhausted(locked: TeamIndex[]): boolean {
  return locked.length >= 2;
}

/** مقارنة الإجابة بالكلمة الصحيحة بعد تطبيع النص. */
export function isAnswerCorrect(answer: string, word: string): boolean {
  return normalize(answer).length > 0 && normalize(answer) === normalize(word);
}

/** يمنح فريقاً النقاط ويزيد عداد إجاباته الصحيحة، دون المساس بالفريق الآخر. */
export function applyCorrectAnswer(
  teams: [Team, Team],
  team: TeamIndex,
  points: number
): [Team, Team] {
  return teams.map((t, i) =>
    i === team ? { ...t, score: t.score + points, correct: t.correct + 1 } : t
  ) as [Team, Team];
}

/** تعديل يدوي للنقاط (من لوحة المشرف) لا يقل عن صفر. */
export function applyScoreAdjustment(
  teams: [Team, Team],
  team: TeamIndex,
  delta: number
): [Team, Team] {
  return teams.map((t, i) =>
    i === team ? { ...t, score: Math.max(0, t.score + delta) } : t
  ) as [Team, Team];
}
