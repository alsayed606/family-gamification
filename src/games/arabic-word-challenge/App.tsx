import { useEffect, useRef, useState } from "react";
import { Home } from "./screens/Home";
import { Play } from "./screens/Play";
import { Results } from "./screens/Results";
import { AdminPanel } from "./admin/AdminPanel";
import { useSound } from "./hooks/useSound";
import { useSettings } from "./hooks/useSettings";
import { useWordBank } from "./hooks/useWordBank";
import { useGameEngine } from "./hooks/useGameEngine";
import { download } from "./lib/download";

import "./styles.css";

type Screen = "home" | "play" | "results";

export type ArabicWordChallengeProps = {
  /**
   * هل يملك المستخدم صلاحية إدارة محتوى اللعبة (بنك الكلمات والإعدادات)؟
   *
   * ⚠️ حاجز تجربة لا حاجز أمني: بنك الكلمات في localStorage على هذا الجهاز،
   * وأي شخص يفتح أدوات المطوّر يعدّله. الغرض أن يمنع طفلًا من العبث ببنك
   * الكلمات على شاشة الاستضافة المشتركة، لا أن يحمي بيانات.
   * يصبح حاجزًا حقيقيًا حين ينتقل البنك إلى Firestore.
   */
  canManage: boolean;
  /** العودة إلى قائمة الألعاب. */
  onExit: () => void;
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700" +
  "&family=Tajawal:wght@400;500;700;800&display=swap";

/**
 * يحمّل خطوط اللعبة عند فتحها فقط، وبلا أن يتوقّف عليها شيء.
 *
 * لا تُستورد بـ @import داخل styles.css: فيت يسبق تحميل CSS الحزم الكسولة
 * وينتظر نجاحه، فكان فشل طلب الخطوط (مانع إعلانات أو شبكة تحجب Google
 * Fonts) يُسقط مسار اللعبة كاملًا برسالة خطأ. هنا فشل الطلب لا يفعل شيئًا:
 * تعمل اللعبة بالخطوط البديلة.
 */
function useGameFonts() {
  useEffect(() => {
    if (document.querySelector(`link[data-awc-fonts]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    link.setAttribute("data-awc-fonts", "");
    document.head.appendChild(link);
  }, []);
}

export default function App({ canManage, onExit }: ArabicWordChallengeProps) {
  useGameFonts();

  const [screen, setScreen] = useState<Screen>("home");
  const [sound, setSound] = useState(true);
  const [admin, setAdmin] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const sfx = useSound(sound);
  const { settings, setSettings, ready: settingsReady } = useSettings();
  const wordBank = useWordBank();
  const {
    ready: bankReady,
    bank,
    playable,
    catCounts,
    offCategories,
    toggleCategory,
    addWord,
    deleteWord,
    history,
    recordMatch,
    clearHistory,
  } = wordBank;

  const engine = useGameEngine({
    settings,
    sfx,
    onFinish: (record) => {
      recordMatch(record);
      setScreen("results");
    },
  });

  const ready = settingsReady && bankReady;
  const catCount = Object.keys(catCounts).length - offCategories.length;

  const startMatch = () => {
    engine.startMatch(playable);
    setScreen("play");
  };

  const resetToHome = () => setScreen("home");

  useEffect(() => {
    if (screen !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") engine.buzz(0);
      if (e.key === "2") engine.buzz(1);
      if (e.key === "Escape") setAdmin((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, engine]);

  const toggleFullscreen = () => {
    const el = stageRef.current || document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const exportJSON = () => download("word-bank.json", JSON.stringify(bank, null, 2), "application/json");
  const exportCSV = () =>
    download(
      "word-bank.csv",
      "﻿" + "الكلمة,المجال\n" + bank.map((x) => `${x.w},${x.c}`).join("\n"),
      "text/csv;charset=utf-8"
    );

  return (
    <div className="awc" dir="rtl" ref={stageRef}>
      {screen === "home" && (
        <Home
          teams={engine.teams}
          setTeams={engine.setTeams}
          start={startMatch}
          settings={settings}
          bankSize={playable.length}
          catCount={catCount}
          sound={sound}
          setSound={setSound}
          openAdmin={canManage ? () => setAdmin(true) : undefined}
          onExit={onExit}
          ready={ready}
          historyCount={history.length}
        />
      )}

      {screen === "play" && engine.current && (
        <Play
          engine={engine}
          settings={settings}
          sound={sound}
          setSound={setSound}
          openAdmin={canManage ? () => setAdmin(true) : undefined}
          onExit={onExit}
          toggleFullscreen={toggleFullscreen}
        />
      )}

      {screen === "results" && (
        <Results
          teams={engine.teams}
          teamName={engine.teamName}
          settings={settings}
          again={startMatch}
          home={resetToHome}
          history={history}
        />
      )}

      {admin && (
        <AdminPanel
          close={() => setAdmin(false)}
          bank={bank}
          addWord={addWord}
          deleteWord={deleteWord}
          exportJSON={exportJSON}
          exportCSV={exportCSV}
          settings={settings}
          setSettings={setSettings}
          catCounts={catCounts}
          offCategories={offCategories}
          toggleCategory={toggleCategory}
          playableCount={playable.length}
          teams={engine.teams}
          teamName={engine.teamName}
          adjustScore={engine.adjustScore}
          inMatch={screen === "play"}
          newMatch={() => {
            setAdmin(false);
            startMatch();
          }}
          history={history}
          clearHistory={clearHistory}
        />
      )}
    </div>
  );
}
