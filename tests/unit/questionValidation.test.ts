import { describe, expect, it } from "vitest";
import {
  MIN_SCRAMBLE,
  defaultChoices,
  hasErrors,
  normalizeQuestion,
  validateQuestion,
} from "../../src/lib/questionValidation";
import { MAX_PROMPT, type QuestionDraft } from "../../src/types";

function mcq(overrides: Partial<QuestionDraft> = {}): QuestionDraft {
  return {
    type: "MCQ",
    prompt: "ما عاصمة المملكة العربية السعودية؟",
    choices: ["الرياض", "جدة", "الدمام"],
    answer: "الرياض",
    category: "جغرافيا",
    difficulty: "EASY",
    ...overrides,
  };
}

describe("سؤال صالح", () => {
  it("يمرّ بلا أخطاء", () => {
    expect(hasErrors(validateQuestion(mcq()))).toBe(false);
  });

  it("يقبل صح/خطأ بالخيارين المثبَّتين", () => {
    const errors = validateQuestion(
      mcq({ type: "TRUE_FALSE", choices: ["صح", "خطأ"], answer: "خطأ" })
    );
    expect(hasErrors(errors)).toBe(false);
  });

  it("يقبل كلمة مبعثرة بلا خيارات", () => {
    const errors = validateQuestion({
      type: "WORD_SCRAMBLE",
      prompt: "مبنى يتعلّم فيه الطلاب",
      answer: "مدرسة",
      category: "عام",
      difficulty: "EASY",
    });
    expect(hasErrors(errors)).toBe(false);
  });
});

describe("الثابت الجوهري: الإجابة أحد الخيارات", () => {
  it("يرفض إجابة خارج الخيارات", () => {
    expect(validateQuestion(mcq({ answer: "أبها" })).answer).toBe(
      "الإجابة يجب أن تكون أحد الخيارات."
    );
  });

  it("يقبل الإجابة بعد قصّ المسافات", () => {
    expect(hasErrors(validateQuestion(mcq({ answer: "  الرياض  " })))).toBe(
      false
    );
  });
});

describe("الخيارات", () => {
  it("يرفض أقل من خيارين", () => {
    expect(validateQuestion(mcq({ choices: ["الرياض"] })).choices).toBeTruthy();
  });

  it("يرفض أكثر من ستة", () => {
    const choices = ["1", "2", "3", "4", "5", "6", "7"];
    expect(validateQuestion(mcq({ choices, answer: "1" })).choices).toBeTruthy();
  });

  it("يرفض خيارًا فارغًا", () => {
    expect(
      validateQuestion(mcq({ choices: ["الرياض", "   "] })).choices
    ).toBe("لا تترك خيارًا فارغًا.");
  });

  it("يرفض التكرار — وهو ما لا تستطيع القواعد فرضه", () => {
    expect(
      validateQuestion(mcq({ choices: ["الرياض", "الرياض"] })).choices
    ).toBe("لا تكرّر الخيارات.");
  });

  it("يرفض خياري صح/خطأ إن غُيِّرا", () => {
    expect(
      validateQuestion(
        mcq({ type: "TRUE_FALSE", choices: ["نعم", "لا"], answer: "نعم" })
      ).choices
    ).toBeTruthy();
  });

  it("يرفض خيارات على كلمة مبعثرة", () => {
    const errors = validateQuestion({
      type: "WORD_SCRAMBLE",
      prompt: "تلميح",
      choices: ["أ", "ب"],
      answer: "مدرسة",
      category: "عام",
      difficulty: "EASY",
    });
    expect(errors.choices).toBe("الكلمة المبعثرة بلا خيارات.");
  });
});

describe("حدود النصوص", () => {
  it("يرفض نصًّا فارغًا", () => {
    expect(validateQuestion(mcq({ prompt: "   " })).prompt).toBe(
      "أدخل نصّ السؤال."
    );
  });

  it("يرفض ما تجاوز الحدّ ويقبل ما بلغه", () => {
    expect(
      validateQuestion(mcq({ prompt: "س".repeat(MAX_PROMPT + 1) })).prompt
    ).toBeTruthy();
    expect(
      validateQuestion(mcq({ prompt: "س".repeat(MAX_PROMPT) })).prompt
    ).toBeUndefined();
  });

  it("يرفض مجالًا فارغًا", () => {
    expect(validateQuestion(mcq({ category: "" })).category).toBeTruthy();
  });

  it("يرفض كلمة مبعثرة أقصر من الحدّ", () => {
    const errors = validateQuestion({
      type: "WORD_SCRAMBLE",
      prompt: "تلميح",
      answer: "من",
      category: "عام",
      difficulty: "EASY",
    });
    expect(errors.answer).toBe(
      `الكلمة يجب ألا تقل عن ${MIN_SCRAMBLE} أحرف.`
    );
  });
});

describe("التطبيع قبل الكتابة", () => {
  it("يقصّ المسافات من كل الحقول", () => {
    const out = normalizeQuestion(
      mcq({ prompt: "  سؤال  ", answer: " الرياض ", category: " جغرافيا " })
    );
    expect(out.prompt).toBe("سؤال");
    expect(out.answer).toBe("الرياض");
    expect(out.category).toBe("جغرافيا");
  });

  it("يُسقط مفتاح choices من الكلمة المبعثرة لا يتركه undefined", () => {
    const out = normalizeQuestion({
      type: "WORD_SCRAMBLE",
      prompt: "تلميح",
      choices: ["أ", "ب"],
      answer: "مدرسة",
      category: "عام",
      difficulty: "EASY",
    });
    // القاعدة تفحص !('choices' in d): وجود المفتاح بقيمة undefined يكفي
    // لأن يكتبه Firestore ويسقط السؤال.
    expect("choices" in out).toBe(false);
  });
});

describe("الخيارات الافتراضية للنوع", () => {
  it("تعطي خيارين فارغين للاختيار من متعدد", () => {
    expect(defaultChoices("MCQ")).toEqual(["", ""]);
  });

  it("تثبّت خياري صح/خطأ", () => {
    expect(defaultChoices("TRUE_FALSE")).toEqual(["صح", "خطأ"]);
  });

  it("لا تعطي خيارات للكلمة المبعثرة", () => {
    expect(defaultChoices("WORD_SCRAMBLE")).toBeNull();
  });
});
