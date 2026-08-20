# 📱 رفع المشروع على GitHub

## الخطوة 1️⃣: إنشاء Repository جديد

1. اذهب إلى **[github.com/new](https://github.com/new)**
2. أدخل المعلومات:
   - **Repository name:** `family-gamification`
   - **Description:** `نظام العائلة التفاعلي للإجازات 🎮`
3. اختر **Public** (مهم لـ GitHub Pages)
4. **لا تضيف** README (عندك واحد بالفعل)
5. اضغط **Create repository**

---

## الخطوة 2️⃣: رفع الملفات

### الطريقة السهلة (بدون Terminal):

1. في صفحة الـ Repository → اضغط **Add file** → **Upload files**
2. اسحب المجلد `family-gamification/` كاملاً
   أو اختر الملفات والمجلدات:
   ```
   ✅ src/
   ✅ config/
   ✅ docs/
   ✅ tests/
   ✅ README.md
   ```
3. في **Commit message** اكتب:
   ```
   Initial commit: Family Gamification System
   ```
4. اضغط **Commit changes**

### الطريقة المحترفة (Terminal):

```bash
# 1. انسخ الملفات
git clone https://github.com/YOUR_USERNAME/family-gamification.git
cd family-gamification

# 2. أضف جميع الملفات
git add .

# 3. Commit
git commit -m "Initial commit: Family Gamification System"

# 4. Push
git branch -M main
git push -u origin main
```

---

## الخطوة 3️⃣: فعّل GitHub Pages

1. في Repository → **Settings** (الجانب الأيسر)
2. اختر **Pages**
3. تحت **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
4. اضغط **Save**
5. انتظر 1-2 دقيقة ستظهر رسالة نجاح:
   ```
   ✅ Your site is live at:
   https://YOUR_USERNAME.github.io/family-gamification
   ```

---

## الخطوة 4️⃣: افتح التطبيق

الآن تستطيع الوصول من أي مكان:

> ⚠️ مسار النشر تغيّر: التطبيق صار يُبنى إلى `dist/`، ولم يعد يُخدَم
> من `src/html/`. تُضبط الاستضافة في الخطوة 8.

---

## 🚀 تحديثات مستقبلية

### دوافع التغيير بسهولة:

```bash
# 1. عدّل الملفات محليًا
nano src/screens/Hub.tsx

# 2. Commit والـ push
git add .
git commit -m "Feature: Add X"
git push

# 3. تحدّث تلقائيًا على GitHub Pages خلال 30 ثانية
```

---

## 🔐 أمان

> ⚠️ **حُذف القسم السابق في المرحلة 0.** كان يشرح كيف "تغيّر رمز الإدارة"
> بتعديل ثابت في الكود المصدري ثم رفعه — وهذه ليست حماية أصلًا: أي رمز
> في مستودع عام مكشوف للجميع فور رفعه، ويبقى في تاريخ git حتى بعد تغييره.

**القاعدة:** لا تضع أي رمز أو كلمة مرور في الكود المصدري، مهما كان "قويًّا".
الأسرار تُدار عبر متغيّرات بيئة على الخادم، والصلاحيات تُفرض في قواعد
Firestore وعلى الخادم — لا في المتصفح.

راجع `docs/PHASE-0.md` للإجراءات المطلوبة.

---

## ✅ التحقق من الإعداد

بعد الرفع:

1. ✅ افتح الـ repo → **Settings** → **Pages** يظهر الرابط الأخضر
2. ✅ افتح التطبيق في المتصفح — يجب أن يظهر الـ Hub
3. ✅ تأكد أن قواعد Firestore منشورة ومغلقة (`config/firestore.rules`)

---

## 🐛 مشاكل شائعة

### "GitHub Pages ما يظهر"

✅ الحل:
1. تأكد من Repository **Public**
2. انتظر 2-3 دقائق
3. اضغط F5 refresh
4. افتح في Incognito Window

### "404 Not Found"

✅ الحل: راجع إعداد النشر في الخطوة 8 — التطبيق يُبنى إلى `dist/`.

### "الملفات ما اتحمّلت"

✅ الحل:
1. تحقق من اسم المستخدم والـ repo
2. تأكد من `main` branch
3. جرّب `git push` مرة أخرى

---

## 📚 الروابط المهمة

| الرابط | الغرض |
|--------|--------|
| `https://github.com/new` | إنشاء repo جديد |
| `https://github.com/YOUR_USERNAME` | ملفك الشخصي |
| `https://YOUR_USERNAME.github.io/family-gamification` | التطبيق Live |

---

**✨ تمام! مشروعك على الإنترنت الآن!**

يمكنك الآن:
- مشاركة الرابط مع العائلة
- التطوير المستمر
- إضافة ميزات جديدة
