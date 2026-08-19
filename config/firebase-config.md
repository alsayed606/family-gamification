# إعداد Firebase

## ⚠️ المرحلة 0 — ما تغيّر

كان هذا الملف يحتوي على إعدادات مشروع `marine-command-center` الحقيقية،
وهو مشروع **مشترك مع أعمال Red Sea Marine**. أُزيلت الإعدادات، وفُصل
التطبيق عن ذلك المشروع نهائيًا.

تطبيق العائلة يجب أن يعمل على **مشروع Firebase مخصّص له وحده**. سبب ذلك
ليس تنظيميًا فقط: قواعد Firestore ومفاتيح الخدمة و App Check والنسخ
الاحتياطي كلها على مستوى المشروع، فمشاركة المشروع تعني أن أي خطأ في
قواعد تطبيق العائلة يعرّض بيانات الأعمال.

## الإعداد

1. أنشئ مشروعًا جديدًا في [Firebase Console](https://console.firebase.google.com/)
   (مثلًا `family-game-center`).
2. أضف تطبيق ويب واحصل على كائن الإعدادات.
3. أنشئ `src/js/firebase-config.local.js` (مستثنى من git):

```javascript
export const firebaseConfig = {
  apiKey: "…",
  authDomain: "…",
  projectId: "…",
  storageBucket: "…",
  messagingSenderId: "…",
  appId: "…",
};
```

4. فعّل Firestore، وانشر `config/firestore.rules`.

> `apiKey` في Firebase ليس سرًّا — فهو يُرسل للمتصفح بالضرورة. الحدّ الأمني
> الحقيقي هو قواعد Firestore و App Check والتحقق على الخادم.

## المجموعات

نموذج البيانات القديم (`fam_*` مع PIN لكل مستخدم) **ملغى**. النموذج الجديد
يُبنى في المرحلة 1 على Firebase Auth، بالبنية التالية (بلا `tenantId` —
النظام لمركز واحد):

```text
families/{familyId}
  members/{memberId}
games/{gameId}
questions/{questionId}
  secret/{answerId}        ← الإجابة الصحيحة، ممنوعة على العميل
sessions/{sessionId}
  registrations/{familyId}
  answers/{answerId}
  leaderboard/{familyId}
scoreLedger/{entryId}       ← كتابة من الخادم فقط
auditLogs/{auditId}         ← كتابة من الخادم فقط
```
