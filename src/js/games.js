// ============================================================
//  games.js
//  سجلّ الألعاب المتاحة في النظام (Game Hub)
//
//  كل لعبة إما:
//   - "internal": شاشة داخل نفس تطبيق Vanilla JS (تُفتح عبر switchView)
//   - "external": مشروع مستقل (games/<name>/) يُبنى بـ Vite ويُفتح في تبويب جديد
// ============================================================

export const GAMES = [
  {
    id: "tasks",
    kind: "internal",
    view: "dashboard",
    name: "المهام والمكافآت",
    icon: "🎯",
    desc: "أنجز مهامك اليومية، اكسب XP وكوينز، وتصدّر لوحة الترتيب.",
  },
  {
    id: "arabic-word-challenge",
    kind: "external",
    // بعد تشغيل: npm run awc:build (من جذر المستودع)
    url: "../../games/arabic-word-challenge/dist/index.html",
    name: "تحدي الكلمات العربية",
    icon: "🔤",
    desc: "فريقان، حروف مبعثرة، وجرس — من يستخرج الكلمة أولاً؟",
  },
];
