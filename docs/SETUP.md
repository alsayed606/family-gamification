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

## 2. تشغيل لعبة الكلمات (لا تحتاج Firebase)

```bash
npm run awc:dev     # وضع التطوير
npm run awc:test    # 30 اختبار Vitest
npm run awc:build   # بناء الإنتاج إلى games/arabic-word-challenge/dist/
```

---

## 3. تشغيل الواجهة الرئيسية (Hub)

```bash
python3 -m http.server 8000
# افتح: http://localhost:8000/src/html/
```

الـ Hub يعرض الألعاب المسجّلة في `src/js/games.js`. لعبة الكلمات تعمل بعد
`npm run awc:build`.

---

## 4. إعداد Firebase (اختياري في المرحلة 0)

الشاشات المعتمدة على Firestore (المهام، لوحة الترتيب، الإدارة) معطّلة حاليًا
لأن قواعد الأمان تمنع كل وصول حتى تُبنى المصادقة.

إذا أردت تجهيز المشروع للمرحلة 1:

1. أنشئ **مشروع Firebase مخصّصًا** — لا تستخدم مشروعًا مشتركًا مع أي عمل آخر.
2. أضف تطبيق ويب وانسخ الإعدادات إلى `src/js/firebase-config.local.js`
   (مستثنى من git — الصيغة في `config/firebase-config.md`).
3. فعّل **Firestore Database**.
4. **Rules** → انسخ `config/firestore.rules` → **Publish**.

> القواعد الحالية ترفض كل قراءة وكتابة عمدًا. هذا هو السلوك الصحيح قبل وجود
> مصادقة: ما لا يمكن التحقق منه لا يُسمح به.

---

## 5. النشر على GitHub Pages

- **Settings** → **Pages** → Branch: `main` / `(root)` → **Save**
- الرابط: `https://<USERNAME>.github.io/family-gamification/src/html/`

> GitHub Pages تخدم ملفات ثابتة فقط. المرحلة 1 تتطلب Cloud Functions،
> ولذلك ستنتقل الاستضافة إلى Firebase Hosting أو Vercel.

---

## 🐛 استكشاف الأخطاء

**"لم تُضبط إعدادات Firebase بعد"**
لم تُنشئ `src/js/firebase-config.local.js`. هذا متوقّع في المرحلة 0 —
لعبة الكلمات تعمل بدونه.

**بطاقات الأفراد لا تظهر / الشاشات فارغة**
متوقّع: قواعد Firestore ترفض كل وصول حتى المرحلة 1.

**لعبة الكلمات تعطي 404 من الـ Hub**
شغّل `npm run awc:build` — الـ Hub يفتح `dist/index.html`.

---

## 📚 الملفات المهمة

| الملف | الغرض |
|---|---|
| `docs/PHASE-0.md` | الإجراءات الأمنية المطلوبة منك |
| `config/firestore.rules` | قواعد الأمان |
| `config/firebase-config.md` | نموذج البيانات والإعدادات |
| `src/js/games.js` | سجلّ الألعاب في الـ Hub |
| `games/arabic-word-challenge/` | لعبة الكلمات (مشروع مستقل) |
