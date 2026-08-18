import { useCallback, useEffect, useRef, useState } from "react";
import { shuffleLetters } from "../lib/arabic";
import {
  addLockout,
  applyCorrectAnswer,
  applyScoreAdjustment,
  isAnswerCorrect,
  isRoundExhausted,
} from "../lib/roundLogic";
import type { SoundApi } from "./useSound";
import type { MatchRecord, Outcome, Phase, Settings, Team, TeamIndex, Word } from "../types";

const EMPTY_TEAMS: [Team, Team] = [
  { name: "", score: 0, correct: 0 },
  { name: "", score: 0, correct: 0 },
];

const RESOLVED_PAUSE_MS = 2600;
const REVEAL_TILE_STAGGER_MS = 90;
const REVEAL_TAIL_MS = 400;

export type GameEngine = ReturnType<typeof useGameEngine>;

export function useGameEngine(opts: {
  settings: Settings;
  sfx: SoundApi;
  onFinish: (record: MatchRecord) => void;
}) {
  const { settings, sfx, onFinish } = opts;

  const [teams, setTeams] = useState<[Team, Team]>(EMPTY_TEAMS);
  const [round, setRound] = useState(1);
  const [pool, setPool] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [tiles, setTiles] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("reveal");
  const [mainTime, setMainTime] = useState(settings.seconds);
  const [answerTime, setAnswerTime] = useState(settings.answerWindow);
  const [activeTeam, setActiveTeam] = useState<TeamIndex | null>(null);
  const [lockedOut, setLockedOut] = useState<TeamIndex[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  // قيم تُقرأ داخل الانتقال التلقائي بين الجولات دون أن تُعيد تشغيل الـ effect
  // عند تغيّرها في كل جولة (بخلاف "phase" الذي هو المحرّك الحقيقي للانتقال).
  const poolRef = useRef(pool);
  const roundRef = useRef(round);
  const settingsRef = useRef(settings);
  const teamsRef = useRef(teams);
  poolRef.current = pool;
  roundRef.current = round;
  settingsRef.current = settings;
  teamsRef.current = teams;

  const teamName = useCallback(
    (i: TeamIndex) => teams[i].name.trim() || (i === 0 ? "الفريق الأول" : "الفريق الثاني"),
    [teams]
  );

  const loadRound = useCallback((item: Word) => {
    setCurrent(item);
    setTiles(shuffleLetters(item.w));
    setPhase("reveal");
    setMainTime(settingsRef.current.seconds);
    setAnswerTime(settingsRef.current.answerWindow);
    setActiveTeam(null);
    setLockedOut([]);
    setOutcome(null);
  }, []);

  const startMatch = useCallback(
    (playable: Word[]) => {
      if (playable.length === 0) return;
      const shuffled = [...playable].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, settingsRef.current.rounds);
      setPool(picked);
      setTeams((t) => [
        { ...t[0], score: 0, correct: 0 },
        { ...t[1], score: 0, correct: 0 },
      ]);
      setRound(1);
      loadRound(picked[0]);
    },
    [loadRound]
  );

  const endRound = useCallback((winner: TeamIndex | null) => {
    setOutcome({ ok: winner !== null, team: winner });
    setPhase("resolved");
  }, []);

  const finishMatch = useCallback(() => {
    sfx.finish();
    const t = teamsRef.current;
    onFinish({
      ts: Date.now(),
      t1: teamName(0),
      t2: teamName(1),
      s1: t[0].score,
      s2: t[1].score,
      c1: t[0].correct,
      c2: t[1].correct,
    });
  }, [sfx, onFinish, teamName]);

  /** رفض إجابة الفريق النشط: يخرجه من الجولة، وينهيها إن خرج الفريقان معاً. */
  const rejectAnswer = useCallback(() => {
    if (activeTeam === null) return;
    sfx.wrong();
    const next = addLockout(lockedOut, activeTeam);
    setLockedOut(next);
    setActiveTeam(null);
    if (isRoundExhausted(next)) endRound(null);
    else setPhase("open");
  }, [activeTeam, lockedOut, sfx, endRound]);

  /** كشف الحروف تباعاً ثم فتح الجولة للجرس. */
  useEffect(() => {
    if (phase !== "reveal" || !current) return;
    const timers = tiles.map((_, i) => setTimeout(() => sfx.reveal(), i * REVEAL_TILE_STAGGER_MS));
    const openTimer = setTimeout(
      () => setPhase("open"),
      tiles.length * REVEAL_TILE_STAGGER_MS + REVEAL_TAIL_MS
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(openTimer);
    };
    // tiles/sfx عمداً خارج القائمة: تُضبط معاً مع current في loadRound قبل هذا الـ effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current]);

  /** المؤقت الرئيسي للجولة. */
  useEffect(() => {
    if (phase !== "open") return;
    const id = setInterval(() => setMainTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  /** مؤقت نافذة الإجابة بعد الجرس. */
  useEffect(() => {
    if (phase !== "answering") return;
    const id = setInterval(() => setAnswerTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "open") return;
    if (mainTime > 0 && mainTime <= 10) sfx.tick();
    if (mainTime === 0) endRound(null);
  }, [mainTime, phase, sfx, endRound]);

  useEffect(() => {
    if (phase !== "answering" || answerTime !== 0) return;
    rejectAnswer();
  }, [answerTime, phase, rejectAnswer]);

  /** الانتقال التلقائي للجولة التالية (أو إنهاء المباراة) بعد ظهور النتيجة. */
  useEffect(() => {
    if (phase !== "resolved") return;
    const t = setTimeout(() => {
      if (roundRef.current >= settingsRef.current.rounds) {
        finishMatch();
      } else {
        const nextWord = poolRef.current[roundRef.current];
        setRound((r) => r + 1);
        loadRound(nextWord);
      }
    }, RESOLVED_PAUSE_MS);
    return () => clearTimeout(t);
  }, [phase, finishMatch, loadRound]);

  const buzz = useCallback(
    (i: TeamIndex) => {
      if (phase !== "open" || lockedOut.includes(i)) return;
      sfx.buzz();
      setActiveTeam(i);
      setAnswerTime(settingsRef.current.answerWindow);
      setPhase("answering");
    },
    [phase, lockedOut, sfx]
  );

  const submit = useCallback(
    (answer: string) => {
      if (phase !== "answering" || activeTeam === null) return;
      if (!answer.trim()) return;
      if (current && isAnswerCorrect(answer, current.w)) {
        sfx.correct();
        setTeams((t) => applyCorrectAnswer(t, activeTeam, settingsRef.current.points));
        setOutcome({ ok: true, team: activeTeam });
        setPhase("resolved");
      } else {
        rejectAnswer();
      }
    },
    [phase, activeTeam, current, sfx, rejectAnswer]
  );

  const skipRound = useCallback(() => {
    if (phase === "resolved") return;
    endRound(null);
  }, [phase, endRound]);

  const adjustScore = useCallback((i: TeamIndex, delta: number) => {
    setTeams((t) => applyScoreAdjustment(t, i, delta));
  }, []);

  return {
    teams,
    setTeams,
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
    startMatch,
    buzz,
    submit,
    skipRound,
    adjustScore,
  };
}
