import { useId, useState, type FormEvent } from "react";
import { Field } from "./Field";
import { Banner } from "./Banner";
import {
  defaultChoices,
  hasErrors,
  validateQuestion,
} from "../lib/questionValidation";
import {
  DIFFICULTIES,
  MAX_CHOICES,
  MIN_CHOICES,
  QUESTION_TYPES,
  type Difficulty,
  type Question,
  type QuestionDraft,
  type QuestionType,
} from "../types";

// ============================================================
//  محرّر السؤال.
//
//  ── لماذا الإجابة تُختار بزرّ لا تُكتب ──
//  الثابت الذي تفرضه القاعدة أن الإجابة أحد الخيارات. لو كُتبت نصًّا،
//  لصار على المؤلّف أن يطابقها حرفيًا وسيفشل كثيرًا بلا سبب مفهوم.
//  اختيارها من الخيارات نفسها يجعل الثابت مضمونًا بالبناء: لا يمكن
//  تركيب نموذج يخالفه أصلًا.
//
//  نحتفظ بفهرس الإجابة لا بنصّها أثناء التحرير، فتتبع الإجابةُ الخيارَ
//  إذا عُدّل نصّه. ويُحوَّل الفهرس إلى نصّ عند الإرسال فقط — لأن الفهرس
//  يفسد بإعادة الترتيب، وهذا ما يجعله غير صالح للتخزين.
// ============================================================

type Props = {
  /** سؤال قائم للتعديل، أو غيابه = إنشاء جديد. */
  initial?: Question;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (draft: QuestionDraft) => void;
  onCancel: () => void;
};

export function QuestionForm({
  initial,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: Props) {
  const groupName = useId();

  const [type, setType] = useState<QuestionType>(initial?.type ?? "MCQ");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initial?.difficulty ?? "EASY"
  );
  const [choices, setChoices] = useState<string[]>(
    initial?.choices ?? defaultChoices(initial?.type ?? "MCQ") ?? ["", ""]
  );
  const [answerIndex, setAnswerIndex] = useState(() =>
    Math.max(0, initial?.choices?.indexOf(initial.answer ?? "") ?? 0)
  );
  const [scrambleAnswer, setScrambleAnswer] = useState(
    initial?.type === "WORD_SCRAMBLE" ? initial.answer : ""
  );
  const [touched, setTouched] = useState(false);

  const isScramble = type === "WORD_SCRAMBLE";
  const isTrueFalse = type === "TRUE_FALSE";

  const draft = buildDraft();
  const errors = validateQuestion(draft);
  const show = touched ? errors : {};

  function buildDraft(): QuestionDraft {
    const base = { type, prompt, category, difficulty };
    if (isScramble) return { ...base, answer: scrambleAnswer };
    return { ...base, choices, answer: choices[answerIndex] ?? "" };
  }

  function changeType(next: QuestionType) {
    const previous = type;
    setType(next);

    // «صح/خطأ» يفرض خياريه. والعودة منه إلى اختيار من متعدد تبدأ من
    // خيارين فارغين، وإلا بقي «صح» و«خطأ» خيارين لسؤال لا علاقة له بهما.
    // ما عدا ذلك تُترك الخيارات كما هي فلا يفقد المؤلّف ما كتبه.
    if (next === "TRUE_FALSE" || previous === "TRUE_FALSE") {
      setChoices(defaultChoices(next) ?? ["", ""]);
      setAnswerIndex(0);
    }
  }

  function setChoiceAt(index: number, value: string) {
    setChoices((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function addChoice() {
    setChoices((prev) => [...prev, ""]);
  }

  function removeChoice(index: number) {
    setChoices((prev) => prev.filter((_, i) => i !== index));
    // الإجابة كانت تشير إلى خيار حُذف أو انزاح: نعيد ضبطها بدل ترك
    // فهرس يشير إلى خيار آخر بصمت.
    setAnswerIndex((prev) => (prev >= index && prev > 0 ? prev - 1 : prev));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (hasErrors(errors)) return;
    onSubmit(draft);
  }

  return (
    <form className="q-form card stack" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={`${groupName}-type`}>نوع السؤال</label>
        <select
          id={`${groupName}-type`}
          value={type}
          onChange={(e) => changeType(e.target.value as QuestionType)}
          disabled={busy}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${groupName}-prompt`}>
          {isScramble ? "تلميح أو تعريف" : "نصّ السؤال"}
        </label>
        <textarea
          id={`${groupName}-prompt`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          disabled={busy}
          aria-invalid={show.prompt ? true : undefined}
          className={show.prompt ? "has-error" : undefined}
        />
        {show.prompt && (
          <p className="field-error" role="alert">
            {show.prompt}
          </p>
        )}
      </div>

      {isScramble ? (
        <Field
          label="الكلمة"
          value={scrambleAnswer}
          onChange={(e) => setScrambleAnswer(e.target.value)}
          error={show.answer}
          hint="هي ما سيراه اللاعب مبعثرًا."
          disabled={busy}
        />
      ) : (
        <fieldset className="q-choices">
          <legend className="field-label">
            الخيارات — واختر الإجابة الصحيحة
          </legend>

          {choices.map((choice, index) => (
            <div className="q-choice" key={index}>
              <input
                type="radio"
                name={groupName}
                checked={answerIndex === index}
                onChange={() => setAnswerIndex(index)}
                disabled={busy}
                aria-label={`الإجابة الصحيحة هي الخيار ${index + 1}`}
              />
              <input
                type="text"
                value={choice}
                onChange={(e) => setChoiceAt(index, e.target.value)}
                placeholder={`الخيار ${index + 1}`}
                disabled={busy || isTrueFalse}
                aria-label={`نصّ الخيار ${index + 1}`}
              />
              {!isTrueFalse && choices.length > MIN_CHOICES && (
                <button
                  type="button"
                  className="btn-ghost danger"
                  onClick={() => removeChoice(index)}
                  disabled={busy}
                  aria-label={`حذف الخيار ${index + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {!isTrueFalse && choices.length < MAX_CHOICES && (
            <button
              type="button"
              className="btn-ghost"
              onClick={addChoice}
              disabled={busy}
            >
              + خيار آخر
            </button>
          )}

          {(show.choices || show.answer) && (
            <p className="field-error" role="alert">
              {show.choices ?? show.answer}
            </p>
          )}
        </fieldset>
      )}

      <Field
        label="المجال"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        error={show.category}
        hint="مثل: جغرافيا، علوم، رياضة."
        disabled={busy}
      />

      <div className="field">
        <label htmlFor={`${groupName}-difficulty`}>الصعوبة</label>
        <select
          id={`${groupName}-difficulty`}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          disabled={busy}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {touched && hasErrors(errors) && (
        <Banner kind="error">راجع الحقول المعلَّمة أعلاه.</Banner>
      )}

      <div className="row-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "جارٍ الحفظ…" : submitLabel}
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={onCancel}
          disabled={busy}
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
