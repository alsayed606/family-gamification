import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banner } from "../components/Banner";
import { useAuth } from "../auth/useAuth";
import {
  logout,
  refreshVerificationState,
  resendVerification,
} from "../auth/actions";
import { authErrorMessage } from "../lib/authErrors";

const RESEND_COOLDOWN_SEC = 60;

export function Verify() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notVerifiedYet, setNotVerifiedYet] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const check = useCallback(
    async (silent: boolean) => {
      setChecking(true);
      setError(null);
      try {
        const verified = await refreshVerificationState();
        if (verified) {
          navigate("/hub", { replace: true });
        } else if (!silent) {
          setNotVerifiedYet(true);
        }
      } catch (err) {
        if (!silent) setError(authErrorMessage(err));
      } finally {
        setChecking(false);
      }
    },
    [navigate]
  );

  // التوثيق يقع في تبويب البريد، ولا يعلم هذا التبويب به. الفحص عند عودة
  // التركيز يجعل الانتقال تلقائيًا لمن يبدّل التبويب ثم يعود.
  useEffect(() => {
    const onFocus = () => void check(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [check]);

  async function onResend() {
    setSending(true);
    setError(null);
    setNotice(null);
    try {
      await resendVerification();
      setNotice("أُرسلت رسالة تحقق جديدة. تحقّق من صندوق الوارد والبريد المزعج.");
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="center-screen">
      <div className="card form-card">
        <div className="form-head">
          <span className="logo-emoji">📧</span>
          <h1>وثّق بريدك</h1>
          <p className="muted">
            أرسلنا رابط تحقق إلى <strong dir="ltr">{user?.email}</strong>
          </p>
        </div>

        {error && <Banner kind="error">{error}</Banner>}
        {notice && <Banner kind="success">{notice}</Banner>}
        {notVerifiedYet && !error && (
          <Banner kind="info">
            لم يُوثّق البريد بعد. افتح الرابط في الرسالة ثم اضغط «تحقّقت».
          </Banner>
        )}

        <p className="muted small">
          افتح الرسالة واضغط الرابط، ثم عد إلى هنا. تُفتح بقية أقسام النظام بعد
          التوثيق.
        </p>

        <button
          className="btn btn-block"
          onClick={() => void check(false)}
          disabled={checking}
        >
          {checking ? "جارٍ التحقق…" : "تحقّقت — تابع"}
        </button>

        <button
          className="btn-ghost btn-block"
          onClick={onResend}
          disabled={sending || cooldown > 0}
        >
          {cooldown > 0
            ? `إعادة الإرسال بعد ${cooldown} ثانية`
            : sending
              ? "جارٍ الإرسال…"
              : "إعادة إرسال الرسالة"}
        </button>

        <div className="form-links">
          <button
            type="button"
            className="link-button"
            onClick={() => void logout()}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
