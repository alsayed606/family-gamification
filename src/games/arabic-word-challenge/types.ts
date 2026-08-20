import type { Category } from "./data/words";

export type { Category };

export type Word = { w: string; c: Category };

export type Settings = {
  rounds: number;
  seconds: number;
  points: number;
  answerWindow: number;
};

export const DEFAULT_SETTINGS: Settings = {
  rounds: 10,
  seconds: 60,
  points: 5,
  answerWindow: 15,
};

/** 0 = الفريق الأول (أزرق)، 1 = الفريق الثاني (أحمر). */
export type TeamIndex = 0 | 1;

export type Team = {
  name: string;
  score: number;
  correct: number;
};

export type Phase = "reveal" | "open" | "answering" | "resolved";

export type Outcome = {
  ok: boolean;
  team: TeamIndex | null;
};

export type MatchRecord = {
  ts: number;
  t1: string;
  t2: string;
  s1: number;
  s2: number;
  c1: number;
  c2: number;
};
