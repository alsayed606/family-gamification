# 🎮 مركز الألعاب العائلي

> منصّة ألعاب لمركز واحد: مدير واحد، عدة عائلات وأصدقاء، وواجهة عربية RTL.

**المرحلة الحالية:** المرحلة 1 — مصادقة حقيقية وأدوار وألعاب في وضع
**free play** (بلا نقاط رسمية). راجع `docs/PHASE-0.md` قبل أي تشغيل.

---

## 📦 الهيكل

تطبيق **React + Vite + TypeScript** واحد. كل لعبة مجلد داخل `src/games/`
يُحمَّل كسولًا عند فتحه فقط، فلا يُثقل أول تحميل.

```
family-gamification/
├── index.html                    # نقطة دخول Vite
├── firebase.json                 # إعداد المحاكيات (Auth + Firestore)
├── src/
│   ├── main.tsx
│   ├── app/router.tsx            # HashRouter + الحرّاس
│   ├── auth/                     # AuthProvider · useAuth · guards · actions
│   ├── screens/                  # Login · Register · Verify · Reset ·
│   │                             #   Hub · Account · Admin · Suspended
│   ├── components/               # Field · Banner · AvatarPicker · Spinner …
│   ├── hooks/                    # useProfiles · useActiveProfile · useUsers
│   ├── lib/                      # firebase · validation · authErrors · admin …
│   ├── games/
│   │   └── arabic-word-challenge/  # لعبة كاملة (674 كلمة، 15 مجالاً)
│   └── styles/global.css
├── config/
│   ├── firestore.rules           # الحدّ الأمني الحقيقي
│   └── firestore.indexes.json
├── tests/
│   ├── unit/                     # منطق خالص (بلا محاكي)
│   └── rules/                    # قواعد الأمان (مع المحاكي)
└── docs/                         # PHASE-0 · ADMIN · SETUP …
```

---

## 🚀 التشغيل

```bash
npm install

# تطوير على المحاكيات — لا يحتاج مشروع Firebase حقيقي
cp .env.example .env.local        # واترك VITE_USE_EMULATOR=true
npm run emulator                  # طرفية أولى
npm run dev                       # طرفية ثانية → http://localhost:5173
```

للتشغيل على مشروع Firebase حقيقي: املأ `VITE_FIREBASE_*` في `.env.local`
واضبط `VITE_USE_EMULATOR=false` — راجع `config/firebase-config.md`.

---

## 🧪 الاختبارات

```bash
npm test          # 62 اختبار وحدة (منطق خالص، سريع)
npm run rules:test # 40 اختبار لقواعد Firestore على المحاكي
npm run test:all   # الاثنان معًا
npm run typecheck  # tsc بلا أخطاء
```

اختبارات القواعد **أغلبها سلبي** عمدًا: تثبت ما لا يُسمح به، لا ما يُسمح.
وقد جرى التحقق منها بإضعاف القواعد عمدًا للتأكد أنها تكشف الثغرات فعلًا.

---

## 🔐 الأمان

| الثابت | المكان |
|---|---|
| العضو لا يقرأ ولا يسرد بيانات غيره | `config/firestore.rules` |
| لا مسار للترقّي الذاتي إلى `admin` | القاعدة تثبّت الدور عند الإنشاء |
| المدير لا يعدّل دور نفسه (وقاية من قفل النظام) | `userId != request.auth.uid` |
| مستندات المستخدمين غير قابلة للحذف | `allow delete: if false` |
| ملف الابن بيانات عرض بحتة، بلا أي سلطة | `!('role' in …)` |

**الفرض على الخادم لا في المتصفح.** حرّاس المسارات في React تجربة استخدام
فقط؛ قواعد Firestore هي ما يمنع الوصول فعلًا.

**المدير الأول** يُعيَّن يدويًا مرة واحدة من Firebase Console —
راجع `docs/ADMIN.md`.

---

## 🎲 إضافة لعبة جديدة

1. أنشئ `src/games/<اسم-اللعبة>/App.tsx` يُصدّر مكوّنًا افتراضيًا.
2. أضف مسارًا كسولًا في `src/app/router.tsx` (انظر `src/screens/GameRoute.tsx`).
3. سجّلها في `src/lib/games.ts`.

> إن احتاجت اللعبة بنك أسئلة، اجعله في `src/games/<اللعبة>/data/` أو في
> مجموعة Firestore مستقلة، بحيث تعيد لعبة أخرى استخدامه بدل تكراره.
>
> ⚠️ لا تضع `@import` لخطوط خارجية داخل CSS اللعبة: فيت يسبق تحميل CSS
> الحزم الكسولة وينتظره، فيُسقط فشلُ الخطوط مسارَ اللعبة كاملًا. حمّلها
> من المكوّن كما في `src/games/arabic-word-challenge/App.tsx`.

---

## 📖 التوثيق

| الملف | المحتوى |
|---|---|
| `docs/PHASE-0.md` | الإجراءات الأمنية المطلوبة منك |
| `docs/ADMIN.md` | الأدوار وتعيين المدير الأول |
| `docs/SETUP.md` | خطوات الإعداد التفصيلية |
| `docs/DEPLOY.md` | النشر على GitHub Pages عبر Actions |
| `config/firebase-config.md` | نموذج البيانات وإعداد المشروع |
