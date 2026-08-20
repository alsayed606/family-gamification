import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { UserDoc } from "../types";

/**
 * قائمة حيّة بكل المستخدمين — للمدير وحده.
 *
 * قاعدة القراءة `isSelf(userId) || isAdmin()` تجعل استعلام المجموعة كاملة
 * ينجح للمدير فقط: العضو يفشل عند أول مستند ليس مستنده. أي أن هذا الاستعلام
 * نفسه حدّ أمني، لا مجرد شاشة محجوبة.
 */
export function useUsers(enabled: boolean) {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "users"), orderBy("displayName"));

    return onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map((d) => d.data() as UserDoc));
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.warn("[users] تعذّرت القراءة:", err.code);
        setError(err.code);
        setUsers([]);
        setLoading(false);
      }
    );
  }, [enabled]);

  return { users, loading, error };
}
