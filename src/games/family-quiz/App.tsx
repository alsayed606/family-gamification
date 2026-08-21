import { useEffect, useMemo, useState } from "react";
import { fetchPublishedQuestions } from "../../lib/questions";
import { Spinner } from "../../components/Spinner";
import { Banner } from "../../components/Banner";
import { authErrorMessage } from "../../lib/authErrors";
import { DIFFICULTIES, type Difficulty, type Question } from "../../types";
import {
  buildPool,
  categoriesOf,
  isCorrect,
  nextTeam,
  presentChoices,
  scrambleAnswer,
  winners,
  type Team,
} from "./lib/quiz";
import "./styles.css";

// ============================================================
//  مسابقة العائلة — لعبة تقرأ من بنك الأسئلة المشترك.
//
//  لا بيانات خاصة بها: كل سؤال تعرضه جاء من questions المنشورة. هذا هو
//  المقصود ببنك مشترك — لعبة ثانية تضيف طريقة لعب لا نسخةَ محتوى.
//
//  لعب حرّ: النتيجة في الذاكرة فقط ولا تُكتب في Firestore. النقاط
//  الرسمية تحتاج سلطة خادم، وهي مؤجّلة حتى وجوده.
// ============================================================

type Phase = "setup" | "play" | "results";

export default function FamilyQuiz({ onExit }: { onExit: () => void }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPublishedQuestions()
      .then((qs) => alive && setQuestions(qs))
      .catch((err) => alive && setLoadError(authErrorMessage(err)));
    return () => {
      alive = false;
    };
  }, []);

  const [phase, setPhase] = useState<Phase>("setup");
  const [pool, setPool] = useState<Question[]>([]);
  const [round, setRound] = useState(0);
  const [teams, setTeams] = useState<Team[]>([
    { name: "الفريق الأول", score: 0 },
    { name: "الفريق الثاني", score: 0 },
  ]);
  const [turn, setTurn] = useState(0);
  const [given, setGiven] = useState("");
  const [verdict, setVerdict] = useState<null | boolean>(null);

  // إعدادات
  const [rounds, setRounds] = useState(10);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const categories = useMemo(
    () => categoriesOf(questions ?? []),
    [questions]
  );

  const current = pool[round];

  // الخيارات تُبعثر مرة لكل جولة لا في كل رسم، وإلا قفزت تحت الإصبع.
  const shownChoices = useMemo(
    () => (current ? presentChoices(current) : []),
    [current]
  );
  const shownLetters = useMemo(
    () => (current?.type === "WORD_SCRAMBLE" ? scrambleAnswer(current) : []),
    [current]
  );

  function start() {
    const next = buildPool(questions ?? [], {
      categories: category ? [category] : [],
      difficulties: difficulty ? [difficulty as Difficulty] : [],
      rounds,
    });
    if (next.length === 0) return;
    setPool(next);
    setRound(0);
    setTurn(0);
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setGiven("");
    setVerdict(null);
    setPhase("play");
  }

  function answer(value: string) {
    if (!current || verdict !== null) return;
    const ok = isCorrect(current, value);
    setGiven(value);
    setVerdict(ok);
    if (ok) {
      setTeams((prev) =>
        prev.map((t, i) => (i === turn ? { ...t, score: t.score + 1 } : t))
      );
    }
  }

  function advance() {
    setVerdict(null);
    setGiven("");
    setTurn((t) => nextTeam(t, teams.length));
    // تنتهي المباراة بنفاد القرعة أيضًا لا بعدّاد الجولات وحده: البنك
    // قد يعطي أسئلة أقلّ من المطلوب، وحينها لا يوجد سؤال تالٍ.
    const upcoming = pool[round + 1];
    if (!upcoming) setPhase("results");
    else setRound((r) => r + 1);
  }

  if (loadError) {
    return (
      <Shell onExit={onExit}>
        <Banner kind="error">تعذّر تحميل الأسئلة: {loadError}</Banner>
      </Shell>
    );
  }

  if (questions === null) {
    return (
      <Shell onExit={onExit}>
        <Spinner label="جارٍ تحميل الأسئلة…" />
      </Shell>
    );
  }

  // حالة واقعية في اليوم الأول لا حالة طرفية: البنك فارغ حتى يُنشر شيء.
  if (questions.length === 0) {
    return (
      <Shell onExit={onExit}>
        <div className="card stack quiz-empty">
          <h2>البنك فارغ</h2>
          <p className="muted">
            هذه اللعبة تقرأ من بنك الأسئلة المشترك، ولا يوجد سؤال منشور بعد.
            أضف أسئلة من «بنك الأسئلة» ثم عُد.
          </p>
          <button className="btn" onClick={onExit}>
            الذهاب إلى القائمة
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "setup") {
    const available = buildPool(
      questions,
      {
        categories: category ? [category] : [],
        difficulties: difficulty ? [difficulty as Difficulty] : [],
        rounds: Number.MAX_SAFE_INTEGER,
      },
      (x) => x
    ).length;

    return (
      <Shell onExit={onExit}>
        <div className="card stack">
          <h2>إعداد المباراة</h2>

          <div className="field">
            <label htmlFor="q-cat">المجال</label>
            <select
              id="q-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">كل المجالات</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="q-diff">الصعوبة</label>
            <select
              id="q-diff"
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

          <div className="field">
            <label htmlFor="q-rounds">عدد الجولات</label>
            <input
              id="q-rounds"
              type="number"
              min={1}
              max={50}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value) || 1)}
            />
            <p className="field-hint">
              المتاح بهذه التصفية: {available} سؤال
              {available > 0 && available < rounds
                ? " — ستنتهي المباراة عند نفادها."
                : ""}
            </p>
          </div>

          <div className="quiz-teams">
            {teams.map((t, i) => (
              <input
                key={i}
                type="text"
                value={t.name}
                maxLength={20}
                aria-label={`اسم الفريق ${i + 1}`}
                onChange={(e) =>
                  setTeams((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x
                    )
                  )
                }
              />
            ))}
          </div>

          {available === 0 && (
            <Banner kind="error">
              لا يوجد سؤال يطابق هذه التصفية. وسّعها لتبدأ.
            </Banner>
          )}

          <button className="btn" onClick={start} disabled={available === 0}>
            ابدأ
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "play" && current) {
    return (
      <Shell onExit={onExit}>
        <div className="quiz-scores">
          {teams.map((t, i) => (
            <div key={i} className={"quiz-team" + (i === turn ? " is-turn" : "")}>
              <strong>{t.name}</strong>
              <span>{t.score}</span>
            </div>
          ))}
        </div>

        <div className="card stack">
          <p className="muted small">
            الجولة {round + 1} من {pool.length} · {current.category}
          </p>
          <h2 className="quiz-prompt">{current.prompt}</h2>

          {current.type === "WORD_SCRAMBLE" ? (
            <>
              <div className="quiz-letters" aria-label="حروف الكلمة مبعثرة">
                {shownLetters.map((letter, i) => (
                  <span className="quiz-letter" key={i}>
                    {letter}
                  </span>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  answer(given);
                }}
              >
                <div className="field">
                  <label htmlFor="q-answer">الكلمة</label>
                  <input
                    id="q-answer"
                    type="text"
                    value={given}
                    onChange={(e) => setGiven(e.target.value)}
                    disabled={verdict !== null}
                    autoComplete="off"
                  />
                </div>
                {verdict === null && (
                  <button className="btn" type="submit">
                    تحقّق
                  </button>
                )}
              </form>
            </>
          ) : (
            <div className="quiz-choices">
              {shownChoices.map((choice) => (
                <button
                  key={choice}
                  className={
                    "quiz-choice" +
                    (verdict === null
                      ? ""
                      : choice === current.answer
                        ? " is-right"
                        : choice === given
                          ? " is-wrong"
                          : "")
                  }
                  onClick={() => answer(choice)}
                  disabled={verdict !== null}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {verdict !== null && (
            <>
              <Banner kind={verdict ? "success" : "error"}>
                {verdict
                  ? "إجابة صحيحة 🎉"
                  : `الإجابة الصحيحة: ${current.answer}`}
              </Banner>
              <button className="btn" onClick={advance}>
                {pool[round + 1] ? "الجولة التالية" : "النتيجة"}
              </button>
            </>
          )}
        </div>
      </Shell>
    );
  }

  const champs = winners(teams);
  return (
    <Shell onExit={onExit}>
      <div className="card stack quiz-results">
        <h2>
          {champs.length > 1
            ? "تعادل!"
            : `فاز ${champs[0]?.name ?? ""} 🏆`}
        </h2>
        <div className="quiz-scores">
          {teams.map((t, i) => (
            <div key={i} className="quiz-team">
              <strong>{t.name}</strong>
              <span>{t.score}</span>
            </div>
          ))}
        </div>
        <p className="muted small">
          لعب حرّ — النتيجة لا تُحفظ. النقاط الرسمية تحتاج خادمًا.
        </p>
        <button className="btn" onClick={() => setPhase("setup")}>
          مباراة جديدة
        </button>
      </div>
    </Shell>
  );
}

function Shell({
  children,
  onExit,
}: {
  children: React.ReactNode;
  onExit: () => void;
}) {
  return (
    <div className="page quiz">
      <header className="topbar">
        <div className="tb-user">
          <span className="tb-avatar">❓</span>
          <div>
            <strong>مسابقة العائلة</strong>
            <small className="muted">من بنك الأسئلة المشترك</small>
          </div>
        </div>
        <nav className="tb-actions">
          <button className="btn-ghost" onClick={onExit}>
            خروج
          </button>
        </nav>
      </header>
      <main className="wrap stack">{children}</main>
    </div>
  );
}
