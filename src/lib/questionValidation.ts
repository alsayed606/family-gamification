import {
  MAX_ANSWER,
  MAX_CATEGORY,
  MAX_CHOICES,
  MAX_PROMPT,
  MIN_CHOICES,
  TRUE_FALSE_CHOICES,
  type QuestionDraft,
  type QuestionType,
} from "../types";

// ============================================================
//  تحقّق من صحة السؤال — نسخة المتصفح.
//
//  كل حدّ هنا يطابق ما تفرضه config/firestore.rules عمدًا. القاعدة على
//  الخادم هي الفاصلة؛ هذه للراحة فقط، كي يرى المؤلّف الخطأ قبل الإرسال
//  بدل رفض غامض بعد ملء النموذج. أي اختلاف بين الاثنين خلل لا ميزة.
//
//  ثابت لا تفرضه القواعد: تكرار الخيارات. القواعد لا تملك أداة تحقّق من
//  التفرّد داخل قائمة، فيبقى فحصًا في المتصفح فقط. أثره جودة محتوى لا
//  أمن — سؤال بخيارين متطابقين مربك، لكنه لا يمنح أحدًا صلاحية.
// ============================================================

/** أقصر كلمة تُبعثر بصورة ذات معنى. تطابق الحدّ في القواعد. */
export const MIN_SCRAMBLE = 3;

export type QuestionErrors = {
  prompt?: string;
  answer?: string;
  category?: string;
  choices?: string;
};

/** الخيارات المتوقّعة لكل نوع، أو null لما لا خيارات له. */
export function defaultChoices(type: QuestionType): string[] | null {
  if (type === "WORD_SCRAMBLE") return null;
  if (type === "TRUE_FALSE") return [...TRUE_FALSE_CHOICES];
  return ["", ""];
}

export function validateQuestion(draft: QuestionDraft): QuestionErrors {
  const errors: QuestionErrors = {};

  const prompt = draft.prompt.trim();
  if (prompt.length === 0) errors.prompt = "أدخل نصّ السؤال.";
  else if (prompt.length > MAX_PROMPT)
    errors.prompt = `نصّ السؤال يجب ألا يتجاوز ${MAX_PROMPT} حرفًا.`;

  const category = draft.category.trim();
  if (category.length === 0) errors.category = "أدخل المجال.";
  else if (category.length > MAX_CATEGORY)
    errors.category = `المجال يجب ألا يتجاوز ${MAX_CATEGORY} حرفًا.`;

  const answer = draft.answer.trim();
  if (answer.length === 0) errors.answer = "أدخل الإجابة الصحيحة.";
  else if (answer.length > MAX_ANSWER)
    errors.answer = `الإجابة يجب ألا تتجاوز ${MAX_ANSWER} حرفًا.`;

  if (draft.type === "WORD_SCRAMBLE") {
    if (draft.choices !== undefined)
      errors.choices = "الكلمة المبعثرة بلا خيارات.";
    if (answer.length > 0 && answer.length < MIN_SCRAMBLE)
      errors.answer = `الكلمة يجب ألا تقل عن ${MIN_SCRAMBLE} أحرف.`;
    return errors;
  }

  const choices = (draft.choices ?? []).map((c) => c.trim());

  if (choices.length < MIN_CHOICES)
    errors.choices = `أضف ${MIN_CHOICES} خيارات على الأقل.`;
  else if (choices.length > MAX_CHOICES)
    errors.choices = `الخيارات يجب ألا تتجاوز ${MAX_CHOICES}.`;
  else if (choices.some((c) => c.length === 0))
    errors.choices = "لا تترك خيارًا فارغًا.";
  else if (new Set(choices).size !== choices.length)
    errors.choices = "لا تكرّر الخيارات.";
  else if (draft.type === "TRUE_FALSE" && !sameChoices(choices))
    errors.choices = `خيارا هذا النوع «${TRUE_FALSE_CHOICES.join("» و«")}».`;
  else if (answer.length > 0 && !choices.includes(answer))
    // الثابت الجوهري: سؤال اختيار بلا إجابة صحيحة ضمن خياراته لا معنى له.
    errors.answer = "الإجابة يجب أن تكون أحد الخيارات.";

  return errors;
}

export function hasErrors(errors: QuestionErrors): boolean {
  return Object.keys(errors).length > 0;
}

function sameChoices(choices: string[]): boolean {
  return (
    choices.length === TRUE_FALSE_CHOICES.length &&
    choices.every((c, i) => c === TRUE_FALSE_CHOICES[i])
  );
}

/**
 * ينظّف المسوّدة قبل الكتابة: يقصّ المسافات ويحذف حقل الخيارات من
 * الكلمة المبعثرة. القواعد ترفض وجود choices فيها، وترك مفتاح بقيمة
 * undefined يجعل Firestore يكتبه — فالحذف صريح لا اعتماد على الضمني.
 */
export function normalizeQuestion(draft: QuestionDraft): QuestionDraft {
  const base = {
    type: draft.type,
    prompt: draft.prompt.trim(),
    answer: draft.answer.trim(),
    category: draft.category.trim(),
    difficulty: draft.difficulty,
  };

  if (draft.type === "WORD_SCRAMBLE") return base;
  return { ...base, choices: (draft.choices ?? []).map((c) => c.trim()) };
}
