# النشر

يُبنى التطبيق في GitHub Actions ويُنشر ناتج `dist/` إلى GitHub Pages.
**لا يُرفع أي ناتج بناء إلى git**، فيستحيل أن يفترق المنشور عن المصدر.

المسار: `.github/workflows/deploy.yml` — يعمل على كل دفعة إلى `main`.

---

## ⚙️ إعداد لمرة واحدة

### 1. حوّل مصدر Pages إلى Actions

**Settings ← Pages ← Build and deployment ← Source**

اختر **GitHub Actions** بدل «Deploy from a branch».

> الوضع القديم (`main` / `(root)`) كان يخدم ملفات المستودع كما هي. لم يعد
> ذلك صالحًا: التطبيق صار يُبنى إلى `dist/`، وجذر المستودع لا يحوي موقعًا
> جاهزًا. إبقاء الإعداد القديم يعني نشر شيء لا يعمل.

### 2. اضبط متغيّرات Firebase

**Settings ← Secrets and variables ← Actions ← تبويب Variables ← New variable**

| الاسم | المصدر |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console ← Project settings ← Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | نفس المكان |
| `VITE_FIREBASE_PROJECT_ID` | نفس المكان |
| `VITE_FIREBASE_STORAGE_BUCKET` | نفس المكان |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | نفس المكان |
| `VITE_FIREBASE_APP_ID` | نفس المكان |

**لماذا Variables لا Secrets؟** إعدادات Firebase للويب ليست أسرارًا: تُرسل
إلى كل متصفح بالضرورة، ويمكن قراءتها من أي نسخة منشورة. تخزينها كـ Secrets
يوهم بحماية غير موجودة ويصعّب التشخيص. **الحدّ الأمني الحقيقي هو قواعد
Firestore** — وهي مُختبَرة في كل دفعة ضمن نفس المسار.

> إن لم تُضبط: الموقع يُنشر لكنه يعرض «تعذّر تشغيل التطبيق» مع سبب واضح،
> ويسجّل الـ workflow تحذيرًا. لن ترى صفحة بيضاء.

### 3. أضف نطاق Pages إلى Firebase

**Firebase Console ← Authentication ← Settings ← Authorized domains**

أضف `<USERNAME>.github.io`. بدونه يرفض Firebase عمليات الدخول من الموقع
المنشور.

---

## الرابط

```
https://<USERNAME>.github.io/family-gamification/
```

لا حاجة لأي إعداد إضافي للمسارات: التطبيق يستخدم **HashRouter**، فالمسارات
تُحلّ في المتصفح (`/#/hub`) ولا تحتاج من الخادم إعادة كتابة. هذا ما يجعل
GitHub Pages كافية رغم أنها تخدم ملفات ثابتة فقط.

كذلك `base: "./"` في `vite.config.ts` يجعل مسارات الأصول نسبية، فيعمل
الناتج من أي مجلد فرعي دون إعادة بناء.

---

## ما يفعله المسار في كل دفعة

| الخطوة | الغرض |
|---|---|
| `npm ci` | تثبيت مطابق لـ `package-lock.json` |
| `npm run typecheck` | `tsc` بلا أخطاء |
| `npm test` | 62 اختبار وحدة |
| `npm run rules:test` | 40 اختبار قواعد على المحاكي |
| `npm run build` | البناء إلى `dist/` |
| نشر | رفع `dist/` إلى Pages |

أي خطوة تفشل توقف النشر. **اختبارات القواعد جزء من المسار عمدًا**: هي الحدّ
الأمني الوحيد في نظام بلا خادم، فلا يجوز نشر نسخة لم تُتحقّق قواعدها.

---

## 🐛 استكشاف الأخطاء

**«تعذّر تشغيل التطبيق» على الموقع المنشور**
لم تُضبط متغيّرات `VITE_FIREBASE_*`، أو ضُبطت كـ Secrets بدل Variables.
راجع الخطوة 2 ثم أعد تشغيل الـ workflow.

**الدخول يفشل على الموقع المنشور بينما يعمل محليًا**
نطاق `<USERNAME>.github.io` غير مضاف في Authorized domains — الخطوة 3.

**`auth/operation-not-allowed` عند التسجيل**
لم تُفعّل طريقة Email/Password:
**Firebase Console ← Authentication ← Sign-in method**.

**الـ workflow لا يعمل أصلًا**
تأكّد أن مصدر Pages هو **GitHub Actions** (الخطوة 1)، وأن الدفعة إلى `main`.
