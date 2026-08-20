import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Spinner } from "../components/Spinner";

// تحميل كسول: بنك الكلمات (674 كلمة) ومحرّك اللعبة وأنماطها لا تُنزَّل
// إلا عند فتح اللعبة فعلًا، فلا تُثقل أول تحميل للتطبيق.
const ArabicWordChallenge = lazy(
  () => import("../games/arabic-word-challenge/App")
);

export function ArabicWordChallengeRoute() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <Suspense fallback={<Spinner label="جارٍ تحميل اللعبة…" />}>
      <ArabicWordChallenge
        canManage={isAdmin}
        onExit={() => navigate("/hub")}
      />
    </Suspense>
  );
}
