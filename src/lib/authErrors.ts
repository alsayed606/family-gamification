// ترجمة أكواد أخطاء Firebase Auth إلى رسائل عربية مفهومة.
//
// ── ملاحظة على منع تعداد البُرد الإلكترونية ──
// Firebase الحديث يُرجع auth/invalid-credential لكلٍّ من "بريد غير مسجّل"
// و"كلمة مرور خاطئة" عمدًا، كي لا يستطيع مهاجم معرفة البُرد المسجّلة.
// نحافظ على ذلك: رسالة واحدة محايدة للحالتين، ولا نكشف أيهما وقع.

const MESSAGES: Record<string, string> = {
  // الدخول
  "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "auth/wrong-password": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "auth/user-not-found": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة.",
  "auth/user-disabled": "هذا الحساب معطّل. راجع مدير النظام.",

  // التسجيل
  "auth/email-already-in-use": "هذا البريد مسجّل بالفعل. جرّب تسجيل الدخول.",
  "auth/weak-password": "كلمة المرور ضعيفة. استخدم 8 أحرف فأكثر.",
  "auth/operation-not-allowed":
    "تسجيل الدخول بالبريد غير مفعّل في مشروع Firebase. فعّله من Console ← Authentication ← Sign-in method.",

  // الحدود والشبكة
  "auth/too-many-requests":
    "محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم أعد المحاولة.",
  "auth/network-request-failed":
    "تعذّر الاتصال بالشبكة. تحقّق من اتصالك ثم أعد المحاولة.",
  "auth/requires-recent-login":
    "تحتاج إلى تسجيل دخول جديد قبل تنفيذ هذا الإجراء.",

  // روابط التحقق واستعادة كلمة المرور
  "auth/expired-action-code": "انتهت صلاحية الرابط. اطلب رابطًا جديدًا.",
  "auth/invalid-action-code": "الرابط غير صالح أو استُخدم من قبل.",
};

const FALLBACK = "حدث خطأ غير متوقّع. أعد المحاولة، وإن تكرّر راجع المدير.";

/** يستخرج كود الخطأ من كائن خطأ Firebase دون افتراض شكله. */
function codeOf(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

export function authErrorMessage(error: unknown): string {
  const code = codeOf(error);
  if (code && code in MESSAGES) return MESSAGES[code]!;
  if (code) {
    // كود غير معروف: نُظهر رسالة عامة للمستخدم ونُبقي الكود في الطرفية
    // للتشخيص، بدل عرض نص إنجليزي خام لا يفيده.
    console.warn("[auth] كود خطأ غير مترجَم:", code);
  }
  return FALLBACK;
}

export const AUTH_ERROR_CODES = Object.keys(MESSAGES);
