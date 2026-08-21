export type Role = "admin" | "member";
export type AccountStatus = "ACTIVE" | "SUSPENDED";

export type AgeBand = "UNDER_6" | "6_8" | "9_12" | "13_15" | "16_PLUS";

export const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: "UNDER_6", label: "أقل من 6" },
  { value: "6_8", label: "6 – 8" },
  { value: "9_12", label: "9 – 12" },
  { value: "13_15", label: "13 – 15" },
  { value: "16_PLUS", label: "16 فأكثر" },
];

/** مستند users/{uid} — يطابق ما تفرضه config/firestore.rules. */
export type UserDoc = {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
  role: Role;
  status: AccountStatus;
};

/**
 * مستند users/{uid}/profiles/{id} — ملف ابن.
 *
 * بيانات عرض بحتة: لا يحمل role ولا status، والقواعد ترفضهما عند الكتابة.
 * تبديل الملف النشط يحدث في المتصفح، فلا يصلح حدًّا أمنيًا بحال.
 */
export type ChildProfile = {
  id: string;
  displayName: string;
  avatar: string;
  ageBand?: AgeBand;
};

// ============================================================
//  بنك الأسئلة المشترك
//
//  ⚠️ الإجابة مقروءة من المتصفح — ولا مفرّ من ذلك بلا خادم.
//  قواعد Firestore تعمل على مستوى المستند لا الحقل: من يقرأ السؤال
//  يقرأ حقل answer معه. إخفاؤها يتطلب Cloud Function تقدّم السؤال
//  بلا إجابته، وذلك يتطلب خطة Blaze.
//
//  النتيجة: البنك صالح لوضع free play، وليس مقاومًا للغش. لا تُبنَ
//  عليه نقاط رسمية قبل وجود خادم.
// ============================================================

export type QuestionType = "MCQ" | "TRUE_FALSE" | "WORD_SCRAMBLE";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionStatus = "DRAFT" | "PUBLISHED";

/** خياران ثابتان لأسئلة الصح والخطأ — يُفرضان في القواعد أيضًا. */
export const TRUE_FALSE_CHOICES = ["صح", "خطأ"] as const;

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "MCQ", label: "اختيار من متعدد" },
  { value: "TRUE_FALSE", label: "صح أو خطأ" },
  { value: "WORD_SCRAMBLE", label: "كلمة مبعثرة" },
];

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "سهل" },
  { value: "MEDIUM", label: "متوسط" },
  { value: "HARD", label: "صعب" },
];

/**
 * مستند questions/{id}.
 *
 * ── لماذا الإجابة نصّ لا فهرس ──
 * الفهرس يفسد بمجرد إعادة ترتيب الخيارات، ولا يمكن للقواعد التحقق منه
 * إلا بحساب الطول. النصّ يجعل الثابت قابلًا للفرض في سطر واحد:
 * answer ∈ choices.
 *
 * ── لماذا TRUE_FALSE نوع لا شكل خاص ──
 * هو اختيار من متعدد بخيارين مثبَّتين. توحيد شكل الإجابة يعني مسار
 * تحقّق واحدًا في القواعد، ومحرّرًا واحدًا، وعارضًا واحدًا.
 */
export type Question = {
  id: string;
  type: QuestionType;
  /** نصّ السؤال. في الكلمة المبعثرة: تلميح أو تعريف. */
  prompt: string;
  /** الخيارات — لأنواع الاختيار فقط. الكلمة المبعثرة بلا خيارات. */
  choices?: string[];
  /** الإجابة الصحيحة. لأنواع الاختيار يجب أن تكون أحد الخيارات. */
  answer: string;
  category: string;
  difficulty: Difficulty;
  status: QuestionStatus;
  /** uid المُنشئ — يثبت عند الإنشاء ولا يتغيّر. */
  createdBy: string;
};

/** ما يكتبه العميل عند الإنشاء: بلا id (يولّده Firestore) وبلا createdBy. */
export type QuestionDraft = Omit<Question, "id" | "status" | "createdBy">;

export const MAX_PROMPT = 300;
export const MAX_ANSWER = 120;
export const MAX_CATEGORY = 40;
export const MAX_CHOICES = 6;
export const MIN_CHOICES = 2;
