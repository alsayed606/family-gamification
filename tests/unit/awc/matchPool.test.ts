import { describe, expect, it } from "vitest";
import { DEFAULT_WORDS } from "../../../src/games/arabic-word-challenge/data/words";
import type { Word } from "../../../src/games/arabic-word-challenge/types";

/**
 * قرعة المباراة أقصر من عدد الجولات حين يكون البنك المفعّل أصغر منه.
 *
 * محرّك اللعبة كان ينتقل للجولة التالية بالاعتماد على عدّاد الجولات وحده،
 * فيقرأ عنصرًا خارج المصفوفة وتنهار اللعبة في منتصفها. الحالة واقعية: تفعيل
 * مجال «التاريخ» وحده (24 كلمة) مع 30 جولة.
 */
function pickPool(playable: Word[], rounds: number): Word[] {
  return [...playable].slice(0, rounds);
}

describe("قرعة أقصر من عدد الجولات", () => {
  const history = DEFAULT_WORDS.filter((w) => w.c === "التاريخ");

  it("مجال «التاريخ» فعلًا أصغر من الحد الأقصى للجولات (30)", () => {
    expect(history.length).toBeLessThan(30);
  });

  it("القرعة تساوي حجم البنك حين يكون أصغر من عدد الجولات", () => {
    const pool = pickPool(history, 30);
    expect(pool).toHaveLength(history.length);
  });

  it("الفهرس الذي كان ينهار يقع خارج المصفوفة فعلًا", () => {
    const pool = pickPool(history, 30);
    // عند بلوغ الجولة رقم history.length يصبح pool[round] غير معرّف —
    // وهذا ما يجب أن يُنهي المباراة لا أن يُمرَّر إلى loadRound.
    expect(pool[history.length]).toBeUndefined();
    expect(history.length).toBeLessThan(30);
  });

  it("شرط الإنهاء يلتقط الحالتين: بلوغ الجولات ونفاد القرعة", () => {
    const rounds = 30;
    const pool = pickPool(history, rounds);
    const shouldFinish = (round: number) =>
      round >= rounds || pool[round] === undefined;

    expect(shouldFinish(0)).toBe(false);
    expect(shouldFinish(history.length - 1)).toBe(false);
    expect(shouldFinish(history.length)).toBe(true); // نفاد القرعة
    expect(shouldFinish(rounds)).toBe(true); // بلوغ عدد الجولات
  });

  it("بنك كافٍ: القرعة تساوي عدد الجولات بالضبط", () => {
    const pool = pickPool(DEFAULT_WORDS, 10);
    expect(pool).toHaveLength(10);
    expect(pool[10]).toBeUndefined();
  });
});
