import type { Dispatch, SetStateAction } from "react";
import type { Settings, Team, TeamIndex } from "../types";

type HomeProps = {
  teams: [Team, Team];
  setTeams: Dispatch<SetStateAction<[Team, Team]>>;
  start: () => void;
  settings: Settings;
  bankSize: number;
  catCount: number;
  sound: boolean;
  setSound: (v: boolean) => void;
  openAdmin?: (() => void) | undefined;
  onExit: () => void;
  ready: boolean;
  historyCount: number;
};

export function Home({
  teams,
  setTeams,
  start,
  settings,
  bankSize,
  catCount,
  sound,
  setSound,
  openAdmin,
  onExit,
  ready,
  historyCount,
}: HomeProps) {
  const setName = (i: TeamIndex, v: string) =>
    setTeams((t) => {
      const next: [Team, Team] = [{ ...t[0] }, { ...t[1] }];
      next[i] = { ...next[i], name: v };
      return next;
    });

  return (
    <section className="home">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          {["ت", "ح", "د", "ي"].map((c, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>
              {c}
            </span>
          ))}
        </div>
        <h1>تحدي الكلمات العربية</h1>
        <p className="tagline">حروف مبعثرة، ستون ثانية، وفريق واحد يصل أولاً.</p>
      </div>

      <div className="setup">
        <div className="field">
          <label htmlFor="t1">اسم الفريق الأول</label>
          <input
            id="t1"
            className="input blue-line"
            value={teams[0].name}
            onChange={(e) => setName(0, e.target.value)}
            placeholder="اكتب الاسم"
            maxLength={24}
          />
        </div>
        <div className="vs">ضد</div>
        <div className="field">
          <label htmlFor="t2">اسم الفريق الثاني</label>
          <input
            id="t2"
            className="input red-line"
            value={teams[1].name}
            onChange={(e) => setName(1, e.target.value)}
            placeholder="اكتب الاسم"
            maxLength={24}
          />
        </div>
      </div>

      <button className="btn btn-gold btn-lg" onClick={start} disabled={!ready || bankSize === 0}>
        {!ready ? "جارٍ التحميل…" : bankSize === 0 ? "فعّل مجالاً واحداً على الأقل" : "ابدأ المباراة"}
      </button>

      <ul className="rules">
        <li>
          <b>{settings.rounds}</b> جولات، لكل جولة <b>{settings.seconds}</b> ثانية.
        </li>
        <li>
          يضغط الفريق زر الجرس أولاً، ثم يجيب خلال <b>{settings.answerWindow}</b> ثانية.
        </li>
        <li>
          الإجابة الصحيحة <b>{settings.points}</b> نقاط، والخاطئة تُفقد الفريق دوره في الجولة.
        </li>
        <li>
          القرعة تسحب من <b>{bankSize}</b> كلمة في <b>{catCount}</b> مجالاً، بلا تكرار داخل المباراة.
        </li>
        <li>
          مجالات <b>مدن سعودية</b> و<b>دول</b> و<b>أكلات شعبية</b> مفعّلة، ويمكن إيقاف أيٍّ منها من لوحة
          المشرف.
        </li>
        <li>
          على الحاسوب: مفتاح <b>1</b> جرس الفريق الأول، ومفتاح <b>2</b> للثاني.
        </li>
      </ul>

      <div className="home-tools">
        <button className="btn btn-ghost" onClick={onExit}>
          ← الألعاب
        </button>
        {openAdmin && (
          <button className="btn btn-ghost" onClick={openAdmin}>
            لوحة المشرف
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => setSound(!sound)}>
          {sound ? "كتم الصوت" : "تشغيل الصوت"}
        </button>
        {historyCount > 0 && <span className="muted">سجل المباريات: {historyCount}</span>}
      </div>
    </section>
  );
}
