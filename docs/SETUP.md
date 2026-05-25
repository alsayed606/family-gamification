# 📋 خطوات الإعداد الكاملة

## الخطوة 1: الإعداد المحلي

### تثبيت البرامج المطلوبة
- **Git:** [git-scm.com](https://git-scm.com/)
- **Node.js:** [nodejs.org](https://nodejs.org/) (اختياري)
- **Python:** [python.org](https://python.org/) (للـ local server)

### استنساخ المشروع

```bash
git clone https://github.com/YOUR_USERNAME/family-gamification.git
cd family-gamification
```

### تشغيل local server

**باستخدام Python:**
```bash
python -m http.server 8000
# افتح: http://localhost:8000/src/html/
```

**أو باستخدام Node.js:**
```bash
npx http-server
# افتح: http://localhost:8080/src/html/
```

---

## الخطوة 2: إعداد Firebase

### أ) تفعيل Firestore

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر project `marine-command-center`
3. اذهب إلى **Firestore Database**
4. اضغط **Create Database**
5. اختر:
   - **Start in Production Mode**
   - Region: `asia-southeast1`
6. اضغط **Create**

### ب) تحديث Rules

1. في Firestore → تبويب **Rules**
2. احذف القواعس الافتراضية
3. انسخ محتوى `config/firestore.rules`
4. اضغط **Publish**

---

## الخطوة 3: إنشاء البيانات الأولية

1. افتح: `http://localhost:8000/data/seed.html`
2. اضغط **إنشاء البيانات الآن**
3. انتظر الرسائل الخضراء ✅

**البيانات التي ستُنشأ:**
- الأب (👨) - بدون PIN
- الأم (👩) - بدون PIN
- سارة (👧) - PIN: 1111
- خالد (👦) - PIN: 2222

---

## الخطوة 4: شغّل التطبيق

افتح في المتصفح:
```
http://localhost:8000/src/html/
```

---

## الخطوة 5: غيّر الرمز السري

**مهم جداً!**

1. افتح `src/js/auth.js`
2. ابحث عن:
   ```javascript
   const ADMIN_PIN = "1234";
   ```
3. غيّره إلى رقم قوي (مثل: `"8473"`)
4. احفظ الملف

---

## 🐛 استكشاف الأخطاء

### "لم تحمّل بطاقات الأفراد"

✅ الحل:
1. تأكد من تشغيل `seed.html`
2. تحقق من Firestore تفعيل
3. افتح F12 → Network → تحقق من الأخطاء

### "خطأ Firebase"

✅ الحل:
1. تأكد من Firestore rules نُشرت
2. تأكد من Database region صحيح
3. جرّب في Private Window

### "PIN غير صحيح"

✅ الحل:
- سارة: `1111`
- خالد: `2222`
- الأب والأم: بدون PIN

---

## 📚 الملفات المهمة

| الملف | الغرض | التعديل |
|------|-------|--------|
| `src/js/auth.js` | PIN والجلسة | ✏️ غيّر ADMIN_PIN |
| `src/js/screens.js` | الشاشات | ✏️ أضف شاشات جديدة |
| `src/css/style.css` | التصميم | ✏️ غيّر الألوان |
| `data/seed.html` | البيانات | ✏️ أضف أفراد |

---

## 🚀 النشر على GitHub Pages

### 1️⃣ أنشئ repository

```
github.com/new
→ family-gamification
→ Public
→ Create
```

### 2️⃣ رفع الملفات

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 3️⃣ فعّل GitHub Pages

- **Settings** → **Pages**
- Branch: `main` / Root
- **Save**

### 4️⃣ افتح التطبيق

```
https://YOUR_USERNAME.github.io/family-gamification/src/html/
```

---

## 💡 نصائح التطوير

### هيكل الملفات يساعدك على:
✅ تنظيم الكود
✅ إعادة استخدام الدوال
✅ تطوير سريع

### عند إضافة ميزة:
1. أكتب الدالة في الملف الصحيح
2. اختبرها محليًا
3. ارفعها على GitHub

### أفضل ممارسات:
```javascript
// ✅ صحيح
async function updateUser(id, data) {
  await updateDocById(COLLECTIONS.users, id, data);
}

// ❌ خطأ
const user = firebase_direct_call(...);
```

---

**تمام! أنت مستعد للتطوير 🚀**
