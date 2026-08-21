import { normalize, shuffleLetters } from "../../../lib/arabic";
import type { Difficulty, Question } from "../../../types";

// ============================================================
//  منطق مسابقة العائلة — دوالّ خالصة، بلا React وبلا شبكة.
//
//  هنا يقع كل ما يستحق الاختبار: بناء القرعة، وتقييم الإجابة، وعرض
//  الكلمة المبعثرة. الشاشات فوقه عرضٌ فقط.
// ============================================================

export type QuizFilters = {
  /** فارغ = كل المجالات. */
  categories: string[];
  /** فارغ = كل المستويات. */
  difficulties: Difficulty[];
  rounds: number;
};

export type Team = { name: string; score: number };

/**
 * يبني قرعة الأسئلة.
 *
 * تُقصّ إلى عدد الجولات، وقد تخرج أقصر منه إن لم يكفِ البنك — وهذه
 * الحالة واقعية جدًا في بنك جديد، فالمحرّك يجب أن ينهي المباراة بنفاد
 * القرعة لا بعدّاد الجولات وحده. (نفس الخلل الذي أسقط لعبة الكلمات.)
 */
export function buildPool(
  questions: Question[],
  filters: QuizFilters,
  shuffle: <T>(items: T[]) => T[] = shuffleArray
): Question[] {
  const matching = questions.filter(
    (q) =>
      (filters.categories.length === 0 ||
        filters.categories.includes(q.category)) &&
      (filters.difficulties.length === 0 ||
        filters.difficulties.includes(q.difficulty))
  );
  return shuffle(matching).slice(0, Math.max(0, filters.rounds));
}

/**
 * تقييم الإجابة.
 *
 * أسئلة الاختيار تُطابَق نصًّا حرفيًا لأن اللاعب يضغط خيارًا لا يكتبه.
 * الكلمة المبعثرة تُطابَق بعد التطبيع: الفرق بين «مدرسه» و«مدرسة» خطأ
 * إملائي لا خطأ في المعرفة، ورفضه يُحبط اللاعب بلا فائدة.
 */
export function isCorrect(question: Question, given: string): boolean {
  if (question.type === "WORD_SCRAMBLE") {
    return normalize(given) === normalize(question.answer) && given.trim() !== "";
  }
  return given === question.answer;
}

/** الخيارات معروضة بترتيب عشوائي كي لا يحفظ اللاعب موضع الإجابة. */
export function presentChoices(
  question: Question,
  shuffle: <T>(items: T[]) => T[] = shuffleArray
): string[] {
  return shuffle(question.choices ?? []);
}

/** حروف الكلمة مبعثرة للعرض. المسافات تُحذف فلا تفضح عدد الكلمات. */
export function scrambleAnswer(question: Question): string[] {
  return shuffleLetters(question.answer.replace(/\s+/g, ""));
}

/** المجالات الموجودة فعلًا في الأسئلة المتاحة، مرتّبة عربيًا. */
export function categoriesOf(questions: Question[]): string[] {
  return [...new Set(questions.map((q) => q.category))].sort((a, b) =>
    a.localeCompare(b, "ar")
  );
}

/** الفريق التالي بالتناوب — يبقى صحيحًا لأي عدد فرق. */
export function nextTeam(current: number, teamCount: number): number {
  return teamCount > 0 ? (current + 1) % teamCount : 0;
}

/** الفرق الفائزة؛ أكثر من واحد يعني تعادلًا. */
export function winners(teams: Team[]): Team[] {
  const top = Math.max(...teams.map((t) => t.score), 0);
  return teams.filter((t) => t.score === top);
}

export function shuffleArray<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // المدى مضمون (0 <= j <= i < a.length) لكن noUncheckedIndexedAccess
    // لا يستطيع إثباته.
    const swap = a[i]!;
    a[i] = a[j]!;
    a[j] = swap;
  }
  return a;
}
