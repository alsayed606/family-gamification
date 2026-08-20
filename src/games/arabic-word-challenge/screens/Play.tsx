import { useState } from "react";
import { TeamChip } from "../components/TeamChip";
import type { GameEngine } from "../hooks/useGameEngine";
import type { Settings } from "../types";

type PlayProps = {
  engine: GameEngine;
  settings: Settings;
  sound: boolean;
  setSound: (v: boolean) => void;
  openAdmin?: (() => void) | undefined;
  onExit: () => void;
  toggleFullscreen: () => void;
};

export function Play({ engine, settings, sound, setSound, openAdmin, onExit, toggleFullscreen }: PlayProps) {
  const {
    teams,
    round,
    current,
    tiles,
    phase,
    mainTime,
    answerTime,
    activeTeam,
    lockedOut,
    outcome,
    teamName,
    buzz,
    submit,
    skipRound,
  } = engine;

  const [answer, setAnswer] = useState("");

  if (!current) return null;

  const submitAnswer = () => {
    submit(answer);
    setAnswer("");
  };

  return (
    <section className="play">
      <header className="hud">
        <TeamChip
          color="blue"
          name={teamName(0)}
          score={teams[0].score}
          active={activeTeam === 0}
          out={lockedOut.includes(0)}
          hotkey="1"
        />
        <div className="hud-center">
          <div className="round-label">
            الجولة {round} من {settings.rounds}
          </div>
          <div className={"timer" + (mainTime <= 10 ? " urgent" : "")}>
            {phase === "answering" ? answerTime : mainTime}
          </div>
          <div className="timer-track">
            <div
              className="timer-fill"
              style={{
                width: `${
                  (phase === "answering" ? answerTime / settings.answerWindow : mainTime / settings.seconds) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
        <TeamChip
          color="red"
          name={teamName(1)}
          score={teams[1].score}
          active={activeTeam === 1}
          out={lockedOut.includes(1)}
          hotkey="2"
        />
      </header>

      <main className="board">
        <div className="domain-badge">مجال الكلمة: {current.c}</div>

        <div className="tiles" key={round}>
          {tiles.map((ch, i) => (
            <div className="tile" key={i} style={{ animationDelay: `${i * 0.09}s` }}>
              <span>{ch}</span>
            </div>
          ))}
        </div>

        {phase === "resolved" && (
          <div className={"reveal-word " + (outcome && outcome.ok ? "good" : "miss")}>
            <span className="reveal-label">
              {outcome && outcome.ok ? `إجابة صحيحة — ${teamName(outcome.team!)}` : "انتهت الجولة، الكلمة هي"}
            </span>
            <strong>{current.w}</strong>
          </div>
        )}

        {phase === "answering" && activeTeam !== null && (
          <div className={"answer-panel " + (activeTeam === 0 ? "blue" : "red")}>
            <div className="answer-head">
              دور {teamName(activeTeam)} — أجب خلال {answerTime} ثانية
            </div>
            <div className="answer-row">
              <input
                className="input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                placeholder="اكتب الكلمة"
                autoComplete="off"
                spellCheck={false}
                aria-label="حقل الإجابة"
                autoFocus
              />
              <button className="btn btn-gold" onClick={submitAnswer}>
                إرسال الإجابة
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="buzzers">
        <button
          className="buzz blue"
          onClick={() => buzz(0)}
          disabled={phase !== "open" || lockedOut.includes(0)}
        >
          <span className="buzz-name">{teamName(0)}</span>
          <span className="buzz-hint">{lockedOut.includes(0) ? "استُنفدت المحاولة" : "اضغط الجرس"}</span>
        </button>
        <div className="host-tools">
          <button className="btn btn-ghost" onClick={skipRound}>
            تخطي الجولة
          </button>
          {openAdmin && (
            <button className="btn btn-ghost" onClick={openAdmin}>
              لوحة المشرف
            </button>
          )}
          <button className="btn btn-ghost" onClick={onExit}>
            ← الألعاب
          </button>
          <button className="btn btn-ghost" onClick={toggleFullscreen}>
            ملء الشاشة
          </button>
          <button className="btn btn-ghost" onClick={() => setSound(!sound)}>
            {sound ? "كتم الصوت" : "تشغيل الصوت"}
          </button>
        </div>
        <button
          className="buzz red"
          onClick={() => buzz(1)}
          disabled={phase !== "open" || lockedOut.includes(1)}
        >
          <span className="buzz-name">{teamName(1)}</span>
          <span className="buzz-hint">{lockedOut.includes(1) ? "استُنفدت المحاولة" : "اضغط الجرس"}</span>
        </button>
      </footer>

      {phase === "answering" && activeTeam !== null && (
        <div className={"stage-glow " + (activeTeam === 0 ? "blue" : "red")} />
      )}
    </section>
  );
}
