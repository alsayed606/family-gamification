import { describe, expect, it } from "vitest";
import {
  addLockout,
  applyCorrectAnswer,
  applyScoreAdjustment,
  isAnswerCorrect,
  isRoundExhausted,
} from "../../../src/games/arabic-word-challenge/lib/roundLogic";
import type { Team } from "../../../src/games/arabic-word-challenge/types";

const teams = (): [Team, Team] => [
  { name: "الأزرق", score: 10, correct: 2 },
  { name: "الأحمر", score: 5, correct: 1 },
];

describe("addLockout / isRoundExhausted (buzzer lockout logic)", () => {
  it("locks a team out on its first wrong answer", () => {
    const locked = addLockout([], 0);
    expect(locked).toEqual([0]);
    expect(isRoundExhausted(locked)).toBe(false);
  });

  it("does not duplicate a team already locked out", () => {
    const locked = addLockout([0], 0);
    expect(locked).toEqual([0]);
  });

  it("round is exhausted once both teams are locked out", () => {
    const locked = addLockout([0], 1);
    expect(locked.sort()).toEqual([0, 1]);
    expect(isRoundExhausted(locked)).toBe(true);
  });
});

describe("isAnswerCorrect", () => {
  it("accepts an exact match", () => {
    expect(isAnswerCorrect("استثمار", "استثمار")).toBe(true);
  });

  it("accepts a normalized match (tashkeel / hamza variants)", () => {
    expect(isAnswerCorrect("إستثمار", "استثمار")).toBe(true);
    expect(isAnswerCorrect("جامعة", "جامعه")).toBe(true);
  });

  it("rejects a wrong word", () => {
    expect(isAnswerCorrect("استيراد", "استثمار")).toBe(false);
  });

  it("rejects an empty or whitespace-only answer", () => {
    expect(isAnswerCorrect("", "استثمار")).toBe(false);
    expect(isAnswerCorrect("   ", "استثمار")).toBe(false);
  });
});

describe("applyCorrectAnswer (scoring)", () => {
  it("adds points and a correct-answer credit to the winning team only", () => {
    const next = applyCorrectAnswer(teams(), 1, 5);
    expect(next[1]).toEqual({ name: "الأحمر", score: 10, correct: 2 });
    expect(next[0]).toEqual({ name: "الأزرق", score: 10, correct: 2 }); // unchanged
  });
});

describe("applyScoreAdjustment (admin manual score edit)", () => {
  it("adds or removes points for the chosen team", () => {
    const next = applyScoreAdjustment(teams(), 0, 5);
    expect(next[0].score).toBe(15);
  });

  it("never drops a team's score below zero", () => {
    const next = applyScoreAdjustment(teams(), 1, -100);
    expect(next[1].score).toBe(0);
  });
});
