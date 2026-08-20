// سجلّ الألعاب المعروضة في الـ Hub.
//
// يبقى في الكود لا في Firestore: بلعبتين، مستند قاعدة بيانات يضيف تعقيدًا
// بلا مقابل. يُنقل إلى Firestore حين يحتاج المدير إلى إضافة ألعاب دون نشر.

export type Game = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  /** مسار داخل التطبيق (لعبة مدمجة) أو رابط خارجي. */
  to: string;
  external?: boolean;
  /** معطّلة مؤقتًا مع سبب يُعرض للمستخدم. */
  disabledReason?: string;
};

export const GAMES: Game[] = [
  {
    id: "arabic-word-challenge",
    name: "تحدي الكلمات العربية",
    icon: "🔤",
    desc: "فريقان، حروف مبعثرة، وجرس — من يستخرج الكلمة أولاً؟",
    to: "/games/arabic-word-challenge",
  },
  {
    id: "tasks",
    name: "المهام والمكافآت",
    icon: "🎯",
    desc: "أنجز مهامك اليومية، اكسب نقاط الخبرة، وتصدّر لوحة الترتيب.",
    to: "/tasks",
    disabledReason: "تحتاج نقاطًا بسلطة الخادم — مؤجّلة",
  },
];
