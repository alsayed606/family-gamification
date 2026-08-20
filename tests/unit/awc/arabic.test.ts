import { describe, expect, it } from "vitest";
import { AR_ONLY, countLetters, normalize, shuffleLetters } from "../../../src/games/arabic-word-challenge/lib/arabic";

describe("normalize", () => {
  it("removes tashkeel and tatweel", () => {
    expect(normalize("مَـدْرَسَـة")).toBe(normalize("مدرسه"));
  });

  it("unifies alef forms (أ إ آ ٱ -> ا)", () => {
    expect(normalize("أحمد")).toBe(normalize("احمد"));
    expect(normalize("إحسان")).toBe(normalize("احسان"));
    expect(normalize("آمال")).toBe(normalize("امال"));
    expect(normalize("ٱنطلاق")).toBe(normalize("انطلاق"));
  });

  it("unifies alef maqsura and ya (ى -> ي)", () => {
    expect(normalize("مستشفى")).toBe(normalize("مستشفي"));
  });

  it("unifies ta marbuta and ha (ة -> ه)", () => {
    expect(normalize("جامعة")).toBe(normalize("جامعه"));
  });

  it("unifies waw hamza (ؤ -> و)", () => {
    expect(normalize("مؤسسات")).toBe(normalize("موسسات"));
  });

  it("unifies ya hamza (ئ -> ي)", () => {
    expect(normalize("فئات")).toBe(normalize("فيات"));
  });

  it("drops a standalone hamza", () => {
    expect(normalize("جزء")).toBe(normalize("جز"));
  });

  it("strips whitespace so multi-word answers still compare", () => {
    expect(normalize("  استثمار  ")).toBe(normalize("استثمار"));
    expect(normalize("است ثمار")).toBe(normalize("استثمار"));
  });

  it("handles null/undefined/empty input without throwing", () => {
    expect(normalize(null)).toBe("");
    expect(normalize(undefined)).toBe("");
    expect(normalize("")).toBe("");
  });
});

describe("countLetters", () => {
  it("counts only Arabic letters", () => {
    expect(countLetters("استثمار")).toBe(7);
    expect(countLetters("مدن سعودية")).toBe(9);
  });
});

describe("AR_ONLY", () => {
  it("accepts Arabic letters and spaces", () => {
    expect(AR_ONLY.test("مدينة الرياض")).toBe(true);
  });

  it("rejects digits, Latin letters, and punctuation", () => {
    expect(AR_ONLY.test("رياض2")).toBe(false);
    expect(AR_ONLY.test("Riyadh")).toBe(false);
    expect(AR_ONLY.test("رياض!")).toBe(false);
  });
});

describe("shuffleLetters", () => {
  it("returns a permutation containing the exact same letters", () => {
    const word = "استثمار";
    const shuffled = shuffleLetters(word);
    expect(shuffled.join("")).not.toBe(word);
    expect([...shuffled].sort()).toEqual([...word].sort());
  });

  it("never returns the word in its original order, across many attempts", () => {
    const word = "برمجيات";
    for (let i = 0; i < 200; i++) {
      expect(shuffleLetters(word).join("")).not.toBe(word);
    }
  });

  it("degrades gracefully when every permutation is identical (all-repeated letters)", () => {
    // لا يوجد ترتيب آخر ممكن لكلمة بحرف واحد مكرر — يجب ألا تُرمى أي استثناء،
    // ويجب أن تبقى مجموعة الحروف الناتجة مطابقة للأصل.
    const word = "ككك";
    const shuffled = shuffleLetters(word);
    expect(shuffled).toHaveLength(word.length);
    expect([...shuffled].sort()).toEqual([...word].sort());
  });
});
