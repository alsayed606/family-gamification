# 🎮 نظام العائلة التفاعلي للإجازات
**Family Gamification System — Summer 2026**

> تطبيق ويب متكامل للعائلة مع نقاط ومستويات ومهام وألعاب واقعية ومتجر مكافآت  
> **كل شيء Realtime من Firebase!**

---

## 📦 هيكل المشروع

المستودع الآن **Game Hub**: شاشة دخول واحدة تقود إلى شاشة اختيار اللعبة
(`src/js/games.js`)، وكل لعبة تعمل لحالها. لعبة "المهام والمكافآت" داخلية
(Vanilla JS + Firebase، بلا build step)، وبقية الألعاب مشاريع مستقلة تحت
`games/` (مثلاً React + Vite) تُبنى وتُفتح في تبويب جديد.

```
family-gamification/
├── package.json                 # جذر npm workspaces (يجمع مشاريع games/*)
├── src/                         # الـ Hub + لعبة "المهام والمكافآت" (Vanilla JS)
│   ├── html/
│   │   └── index.html           # شاشة الدخول + Game Hub + شاشات اللعبة
│   ├── js/
│   │   ├── app.js               # Controller رئيسي (تسجيل الدخول، التنقل بين الألعاب)
│   │   ├── games.js             # سجلّ الألعاب المعروضة في الـ Hub
│   │   ├── firebase-config.js    # Firebase SDK + CRUD
│   │   ├── auth.js              # الجلسة والتسجيل
│   │   ├── login.js             # شاشة الدخول + PIN
│   │   ├── screens.js           # الشاشات (Hub, Dashboard, Tasks, etc)
│   │   └── ui-utils.js          # مساعدات UI
│   └── css/
│       └── style.css            # Dark Gaming UI
├── games/                       # ألعاب إضافية، كل واحدة مشروع مستقل
│   └── arabic-word-challenge/   # React + Vite + TypeScript + Tailwind
│       ├── src/                 #   screens/ · hooks/ · lib/ · data/words.ts
│       ├── tests/                #   Vitest
│       └── dist/                #   ناتج البناء — يُرفع لـ git عمداً (راجع تشغيل الألعاب أدناه)
├── config/
│   ├── firestore.rules          # قواعد أمان Firebase (رفض شامل حاليًا)
│   └── firebase-config.md       # توثيق الإعدادات
├── docs/
│   ├── PHASE-0.md               # ⚠️ إجراءات أمنية مطلوبة — اقرأه أولًا
│   ├── README-AR.md             # دليل عربي
│   ├── SETUP.md                 # خطوات الإعداد
│   └── GITHUB-UPLOAD.md         # رفع على GitHub
└── README.md                    # هذا الملف
```

---

## 🚀 البدء السريع

### 1️⃣ الإعداد المحلي

```bash
cd family-gamification
python -m http.server 8000
# افتح: http://localhost:8000/src/html/
```

### 2️⃣ إعداد Firebase

يعمل المشروع على **مشروع Firebase مخصّص** — راجع `config/firebase-config.md`.
أنشئ `src/js/firebase-config.local.js` بإعدادات مشروعك (الملف مستثنى من git)،
ثم انشر `config/firestore.rules`.

### 3️⃣ شغّل التطبيق

افتح: `http://localhost:8000/src/html/`

---

## 🔑 الدخول

نظام الدخول القديم (اختيار شخصية + PIN مخزّن كنص صريح) **أُلغي في المرحلة 0**،
ولا توجد بيانات دخول تجريبية. يُبنى نظام المصادقة الحقيقي في المرحلة 1 على
Firebase Authentication — راجع `docs/PHASE-0.md`.

---

## 📋 حالة المميزات

