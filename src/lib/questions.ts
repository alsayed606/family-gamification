import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizeQuestion } from "./questionValidation";
import type { Question, QuestionDraft, QuestionStatus } from "../types";

// ============================================================
//  عمليات بنك الأسئلة.
//
//  الفرض الحقيقي في config/firestore.rules. ما هنا استدعاء فقط:
//  العضو يقترح مسوّدة باسمه، والمدير وحده ينشر. لو استُدعيت
//  createPublishedQuestion من متصفّح عضو لرفضها الخادم.
//
//  ── لماذا لا ترتيب ولا فلترة في الاستعلام ──
//  كل استعلام هنا بقيد مساواة واحد، فيخدمه فهرس الحقل الواحد التلقائي
//  ولا يحتاج فهرسًا مركّبًا. الترتيب والتصفية بالمجال والصعوبة تتم في
//  المتصفح بعد الجلب. ببنك بحجم مركز واحد (مئات الأسئلة) الفرق غير
//  محسوس، والمقابل أننا لا نفاجأ بـ«الاستعلام يحتاج فهرسًا» في الإنتاج.
//  إن كبر البنك إلى آلاف، يُنقل الترتيب إلى الخادم مع فهارس مركّبة.
// ============================================================

const COL = "questions";

function toQuestion(id: string, data: Record<string, unknown>): Question {
  return { id, ...data } as Question;
}

/** أسئلة منشورة — ما تقرؤه الألعاب. جلبة واحدة لا اشتراك حيّ. */
export async function fetchPublishedQuestions(): Promise<Question[]> {
  const snap = await getDocs(
    query(collection(db, COL), where("status", "==", "PUBLISHED"))
  );
  return snap.docs.map((d) => toQuestion(d.id, d.data()));
}

/** العضو يقترح سؤالًا. الحالة مثبَّتة على مسوّدة — والقاعدة تفرضها. */
export async function proposeQuestion(
  draft: QuestionDraft,
  uid: string
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...normalizeQuestion(draft),
    status: "DRAFT" satisfies QuestionStatus,
    createdBy: uid,
  });
  return ref.id;
}

/** المدير ينشئ سؤالًا منشورًا مباشرة، بلا مروره بالمراجعة. */
export async function createPublishedQuestion(
  draft: QuestionDraft,
  uid: string
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...normalizeQuestion(draft),
    status: "PUBLISHED" satisfies QuestionStatus,
    createdBy: uid,
  });
  return ref.id;
}

/**
 * تعديل محتوى سؤال قائم — بلا مساس بـ status ولا createdBy، فالقاعدة
 * تشترط ثباتهما.
 *
 * ── لماذا الحذف الصريح لـ choices ──
 * updateDoc يدمج ولا يحذف الحقول الغائبة. فتحويل سؤال اختيار إلى كلمة
 * مبعثرة كان يترك choices القديمة في المستند، والقاعدة ترفض كلمة مبعثرة
 * تحمل خيارات — أي تعديل يفشل بلا سبب ظاهر للمستخدم. deleteField() يزيل
 * الحقل فعلًا.
 */
export async function updateQuestion(
  id: string,
  draft: QuestionDraft
): Promise<void> {
  const next = normalizeQuestion(draft);
  await updateDoc(doc(db, COL, id), {
    type: next.type,
    prompt: next.prompt,
    answer: next.answer,
    category: next.category,
    difficulty: next.difficulty,
    choices: next.choices ?? deleteField(),
  });
}

export async function setQuestionStatus(
  id: string,
  status: QuestionStatus
): Promise<void> {
  await updateDoc(doc(db, COL, id), { status });
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
