import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ChildProfile } from "../types";

/** اشتراك حيّ بملفات أبناء ولي أمر واحد. */
export function useProfiles(uid: string | undefined) {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "users", uid, "profiles"),
      orderBy("displayName")
    );

    return onSnapshot(
      q,
      (snap) => {
        setProfiles(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChildProfile)
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.warn("[profiles] تعذّرت القراءة:", err.code);
        setError(err.code);
        setProfiles([]);
        setLoading(false);
      }
    );
  }, [uid]);

  return { profiles, loading, error };
}
