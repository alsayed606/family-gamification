import { useState } from "react";
import { CATEGORIES } from "../data/words";
import type { Category, MatchRecord, Settings, Team, TeamIndex, Word } from "../types";

type Tab = "match" | "words" | "cats" | "set";

type AdminPanelProps = {
  close: () => void;
  bank: Word[];
  addWord: (word: string, cat: Category) => string | null;
  deleteWord: (w: string) => void;
  exportJSON: () => void;
  exportCSV: () => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  catCounts: Record<Category, number>;
  offCategories: Category[];
  toggleCategory: (c: Category) => void;
  playableCount: number;
  teams: [Team, Team];
  teamName: (i: TeamIndex) => string;
  adjustScore: (i: TeamIndex, delta: number) => void;
  inMatch: boolean;
  newMatch: () => void;
  history: MatchRecord[];
  clearHistory: () => void;
};

const SETTINGS_FIELDS: { k: keyof Settings; l: string; min: number; max: number }[] = [
  { k: "rounds", l: "عدد الجولات", min: 3, max: 30 },
  { k: "seconds", l: "ثواني الجولة", min: 15, max: 180 },
  { k: "answerWindow", l: "ثواني الإجابة بعد الجرس", min: 5, max: 60 },
  { k: "points", l: "نقاط الإجابة الصحيحة", min: 1, max: 20 },
];

export function AdminPanel({
  close,
  bank,
  addWord,
  deleteWord,
  exportJSON,
  exportCSV,
  settings,
  setSettings,
  catCounts,
  offCategories,
  toggleCategory,
  playableCount,
  teams,
  teamName,
  adjustScore,
  inMatch,
  newMatch,
  history,
  clearHistory,
}: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>(inMatch ? "match" : "words");
  const [newWord, setNewWord] = useState("");
  const [newCat, setNewCat] = useState<Category>(CATEGORIES[0]);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const results = q.trim() ? bank.filter((x) => x.w.includes(q.trim())).slice(0, 40) : bank.slice(0, 24);

  const submitWord = () => {
    const e = addWord(newWord, newCat);
    setErr(e);
    if (!e) setNewWord("");
  };

  return (
    <div className="modal-wrap" role="dialog" aria-label="لوحة المشرف">
      <div className="modal">
        <header className="modal-head">
          <h3>لوحة المشرف</h3>
          <button className="btn btn-ghost" onClick={close}>
            إغلاق
          </button>
        </header>

        <nav className="tabs">
          <button className={tab === "match" ? "on" : ""} onClick={() => setTab("match")}>
            المباراة
          </button>
          <button className={tab === "words" ? "on" : ""} onClick={() => setTab("words")}>
            بنك الكلمات
          </button>
          <button className={tab === "cats" ? "on" : ""} onClick={() => setTab("cats")}>
            المجالات
          </button>
          <button className={tab === "set" ? "on" : ""} onClick={() => setTab("set")}>
            الإعدادات
          </button>
        </nav>

        <div className="modal-body">
          {tab === "match" && (
            <>
              <p className="muted">تعديل النقاط يدوياً عند الحاجة، أو بدء مباراة جديدة من الصفر.</p>
              {([0, 1] as const).map((i) => (
                <div className={`adj ${i === 0 ? "blue" : "red"}`} key={i}>
                  <span>{teamName(i)}</span>
                  <div className="adj-ctrl">
                    <button className="btn btn-ghost" onClick={() => adjustScore(i, -settings.points)}>
                      −{settings.points}
                    </button>
                    <b>{teams[i].score}</b>
                    <button className="btn btn-ghost" onClick={() => adjustScore(i, settings.points)}>
                      +{settings.points}
                    </button>
                  </div>
                </div>
              ))}
              <button className="btn btn-gold" onClick={newMatch}>
                بدء مباراة جديدة
              </button>
              {history.length > 0 && (
                <button className="btn btn-ghost danger" onClick={clearHistory}>
                  مسح سجل المباريات ({history.length})
                </button>
              )}
            </>
          )}

          {tab === "words" && (
            <>
              <p className="muted">البنك الحالي: {bank.length} كلمة. تُقبل الكلمات العربية بستة أحرف فأكثر.</p>
              <div className="add-row">
                <input
                  className="input"
                  value={newWord}
                  onChange={(e) => {
                    setNewWord(e.target.value);
                    setErr(null);
                  }}
                  placeholder="كلمة جديدة"
                  onKeyDown={(e) => e.key === "Enter" && submitWord()}
                />
                <select className="input" value={newCat} onChange={(e) => setNewCat(e.target.value as Category)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button className="btn btn-gold" onClick={submitWord}>
                  إضافة
                </button>
              </div>
              {err && <div className="err">{err}</div>}

              <div className="add-row">
                <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث لحذف كلمة" />
                <button className="btn btn-ghost" onClick={exportJSON}>
                  تصدير JSON
                </button>
                <button className="btn btn-ghost" onClick={exportCSV}>
                  تصدير CSV
                </button>
              </div>

              <ul className="word-list">
                {results.map((x) => (
                  <li key={x.w}>
                    <span>{x.w}</span>
                    <span className="muted">{x.c}</span>
                    <button className="btn btn-ghost danger" onClick={() => deleteWord(x.w)}>
                      حذف
                    </button>
                  </li>
                ))}
                {results.length === 0 && <li className="muted">لا توجد كلمة مطابقة. جرّب جزءاً من الكلمة.</li>}
              </ul>
            </>
          )}

          {tab === "cats" && (
            <>
              <p className="muted">اختر المجالات التي تدخل قرعة المباراة القادمة. المتاح الآن: {playableCount} كلمة.</p>
              <div className="cat-grid">
                {Object.keys(catCounts).map((c) => {
                  const category = c as Category;
                  const on = !offCategories.includes(category);
                  return (
                    <button
                      key={c}
                      className={"cat" + (on ? " on" : "")}
                      onClick={() => toggleCategory(category)}
                      aria-pressed={on}
                    >
                      <span>{c}</span>
                      <span className="cat-n">{catCounts[category]}</span>
                    </button>
                  );
                })}
              </div>
              {playableCount === 0 && (
                <div className="err">لا يمكن بدء مباراة بلا مجالات. فعّل مجالاً واحداً على الأقل.</div>
              )}
            </>
          )}

          {tab === "set" && (
            <>
              {SETTINGS_FIELDS.map((f) => (
                <div className="adj" key={f.k}>
                  <span>{f.l}</span>
                  <input
                    className="input num"
                    type="number"
                    min={f.min}
                    max={f.max}
                    value={settings[f.k]}
                    onChange={(e) => {
                      const v = Math.min(f.max, Math.max(f.min, Number(e.target.value) || f.min));
                      setSettings({ ...settings, [f.k]: v });
                    }}
                  />
                </div>
              ))}
              <p className="muted">تُطبَّق الإعدادات على المباراة القادمة وتُحفظ على هذا الجهاز.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
