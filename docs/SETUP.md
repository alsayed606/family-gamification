# 📋 خطوات الإعداد

> ⚠️ **اقرأ `docs/PHASE-0.md` أولًا.** أُلغي في المرحلة 0 نظام الدخول القديم
> (اختيار شخصية + PIN)، وفُصل المشروع عن مشروع Firebase المشترك. لا توجد
> بيانات دخول تجريبية، ولوحة المهام معطّلة حتى تُبنى المصادقة في المرحلة 1.
>
> ما يعمل الآن بلا إعداد: **لعبة تحدي الكلمات العربية** (تعمل محليًا بلا خادم).

---

## المتطلبات

- **Git** — [git-scm.com](https://git-scm.com/)
- **Node.js 20+** — [nodejs.org](https://nodejs.org/) (للعبة الكلمات)
- **Python 3** — لتشغيل خادم محلي بسيط

---

## 1. استنساخ المشروع

```bash
git clone https://github.com/alsayed606/family-gamification.git
cd family-gamification
npm install
```

---

## 2. التشغيل على المحاكيات (لا يحتاج مشروع Firebase)

```bash
cp .env.example .env.local   # اترك VITE_USE_EMULATOR=true
npm run emulator             # طرفية أولى — Auth + Firestore
npm run dev                  # طرفية ثانية → http://localhost:5173
```

الـ Hub يعرض الألعاب المسجّلة في `src/lib/games.ts`، واللعبة مسار كسول
لا يحتاج بناءً منفصلًا.

```bash
npm test            # 62 اختبار وحدة
npm run rules:test  # 40 اختبار قواعد على المحاكي
```

---

## 3. التشغيل على مشروع Firebase حقيقي

1. أنشئ **مشروع Firebase مخصّصًا** — لا تستخدم مشروعًا مشتركًا مع أي عمل آخر.
2. أضف تطبيق ويب وانسخ الإعدادات إلى `.env.local` (مستثنى من git — الصيغة في `.env.example`).
3. فعّل **Firestore Database**.
4. **Rules** → انسخ `config/firestore.rules` → **Publish**.

> القواعد الحالية ترفض كل قراءة وكتابة عمدًا. هذا هو السلوك الصحيح قبل وجود
> مصادقة: ما لا يمكن التحقق منه لا يُسمح به.

---

## 4. النشر

يبني GitHub Actions التطبيق وينشره تلقائيًا على GitHub Pages عند كل دفعة
إلى `main`. الإعداد لمرة واحدة موصوف في **`docs/DEPLOY.md`**.

---

## 🐛 استكشاف الأخطاء

**"لم تُضبط إعدادات Firebase"**
لم تُنشئ `.env.local`. انسخه من `.env.example` وشغّل المحاكيات.

**«جارٍ التحقق من الجلسة» لا تنتهي**
تأكّد أن محاكي Auth يعمل على 9099 ومحاكي Firestore على 8080.

**اللعبة لا تُفتح**
تأكّد أن `npm run dev` يعمل. اللعبة مسار كسول داخل التطبيق ولا تحتاج بناءً منفصلًا.

---

## 📚 الملفات المهمة

| الملف | الغرض |
|---|---|
| `docs/PHASE-0.md` | الإجراءات الأمنية المطلوبة منك |
| `docs/DEPLOY.md` | النشر وإعداده |
| `config/firestore.rules` | قواعد الأمان |
| `config/firebase-config.md` | نموذج البيانات والإعدادات |
| `src/lib/games.ts` | سجلّ الألعاب في الـ Hub |
| `src/games/arabic-word-challenge/` | لعبة الكلمات (مسار كسول) |
