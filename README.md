# 🎮 نظام العائلة التفاعلي للإجازات
**Family Gamification System — Summer 2026**

> تطبيق ويب متكامل للعائلة مع نقاط ومستويات ومهام وألعاب واقعية ومتجر مكافآت  
> **كل شيء Realtime من Firebase!**

---

## 📦 هيكل المشروع

```
family-gamification/
├── src/
│   ├── html/
│   │   └── index.html           # الهيكل الرئيسي
│   ├── js/
│   │   ├── app.js               # Controller رئيسي
│   │   ├── firebase-config.js    # Firebase SDK + CRUD
│   │   ├── auth.js              # الجلسة والتسجيل
│   │   ├── login.js             # شاشة الدخول + PIN
│   │   ├── screens.js           # الشاشات (Dashboard, Tasks, etc)
│   │   └── ui-utils.js          # مساعدات UI
│   └── css/
│       └── style.css            # Dark Gaming UI
├── data/
│   └── seed.html                # إنشاء البيانات الأولية
├── config/
│   ├── firestore.rules          # قواعس أمان Firebase
│   └── firebase-config.md       # توثيق الإعدادات
├── docs/
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

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر `marine-command-center`
3. **Firestore Database** → **Create**
4. **Rules** → انسخ محتوى `config/firestore.rules`
5. **Publish**

### 3️⃣ إنشاء البيانات الأولية

افتح: `http://localhost:8000/data/seed.html`
اضغط **إنشاء البيانات الآن**

### 4️⃣ شغّل التطبيق

افتح: `http://localhost:8000/src/html/`

---

## 🔑 بيانات الدخول

| الاسم | Emoji | PIN | الدور |
|-------|-------|-----|--------|
| الأب | 👨 | — | Admin |
| الأم | 👩 | — | User |
| سارة | 👧 | 1111 | User |
| خالد | 👦 | 2222 | User |

**رمز الإدارة:** `1234` ← غيّره في `src/js/auth.js`

---

## 📋 المميزات الحالية

✅ نظام دخول (PIN + بدون PIN)
✅ Dashboard (مستوى، XP، كوينز، جواهر)
✅ المهام مع Confetti + Notifications
✅ لوحة ترتيب Realtime
✅ لوحة إدارة (إضافة أفراد ومهام)
✅ Dark Gaming UI (نيون + توهج)
✅ Mobile-first + RTL كامل

---

## 🛠️ التطوير

### إضافة ميزة جديدة

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