| الميزة | الحالة |
|---|---|
| Game Hub لاختيار اللعبة | ✅ يعمل |
| لعبة "تحدي الكلمات العربية" (بنك 674 كلمة) | ✅ تعمل بلا خادم (free play) |
| Dark Gaming UI + RTL + Mobile-first | ✅ يعمل |
| Dashboard / مهام / لوحة ترتيب / لوحة إدارة | ⏸️ معطّلة — تنتظر مصادقة المرحلة 1 |
| المصادقة والأدوار | ⏳ المرحلة 1 (Firebase Auth) |
| نقاط بسلطة الخادم + دفتر غير قابل للتعديل | ⏳ المرحلة 1 |

---

## 🎮 تشغيل الألعاب

### لعبة "المهام والمكافآت" (داخلية، بلا build)

```bash
npm run hub
# افتح: http://localhost:8000/src/html/
```

### لعبة "تحدي الكلمات العربية" (React + Vite)

```bash
npm install                 # مرة واحدة من جذر المستودع (يثبّت كل الألعاب عبر workspaces)
npm run awc:dev              # تطوير مباشر مع Hot Reload
npm run awc:test             # Vitest
npm run awc:build            # يبني إلى games/arabic-word-challenge/dist/
```

**مهم:** الاستضافة (GitHub Pages) تخدم ملفات المستودع كما هي بلا خطوة بناء،
لذا `games/*/dist/` **مرفوعة على git عمداً** (راجع `.gitignore`). بعد أي
تعديل على لعبة React، شغّل `npm run awc:build` وارفع نتيجة `dist/` الجديدة
ضمن نفس الـ commit — وإلا سيبقى Hub يفتح نسخة قديمة من اللعبة.

---

## 🛠️ التطوير

### إضافة ميزة داخل لعبة "المهام والمكافآت"

1. أنشئ دالة في `src/js/screens.js`
2. اربطها في `src/js/app.js`
3. أضف styling في `src/css/style.css`

### مثال: إضافة قسم "Events"

```javascript
// في screens.js
export function renderEvents(el, user) {
  el.innerHTML = `<div>الأحداث</div>`;
}

// في app.js
else if (name === "events") renderEvents(el, State.me);
```

### إضافة لعبة جديدة إلى Hub

1. أنشئ مشروعها تحت `games/<اسم-اللعبة>/` (أي stack تفضّله — لا يلزم React).
2. سجّلها في `src/js/games.js` ضمن `GAMES`:
   ```javascript
   { id: "my-game", kind: "external", url: "../../games/my-game/dist/index.html",
     name: "اسم اللعبة", icon: "🎲", desc: "وصف قصير." }
   ```
   أو `kind: "internal"` إن كانت شاشة داخل نفس تطبيق الـ Hub (مثل "tasks").
3. إن احتاجت بنك أسئلة، اجعله في مصدر بيانات مستقل (ملف JSON/TS أو مجموعة
   Firestore بادئتها `fam_`) بحيث تقدر أي لعبة أخرى تعيد استخدامه لاحقاً بدل
   تكراره داخل كل لعبة.

---

## 📁 ملفات مهمة

| الملف | الغرض |
|------|-------|
| `src/js/firebase-config.js` | كل دوال Firebase (CRUD + Realtime) |
| `src/js/auth.js` | الجلسة والـ PIN |
| `src/js/screens.js` | رسم جميع الشاشات |
| `config/firestore.rules` | أمان قاعدة البيانات |

---

## 🔐 الأمان

✅ مجموعات `fam_*` محمية فقط
✅ PIN في localStorage
✅ Realtime updates آمنة

⚠️ لحماية أفضل: فعّل Firebase Anonymous Auth

---

## 📖 التوثيق

- `docs/README-AR.md` - دليل عربي شامل
- `docs/SETUP.md` - خطوات التطوير
- `docs/GITHUB-UPLOAD.md` - رفع على GitHub

---

## 🚀 رفع على GitHub

```bash
git init
git add .
git commit -m "Initial commit: Family Gamification System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/family-gamification.git
git push -u origin main
```

ثم فعّل GitHub Pages:
- **Settings** → **Pages** → Branch: `main` → Save

---

**بُني بـ ❤️ من قبل Abdullah**

*نظام عائلي تفاعلي حقيقي — ليس بروتوتايب.*
