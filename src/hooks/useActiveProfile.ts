import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GUARDIAN_ID,
  readStoredActiveId,
  resolveActiveId,
  writeStoredActiveId,
} from "../lib/activeProfile";
import type { ChildProfile } from "../types";

export type ActivePlayer = {
  id: string;
  displayName: string;
  avatar: string;
  isGuardian: boolean;
};

/**
 * الملف النشط على هذا الجهاز — عرض فقط.
 *
 * لا يُرسل إلى Firestore ولا تقرأه أي قاعدة. تخزينه في localStorage
 * يعني أن المستخدم يستطيع تغييره بحرّية، وهذا مقبول لأنه لا يترتّب
 * عليه أي صلاحية.
 */
export function useActiveProfile(
  guardian: { displayName: string; avatar: string } | null,
  profiles: ChildProfile[],
  /** هل اكتمل تحميل الملفات؟ بدونها لا يمكن تمييز "لم تصل" من "حُذفت". */
  profilesReady: boolean
) {
  const [storedId, setStoredId] = useState<string>(
    () => readStoredActiveId() ?? GUARDIAN_ID
  );

  const ids = useMemo(() => profiles.map((p) => p.id), [profiles]);

  // قبل اكتمال التحميل تكون القائمة فارغة، فيبدو كل مُعرّف محفوظ كأنه
  // لملف محذوف. الحسم قبل ذلك يمحو اختيار المستخدم عند كل فتح للصفحة.
  const activeId = profilesReady ? resolveActiveId(storedId, ids) : storedId;

  // تثبيت الرجوع إلى ولي الأمر في التخزين أيضًا، وإلا بقي المُعرّف الميت
  // يُقرأ عند كل إقلاع. لا يُنفَّذ إلا بعد وصول القائمة الحقيقية.
  useEffect(() => {
    if (profilesReady && activeId !== storedId) {
      setStoredId(activeId);
      writeStoredActiveId(activeId);
    }
  }, [profilesReady, activeId, storedId]);

  const select = useCallback((id: string) => {
    setStoredId(id);
    writeStoredActiveId(id);
  }, []);

  const active: ActivePlayer = useMemo(() => {
    if (activeId !== GUARDIAN_ID) {
      const found = profiles.find((p) => p.id === activeId);
      if (found) {
        return {
          id: found.id,
          displayName: found.displayName,
          avatar: found.avatar,
          isGuardian: false,
        };
      }
    }
    return {
      id: GUARDIAN_ID,
      displayName: guardian?.displayName ?? "—",
      avatar: guardian?.avatar ?? "🙂",
      isGuardian: true,
    };
  }, [activeId, profiles, guardian]);

  return { active, activeId, select };
}
