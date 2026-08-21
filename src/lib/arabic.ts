// أدوات نصية عربية: التحقق، التطبيع، وخلط الحروف.
//
// مشتركة بين الألعاب عمدًا. كانت داخل لعبة الكلمات، ونُقلت هنا حين
// احتاجتها مسابقة العائلة: نسختان من دالة تطبيع تعنيان أن اللعبتين
// تختلفان يومًا في تقييم الإجابة نفسها.

/** يقبل الحروف العربية والمسافات فقط. */
export const AR_ONLY = /^[ء-ي\s]+$/;

/** عدد الحروف العربية الفعلية في النص (بلا مسافات أو تشكيل). */
export function countLetters(w: string): number {
  return (w.match(/[ء-ي]/g) || []).length;
}

/**
 * تطبيع نص عربي للمقارنة: حذف التشكيل والتطويل، وتوحيد الألف والياء
 * والتاء المربوطة والهمزات، وحذف الهمزة المفردة والمسافات الزائدة.
 */
export function normalize(s: string | null | undefined): string {
  return (s || "")
    .replace(/[ً-ْـٰ]/g, "") // تشكيل + تطويل
    .replace(/[أإآٱ]/g, "ا") // أ إ آ ٱ -> ا
    .replace(/ى/g, "ي") // ى -> ي
    .replace(/ة/g, "ه") // ة -> ه
    .replace(/ؤ/g, "و") // ؤ -> و
    .replace(/ئ/g, "ي") // ئ -> ي
    .replace(/ء/g, "") // همزة مفردة
    .replace(/\s+/g, "")
    .trim();
}

/**
 * يخلط حروف الكلمة عشوائياً (Fisher–Yates) مع ضمان ألا تخرج بنفس ترتيبها
 * الأصلي — يحاول حتى 12 مرة ثم يعكس الترتيب كحل أخير.
 */
export function shuffleLetters(word: string): string[] {
  const src = word.split("");
  for (let attempt = 0; attempt < 12; attempt++) {
    const a = [...src];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // i و j داخل المدى دائمًا (0 <= j <= i < a.length)، لكن
      // noUncheckedIndexedAccess لا يستطيع إثبات ذلك.
      const swap = a[i]!;
      a[i] = a[j]!;
      a[j] = swap;
    }
    if (a.join("") !== word) return a;
  }
  return src.reverse();
}
