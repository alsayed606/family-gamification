import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
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
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [profileResolved, setProfileResolved] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      // يُصفَّر مع المستخدم، لا داخل تأثير لاحق: لو تأخّر التصفير لَظهرت
      // لحظة تبدو فيها الحالة نهائية بينما الدور لم يصل بعد، فيُطرد
      // المدير من /admin عند فتح الرابط مباشرةً.
      setProfileResolved(next === null);
      setProfile(null);
      setUser(next);
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
    const isVerified = user?.emailVerified === true;
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
  }, [loading, user, profile, profileResolved]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
