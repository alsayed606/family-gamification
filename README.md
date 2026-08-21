# 🎮 مركز الألعاب العائلي

> منصّة ألعاب لمركز واحد: مدير واحد، عدة عائلات وأصدقاء، وواجهة عربية RTL.

**المرحلة الحالية:** المرحلة 2 — بنك أسئلة مشترك تقرأ منه الألعاب، فوق
مصادقة وأدوار من المرحلة 1. الألعاب في وضع **free play** بلا نقاط رسمية.
راجع `docs/PHASE-0.md` قبل أي تشغيل.

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
│   ├── screens/                  # Login · Register · Verify · Reset · Hub ·
│   │                             #   Account · Admin · QuestionBank · Suspended
│   ├── components/               # Field · Banner · QuestionForm · Spinner …
│   ├── hooks/                    # useProfiles · useActiveProfile · useUsers ·
│   │                             #   useQuestions
│   ├── lib/                      # firebase · questions · arabic · admin …
│   ├── games/
│   │   ├── arabic-word-challenge/  # 674 كلمة مدمجة (بنك خاص بها)
│   │   └── family-quiz/            # تقرأ من بنك الأسئلة المشترك
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
npm test          # 101 اختبار وحدة (منطق خالص، سريع)
npm run rules:test # 80 اختبار لقواعد Firestore على المحاكي
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
| العضو يقترح سؤالًا ولا ينشره | `status == 'DRAFT'` عند الإنشاء |
| لا سؤال بلا إجابة صحيحة ضمن خياراته | `answer in choices` |

**الفرض على الخادم لا في المتصفح.** حرّاس المسارات في React تجربة استخدام
فقط؛ قواعد Firestore هي ما يمنع الوصول فعلًا.

> ⚠️ **الإجابة في بنك الأسئلة مقروءة من المتصفح** — قواعد Firestore على
> مستوى المستند لا الحقل. البنك للّعب الحرّ ولا يقاوم الغش؛ إخفاء الإجابة
> يتطلّب خادمًا. التفاصيل في `docs/PHASE-2.md`.

**المدير الأول** يُعيَّن يدويًا مرة واحدة من Firebase Console —
راجع `docs/ADMIN.md`.

---

## 🎲 إضافة لعبة جديدة

1. أنشئ `src/games/<اسم-اللعبة>/App.tsx` يُصدّر مكوّنًا افتراضيًا.
2. أضف مسارًا كسولًا في `src/app/router.tsx` (انظر `src/screens/GameRoute.tsx`).
3. سجّلها في `src/lib/games.ts`.

**إن احتاجت اللعبة أسئلة، اقرأ من البنك المشترك** بدل أن تحمل نسختها:

```ts
import { fetchPublishedQuestions } from "../../lib/questions";
```

انظر `src/games/family-quiz/` نموذجًا، و`docs/PHASE-2.md` للحالات الثلاث
التي يجب أن تعالجها (بنك فارغ، قرعة أقصر من الجولات، الأنواع الثلاثة).

> ⚠️ لا تضع `@import` لخطوط خارجية داخل CSS اللعبة: فيت يسبق تحميل CSS
> الحزم الكسولة وينتظره، فيُسقط فشلُ الخطوط مسارَ اللعبة كاملًا. حمّلها
> من المكوّن كما في `src/games/arabic-word-challenge/App.tsx`.

---

## 📖 التوثيق

| الملف | المحتوى |
|---|---|
| `docs/PHASE-0.md` | الإجراءات الأمنية المطلوبة منك |
| `docs/PHASE-2.md` | بنك الأسئلة: نموذج المراجعة وقيد انكشاف الإجابة |
| `docs/ADMIN.md` | الأدوار وتعيين المدير الأول |
| `docs/SETUP.md` | خطوات الإعداد التفصيلية |
| `docs/DEPLOY.md` | النشر على GitHub Pages عبر Actions |
| `config/firebase-config.md` | نموذج البيانات وإعداد المشروع |
