// تحقق من صحة مدخلات النماذج.
//
// الحدود هنا تطابق ما تفرضه config/firestore.rules عمدًا: التحقق في
// المتصفح للراحة فقط، والقاعدة على الخادم هي الفاصلة. أي اختلاف بينهما
// يعني رفضًا مُحيّرًا بعد ملء النموذج.

export const NAME_MAX = 40;
export const PASSWORD_MIN = 8; // أعلى من حدّ Firebase (6) عن قصد

/** فحص عملي لصيغة البريد: محارف، @، نطاق بنقطة. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateDisplayName(value: string): string | null {
  const name = value.trim();
  if (name.length === 0) return "أدخل الاسم.";
  if (name.length > NAME_MAX) return `الاسم يجب ألا يتجاوز ${NAME_MAX} حرفًا.`;
  return null;
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (email.length === 0) return "أدخل البريد الإلكتروني.";
  if (!EMAIL_RE.test(email)) return "صيغة البريد الإلكتروني غير صحيحة.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length === 0) return "أدخل كلمة المرور.";
  if (value.length < PASSWORD_MIN)
    return `كلمة المرور يجب ألا تقل عن ${PASSWORD_MIN} أحرف.`;
  return null;
}

export function validatePasswordConfirm(
  password: string,
  confirm: string
): string | null {
  if (confirm.length === 0) return "أعد إدخال كلمة المرور.";
  if (password !== confirm) return "كلمتا المرور غير متطابقتين.";
  return null;
}

export function validateAvatar(value: string): string | null {
  if (!value.trim()) return "اختر رمزًا.";
  return null;
}
