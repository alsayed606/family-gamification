import { describe, expect, it } from "vitest";
import { CATEGORIES, DEFAULT_WORDS } from "../../../src/games/arabic-word-challenge/data/words";
import { AR_ONLY, countLetters } from "../../../src/games/arabic-word-challenge/lib/arabic";

describe("word bank data integrity", () => {
  it("has 15 categories and 674 words as specified", () => {
    expect(CATEGORIES).toHaveLength(15);
    expect(DEFAULT_WORDS).toHaveLength(674);
  });

  it("has no duplicate words across categories", () => {
    const seen = new Set<string>();
    for (const { w } of DEFAULT_WORDS) {
      expect(seen.has(w)).toBe(false);
      seen.add(w);
    }
  });

  it("only uses Arabic letters and spaces", () => {
    for (const { w } of DEFAULT_WORDS) {
      expect(AR_ONLY.test(w)).toBe(true);
    }
  });

  it("every word has at least 6 Arabic letters", () => {
    for (const { w } of DEFAULT_WORDS) {
      expect(countLetters(w)).toBeGreaterThanOrEqual(6);
    }
  });

  it("every word's category is one of the declared CATEGORIES", () => {
    for (const { c } of DEFAULT_WORDS) {
      expect(CATEGORIES).toContain(c);
    }
  });
});
