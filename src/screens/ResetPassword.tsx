import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Field } from "../components/Field";
import { Banner } from "../components/Banner";
import { requestPasswordReset } from "../auth/actions";
import { authErrorMessage } from "../lib/authErrors";
import { validateEmail } from "../lib/validation";

export function ResetPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const err = validateEmail(email);
    setFieldError(err);
    if (err) return;

    setBusy(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      // خطأ "بريد غير مسجّل" لا يُعرض: كشفه يتيح لمهاجم استكشاف البُرد
      // المسجّلة. نُظهر النجاح نفسه في الحالتين، ونُبقي أخطاء الشبكة
      // والحدود ظاهرة لأنها لا تكشف شيئًا عن وجود الحساب.
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        setSent(true);
      } else {
        setFormError(authErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="center-screen">
        <div className="card form-card">
          <div className="form-head">
            <span className="logo-emoji">📮</span>
            <h1>تحقّق من بريدك</h1>
          </div>
          <Banner kind="success">
            إن كان <strong dir="ltr">{email.trim()}</strong> مسجّلًا لدينا،
            فقد أُرسل إليه رابط لإعادة تعيين كلمة المرور.
          </Banner>
          <p className="muted small">
            لم تصلك الرسالة؟ تحقّق من البريد المزعج، أو تأكّد من صحة العنوان.
          </p>
          <Link className="btn btn-block" to="/login">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="center-screen">
      <form className="card form-card" onSubmit={onSubmit} noValidate>
        <div className="form-head">
          <span className="logo-emoji">🔑</span>
          <h1>استعادة كلمة المرور</h1>
          <p className="muted">أدخل بريدك وسنرسل رابط إعادة التعيين.</p>
        </div>

        {formError && <Banner kind="error">{formError}</Banner>}

        <Field
          label="البريد الإلكتروني"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError}
          disabled={busy}
        />

        <button className="btn btn-block" type="submit" disabled={busy}>
          {busy ? "جارٍ الإرسال…" : "إرسال الرابط"}
        </button>

        <div className="form-links">
          <Link to="/login">العودة لتسجيل الدخول</Link>
        </div>
      </form>
    </div>
  );
}
