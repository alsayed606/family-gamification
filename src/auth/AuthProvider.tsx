import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { UserDoc } from "../types";

export type AuthState = {
  /** جاري تحديد حالة الدخول — لا تتخذ أي قرار توجيه قبل انتهائها. */
  loading: boolean;
  user: User | null;
  /** مستند المستخدم في Firestore. قد يكون null قبل إنشائه أو إن مُنع. */
  profile: UserDoc | null;
  /**
   * وصلت نتيجة مستند المستخدم (نجاحًا أو رفضًا). تبدأ false عند كل تغيّر
   * للمستخدم كي لا تُقرأ حالة "بلا دور" على أنها قرار نهائي.
   */
  profileResolved: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
};

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [profileResolved, setProfileResolved] = useState(false);
  const lastUid = useRef<string | null>(null);

  useEffect(() => {
    // onIdTokenChanged لا onAuthStateChanged: الأخير لا يُطلق عند تجديد
    // الرمز، وتوثيق البريد يقع في تبويب آخر. بعد user.reload() يبقى كائن
    // المستخدم بنفس المرجع، فلا يعيد React الرسم — لذلك نحفظ emailVerified
    // كقيمة أوّلية مستقلة تتغيّر فيلتقطها React.
    return onIdTokenChanged(auth, (next) => {
      // ref لا حالة: المستمع يُركَّب مرة واحدة، فقراءة user من الحالة هنا
      // تلتقط قيمة أول رسم إلى الأبد وتجعل كل تجديد رمز يبدو تبديل مستخدم
      // فيُمسح الملف ويومض المؤشّر بلا داعٍ.
      if (next?.uid !== lastUid.current) {
        lastUid.current = next?.uid ?? null;
        setProfileResolved(next === null);
        setProfile(null);
      }
      setUser(next);
      setEmailVerified(next?.emailVerified ?? false);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    // مستمع حي لا قراءة لمرة واحدة: ترقية الدور أو إيقاف الحساب من لوحة
    // المدير يجب أن تسري على الجلسة المفتوحة فورًا، لا بعد إعادة الدخول.
    return onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        setProfile(snap.exists() ? (snap.data() as UserDoc) : null);
        setProfileResolved(true);
      },
      (err) => {
        // الرفض متوقّع قبل توثيق البريد أو إن لم يُنشأ المستند بعد.
        console.warn("[auth] تعذّرت قراءة مستند المستخدم:", err.code);
        setProfile(null);
        setProfileResolved(true);
      }
    );
  }, [user]);

  const value = useMemo<AuthState>(() => {
    // من الحالة الأوّلية لا من user.emailVerified: كائن المستخدم يُعدَّل
    // في مكانه عند reload() فلا يلاحظ React تغيّره.
    const isVerified = emailVerified;
    return {
      loading,
      user,
      profile,
      profileResolved,
      isVerified,
      // الدور مصدره Firestore لا المتصفح. هذه القيمة للعرض والتوجيه فقط —
      // الفرض الحقيقي يقع في قواعد Firestore على الخادم.
      isAdmin: isVerified && profile?.role === "admin" && profile.status === "ACTIVE",
      isSuspended: profile?.status === "SUSPENDED",
    };
  }, [loading, user, emailVerified, profile, profileResolved]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
