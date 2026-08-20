import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { UserDoc } from "../types";

/**
 * ينشئ مستند users/{uid} إن لم يوجد.
 *
 * لماذا idempotent ويُستدعى عند الدخول أيضًا لا عند التسجيل فقط؟ لأن
 * إنشاء حساب Auth وكتابة المستند عمليتان منفصلتان بلا معاملة تجمعهما:
 * لو نجحت الأولى وفشلت الثانية (انقطاع شبكة) لبقي المستخدم بحساب بلا
 * ملف — يدخل ولا يرى اسمًا ولا دورًا. الاستدعاء عند كل دخول يُصلح ذلك.
 *
 * آمن أمنيًا: القاعدة تثبّت الدور على member عند الإنشاء، فلا يمكن أن
 * يُنشئ أحد لنفسه مستندًا بصلاحية أعلى. والمستندات غير قابلة للحذف،
 * فمستند مفقود يعني أنه لم يُنشأ قط لا أنه أُزيل.
 */
export async function ensureUserDoc(
  user: User,
  fallback?: { displayName?: string; avatar?: string }
): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const payload: UserDoc = {
    uid: user.uid,
    email: user.email ?? "",
    displayName:
      fallback?.displayName?.trim() ||
      user.displayName?.trim() ||
      user.email?.split("@")[0] ||
      "مستخدم",
    avatar: fallback?.avatar || "🙂",
    role: "member",
    status: "ACTIVE",
  };
  await setDoc(ref, payload);
}

export async function register(input: {
  displayName: string;
  email: string;
  password: string;
  avatar: string;
}): Promise<void> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  );

  const displayName = input.displayName.trim();
  // اسم العرض على حساب Auth للراحة؛ المصدر المعتمد يبقى مستند Firestore.
  await updateProfile(cred.user, { displayName }).catch(() => {});
  await ensureUserDoc(cred.user, { displayName, avatar: input.avatar });
  await sendEmailVerification(cred.user);
}

export async function login(email: string, password: string): Promise<void> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  // إصلاح ذاتي لأي حساب أُنشئ ثم فشلت كتابة مستنده.
  await ensureUserDoc(cred.user).catch((err) => {
    console.warn("[auth] تعذّر إنشاء مستند المستخدم عند الدخول:", err);
  });
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resendVerification(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("لا توجد جلسة مفتوحة.");
  await sendEmailVerification(user);
}

/**
 * يحدّث حالة التوثيق من الخادم.
 *
 * الضغط على رابط التحقق يحدث في تبويب آخر، ولا يعلم هذا التبويب به:
 * قيمة emailVerified مأخوذة من رمز الدخول المحفوظ محليًا. reload()
 * يجلب الحالة الحقيقية، ثم نُجدّد الرمز كي تلتقط قواعد Firestore
 * الحالة الجديدة أيضًا.
 */
export async function refreshVerificationState(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  await user.reload();
  if (auth.currentUser?.emailVerified) {
    await auth.currentUser.getIdToken(true);
    return true;
  }
  return false;
}

/**
 * يرسل رابط استعادة كلمة المرور.
 *
 * لا نُميّز بين بريد مسجّل وغير مسجّل في الواجهة: إظهار "هذا البريد غير
 * موجود" يمنح مهاجمًا وسيلة لمعرفة البُرد المسجّلة في النظام.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}
