import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Question } from "../types";

/**
 * نطاق ما يُشترَك فيه.
 *
 * القيد ليس تجميلًا: القواعد ليست مرشِّحات، فاستعلام بلا القيد الصحيح
 * يُرفض كاملًا لا يُقصّ. لذلك يقابل كل نطاق هنا فرعًا في قاعدة القراءة.
 */
export type QuestionScope =
  /** المنشور فقط — متاح لكل عضو فعّال. */
  | { kind: "published" }
  /** ما أنشأه العضو نفسه، مسوّدةً كان أو منشورًا. */
  | { kind: "mine"; uid: string }
  /** كل شيء — للمدير وحده؛ يُرفض لغيره. */
  | { kind: "all" };

export function useQuestions(scope: QuestionScope) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // نفكّك النطاق إلى بدائيّات: كائن جديد في كل رسم يعيد تشغيل الأثر
  // ويعيد فتح الاشتراك بلا داعٍ.
  const kind = scope.kind;
  const uid = scope.kind === "mine" ? scope.uid : undefined;

  useEffect(() => {
    if (kind === "mine" && !uid) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const col = collection(db, "questions");
    const q =
      kind === "published"
        ? query(col, where("status", "==", "PUBLISHED"))
        : kind === "mine"
          ? query(col, where("createdBy", "==", uid))
          : query(col);

    return onSnapshot(
      q,
      (snap) => {
        setQuestions(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Question)
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.warn("[questions] تعذّرت القراءة:", err.code);
        setError(err.code);
        setQuestions([]);
        setLoading(false);
      }
    );
  }, [kind, uid]);

  return { questions, loading, error };
}
