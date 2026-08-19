// ============================================================
//  auth.js
//  إدارة الجلسة المحلية (مؤقّت — قيد الاستبدال)
//
//  ⚠️ ملاحظة أمنية:
//  هذا الملف لا يوفّر أي حماية حقيقية. الجلسة مخزّنة في localStorage
//  ويمكن لأي مستخدم تعديلها من المتصفح. لا تعتمد عليه كحدّ أمني.
//
//  أُزيل منه في المرحلة 0:
//    - رمز الإدارة المكتوب صراحةً في الكود (كان بابًا خلفيًا مكشوفًا
//      في مستودع عام).
//
//  البديل في المرحلة 1: Firebase Authentication + أدوار عبر Custom Claims،
//  مع فرض الصلاحيات على الخادم وفي قواعد Firestore — لا في المتصفح.
// ============================================================

const SESSION_KEY = "fam_session_v1";

export function saveSession(userId, isAdmin) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, isAdmin }));
}

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
