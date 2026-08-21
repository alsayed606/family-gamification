import { describe, expect, it } from "vitest";
import {
  buildPool,
  categoriesOf,
  isCorrect,
  nextTeam,
  presentChoices,
  scrambleAnswer,
  winners,
} from "../../../src/games/family-quiz/lib/quiz";
import type { Question } from "../../../src/types";

/** ترتيب ثابت بدل العشوائي — الاختبار يفحص المنطق لا الحظّ. */
const asIs = <T,>(items: T[]): T[] => items;

function q(overrides: Partial<Question> = {}): Question {
  return {
    id: "q1",
    type: "MCQ",
    prompt: "سؤال",
    choices: ["أ", "ب", "ج"],
    answer: "أ",
    category: "عام",
    difficulty: "EASY",
    status: "PUBLISHED",
    createdBy: "uid",
    ...overrides,
  };
}

const bank: Question[] = [
  q({ id: "1", category: "جغرافيا", difficulty: "EASY" }),
  q({ id: "2", category: "جغرافيا", difficulty: "HARD" }),
  q({ id: "3", category: "علوم", difficulty: "EASY" }),
  q({ id: "4", category: "علوم", difficulty: "MEDIUM" }),
];

describe("بناء القرعة", () => {
  it("يقصّها إلى عدد الجولات", () => {
    const pool = buildPool(bank, { categories: [], difficulties: [], rounds: 2 }, asIs);
    expect(pool).toHaveLength(2);
  });

  it("يصفّي بالمجال", () => {
    const pool = buildPool(
      bank,
      { categories: ["علوم"], difficulties: [], rounds: 10 },
      asIs
    );
    expect(pool.map((x) => x.id)).toEqual(["3", "4"]);
  });

  it("يصفّي بالصعوبة", () => {
    const pool = buildPool(
      bank,
      { categories: [], difficulties: ["EASY"], rounds: 10 },
      asIs
    );
    expect(pool.map((x) => x.id)).toEqual(["1", "3"]);
  });

  it("يجمع التصفيتين", () => {
    const pool = buildPool(
      bank,
      { categories: ["جغرافيا"], difficulties: ["HARD"], rounds: 10 },
      asIs
    );
    expect(pool.map((x) => x.id)).toEqual(["2"]);
  });

  // الحالة التي أسقطت لعبة الكلمات سابقًا: طلب أكثر مما يملك البنك.
  it("يعطي قرعة أقصر من الجولات إن لم يكفِ البنك، بلا خطأ", () => {
    const pool = buildPool(bank, { categories: [], difficulties: [], rounds: 99 }, asIs);
    expect(pool).toHaveLength(4);
  });

  it("يعطي قرعة فارغة إن لم يطابق شيء", () => {
    const pool = buildPool(
      bank,
      { categories: ["تاريخ"], difficulties: [], rounds: 5 },
      asIs
    );
    expect(pool).toEqual([]);
  });

  it("لا ينهار عند عدد جولات سالب", () => {
    expect(
      buildPool(bank, { categories: [], difficulties: [], rounds: -3 }, asIs)
    ).toEqual([]);
  });
});

describe("تقييم الإجابة", () => {
  it("يطابق خيار الاختيار حرفيًا", () => {
    expect(isCorrect(q(), "أ")).toBe(true);
    expect(isCorrect(q(), "ب")).toBe(false);
  });

  it("يتسامح مع الإملاء في الكلمة المبعثرة", () => {
    const word = q({ type: "WORD_SCRAMBLE", answer: "مدرسة", choices: undefined });
    expect(isCorrect(word, "مدرسه")).toBe(true);
    expect(isCorrect(word, "مَدْرَسَة")).toBe(true);
    expect(isCorrect(word, " مدرسة ")).toBe(true);
  });

  it("يرفض الكلمة الخاطئة والإجابة الفارغة", () => {
    const word = q({ type: "WORD_SCRAMBLE", answer: "مدرسة", choices: undefined });
    expect(isCorrect(word, "جامعة")).toBe(false);
    expect(isCorrect(word, "")).toBe(false);
    expect(isCorrect(word, "   ")).toBe(false);
  });
});

describe("العرض", () => {
  it("يعرض كل الخيارات ولا يفقد واحدًا عند البعثرة", () => {
    const shown = presentChoices(q());
    expect([...shown].sort()).toEqual(["أ", "ب", "ج"].sort());
  });

  it("لا ينهار على سؤال بلا خيارات", () => {
    expect(presentChoices(q({ choices: undefined }))).toEqual([]);
  });

  it("يبعثر حروف الكلمة ويحذف المسافات", () => {
    const letters = scrambleAnswer(
      q({ type: "WORD_SCRAMBLE", answer: "بحر أحمر", choices: undefined })
    );
    expect(letters).toHaveLength(7);
    expect(letters).not.toContain(" ");
    expect([...letters].sort().join("")).toBe(
      [..."بحرأحمر"].sort().join("")
    );
  });
});

describe("إدارة المباراة", () => {
  it("يتناوب الفرق دائريًا", () => {
    expect(nextTeam(0, 2)).toBe(1);
    expect(nextTeam(1, 2)).toBe(0);
    expect(nextTeam(2, 3)).toBe(0);
  });

  it("لا يقسم على صفر عند غياب الفرق", () => {
    expect(nextTeam(0, 0)).toBe(0);
  });

  it("يحدّد الفائز", () => {
    const teams = [
      { name: "أ", score: 3 },
      { name: "ب", score: 5 },
    ];
    expect(winners(teams).map((t) => t.name)).toEqual(["ب"]);
  });

  it("يُرجع الفريقين عند التعادل — بما فيه صفر مقابل صفر", () => {
    expect(
      winners([
        { name: "أ", score: 0 },
        { name: "ب", score: 0 },
      ])
    ).toHaveLength(2);
  });
});

describe("المجالات", () => {
  it("تُستخرج بلا تكرار ومرتّبة", () => {
    expect(categoriesOf(bank)).toEqual(["جغرافيا", "علوم"]);
  });

  it("بنك فارغ يعطي قائمة فارغة", () => {
    expect(categoriesOf([])).toEqual([]);
  });
});
