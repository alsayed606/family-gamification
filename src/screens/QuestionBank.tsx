import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useQuestions, type QuestionScope } from "../hooks/useQuestions";
import {
  createPublishedQuestion,
  deleteQuestion,
  proposeQuestion,
  setQuestionStatus,
  updateQuestion,
} from "../lib/questions";
import { QuestionForm } from "../components/QuestionForm";
import { Banner } from "../components/Banner";
import { Spinner } from "../components/Spinner";
import { authErrorMessage } from "../lib/authErrors";
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  type Question,
  type QuestionDraft,
} from "../types";

// ============================================================
//  بنك الأسئلة المشترك.
//
//  ثلاثة نطاقات تقابل ثلاثة فروع في قاعدة القراءة تمامًا. تبويب لا
//  تقابله قاعدة يعني استعلامًا مرفوضًا كاملًا — فالقواعد ليست مرشِّحات.
// ============================================================

type Tab = "published" | "mine" | "review";

export function QuestionBank() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("published");
  const [editing, setEditing] = useState<Question | "new" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const scope: QuestionScope =
    tab === "published"
      ? { kind: "published" }
      : tab === "mine"
        ? { kind: "mine", uid: user?.uid ?? "" }
        : { kind: "all" };

  const { questions, loading, error } = useQuestions(scope);

  // المدير يشترك بكل شيء في تبويب المراجعة، فنقصره على المسوّدات هنا.
  const scoped = useMemo(
    () => (tab === "review" ? questions.filter((q) => q.status === "DRAFT") : questions),
    [questions, tab]
  );

  const categories = useMemo(
    () => [...new Set(scoped.map((q) => q.category))].sort((a, b) => a.localeCompare(b, "ar")),
    [scoped]
  );

  const shown = useMemo(
    () =>
      scoped
        .filter((q) => !category || q.category === category)
        .filter((q) => !type || q.type === type)
        .filter((q) => !difficulty || q.difficulty === difficulty)
        .sort((a, b) => a.category.localeCompare(b.category, "ar")),
    [scoped, category, type, difficulty]
  );

  async function run(id: string, fn: () => Promise<unknown>) {
    setActionError(null);
    setBusyId(id);
    try {
      await fn();
    } catch (err) {
      setActionError(authErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function save(draft: QuestionDraft) {
    if (!user) return;
    const target = editing;
    if (!target) return;

    await run(target === "new" ? "new" : target.id, async () => {
      if (target === "new") {
        // المدير ينشر مباشرة؛ العضو يقترح مسوّدة. الخادم يفرض هذا أيضًا،
        // فالفرع هنا لتوقّع صحيح لا لصلاحية.
        if (isAdmin) await createPublishedQuestion(draft, user.uid);
        else await proposeQuestion(draft, user.uid);
      } else {
        await updateQuestion(target.id, draft);
      }
      setEditing(null);
    });
  }

  function remove(q: Question) {
    if (!window.confirm(`حذف السؤال «${q.prompt}»؟ لا يمكن التراجع.`)) return;
    void run(q.id, () => deleteQuestion(q.id));
  }

  if (editing) {
    return (
      <div className="page">
        <header className="topbar">
          <div className="tb-user">
            <span className="tb-avatar">📝</span>
            <div>
              <strong>{editing === "new" ? "سؤال جديد" : "تعديل السؤال"}</strong>
              <small className="muted">
                {isAdmin ? "يُنشر فور الحفظ" : "يُحفظ كمسوّدة حتى يراجعه المدير"}
              </small>
            </div>
          </div>
        </header>
        <main className="wrap stack">
          {actionError && <Banner kind="error">{actionError}</Banner>}
          <QuestionForm
            initial={editing === "new" ? undefined : editing}
            submitLabel={editing === "new" ? "حفظ" : "حفظ التعديل"}
            busy={busyId !== null}
            onSubmit={(draft) => void save(draft)}
            onCancel={() => {
              setActionError(null);
              setEditing(null);
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="tb-user">
          <span className="tb-avatar">📚</span>
          <div>
            <strong>بنك الأسئلة</strong>
            <small className="muted">{shown.length} سؤال</small>
          </div>
        </div>
        <nav className="tb-actions">
          <button className="btn-ghost" onClick={() => setEditing("new")}>
            + سؤال
          </button>
          <Link className="btn-ghost" to="/hub">
            الألعاب
          </Link>
        </nav>
      </header>

      <main className="wrap stack">
        {error && (
          <Banner kind="error">تعذّر تحميل الأسئلة ({error}).</Banner>
        )}
        {actionError && <Banner kind="error">{actionError}</Banner>}

        <div className="switcher-chips" role="tablist">
          <TabChip now={tab} me="published" set={setTab} label="المنشورة" />
          <TabChip now={tab} me="mine" set={setTab} label="مقترحاتي" />
          {isAdmin && (
            <TabChip now={tab} me="review" set={setTab} label="قيد المراجعة" />
          )}
        </div>

        <div className="q-filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">كل المجالات</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">كل الأنواع</option>
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">كل المستويات</option>
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Spinner label="جارٍ تحميل الأسئلة…" />
        ) : shown.length === 0 ? (
          <p className="muted">
            {tab === "review"
              ? "لا توجد مسوّدات تنتظر المراجعة."
              : tab === "mine"
                ? "لم تقترح سؤالًا بعد."
                : "لا توجد أسئلة منشورة بعد."}
          </p>
        ) : (
          <ul className="user-list">
            {shown.map((q) => {
              const mine = q.createdBy === user?.uid;
              const canEdit = isAdmin || (mine && q.status === "DRAFT");
              const busy = busyId === q.id;
              return (
                <li key={q.id} className="user-row q-row">
                  <div className="user-meta">
                    <strong>{q.prompt}</strong>
                    <small className="muted">
                      الإجابة: {q.answer}
                    </small>
                    <div className="badges">
                      <span className="badge">{q.category}</span>
                      <span className="badge">{typeLabel(q.type)}</span>
                      <span className="badge">
                        {difficultyLabel(q.difficulty)}
                      </span>
                      {q.status === "DRAFT" && (
                        <span className="badge badge-danger">مسوّدة</span>
                      )}
                      {mine && <span className="self-tag">اقتراحك</span>}
                    </div>
                  </div>

                  <div className="user-actions">
                    {isAdmin && (
                      <button
                        className="btn-ghost"
                        disabled={busy}
                        onClick={() =>
                          void run(q.id, () =>
                            setQuestionStatus(
                              q.id,
                              q.status === "DRAFT" ? "PUBLISHED" : "DRAFT"
                            )
                          )
                        }
                      >
                        {q.status === "DRAFT" ? "نشر" : "سحب"}
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="btn-ghost"
                        disabled={busy}
                        onClick={() => setEditing(q)}
                      >
                        تعديل
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="btn-ghost danger"
                        disabled={busy}
                        onClick={() => remove(q)}
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="muted small">
          ⚠️ الإجابة مقروءة لكل من يقرأ السؤال — ولا مفرّ من ذلك بلا خادم.
          البنك للّعب الحرّ، لا لمسابقة رسمية.
        </p>
      </main>
    </div>
  );
}

function TabChip({
  now,
  me,
  set,
  label,
}: {
  now: Tab;
  me: Tab;
  set: (t: Tab) => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={now === me}
      className={"chip" + (now === me ? " is-active" : "")}
      onClick={() => set(me)}
    >
      {label}
    </button>
  );
}

function typeLabel(value: string): string {
  return QUESTION_TYPES.find((t) => t.value === value)?.label ?? value;
}

function difficultyLabel(value: string): string {
  return DIFFICULTIES.find((d) => d.value === value)?.label ?? value;
}
