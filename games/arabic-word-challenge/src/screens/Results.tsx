import type { MatchRecord, Settings, Team } from "../types";

type ResultsProps = {
  teams: [Team, Team];
  teamName: (i: 0 | 1) => string;
  settings: Settings;
  again: () => void;
  home: () => void;
  history: MatchRecord[];
};

export function Results({ teams, teamName, settings, again, home, history }: ResultsProps) {
  const tie = teams[0].score === teams[1].score;
  const winner: 0 | 1 = teams[0].score > teams[1].score ? 0 : 1;

  return (
    <section className="results">
      <div className="cup" aria-hidden="true">
        <svg viewBox="0 0 120 140" width="150" height="175">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F6DCA4" />
              <stop offset="100%" stopColor="#B98836" />
            </linearGradient>
          </defs>
          <path d="M30 12h60v34a30 30 0 0 1-60 0z" fill="url(#g)" />
          <path
            d="M30 20H16a16 16 0 0 0 16 22M90 20h14a16 16 0 0 1-16 22"
            fill="none"
            stroke="url(#g)"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <rect x="52" y="76" width="16" height="24" fill="url(#g)" />
          <rect x="34" y="100" width="52" height="12" rx="4" fill="url(#g)" />
          <rect x="26" y="114" width="68" height="14" rx="5" fill="url(#g)" />
        </svg>
      </div>

      <h2 className="verdict">{tie ? "تعادل الفريقين" : `فوز ${teamName(winner)}`}</h2>

      <div className="score-cards">
        {([0, 1] as const).map((i) => (
          <div key={i} className={`score-card ${i === 0 ? "blue" : "red"}${!tie && winner === i ? " win" : ""}`}>
            <div className="sc-name">{teamName(i)}</div>
            <div className="sc-score">{teams[i].score}</div>
            <div className="sc-meta">
              {teams[i].correct} إجابة صحيحة من {settings.rounds}
            </div>
          </div>
        ))}
      </div>

      <div className="home-tools">
        <button className="btn btn-gold btn-lg" onClick={again}>
          مباراة جديدة
        </button>
        <button className="btn btn-ghost" onClick={home}>
          الشاشة الرئيسية
        </button>
      </div>

      {history.length > 1 && (
        <div className="history">
          <h3>مباريات سابقة</h3>
          {history.slice(1, 6).map((h) => (
            <div className="hist-row" key={h.ts}>
              <span>{new Date(h.ts).toLocaleDateString("ar-SA")}</span>
              <span>
                {h.t1} <b>{h.s1}</b> — <b>{h.s2}</b> {h.t2}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
