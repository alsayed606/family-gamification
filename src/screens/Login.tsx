import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { Banner } from "../components/Banner";
import { login } from "../auth/actions";
import { authErrorMessage } from "../lib/authErrors";
import { validateEmail, validatePassword } from "../lib/validation";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const next = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
    setErrors(next);
    if (next.email || next.password) return;

    setBusy(true);
    try {
      await login(email, password);
      // الحارس يعيد التوجيه حسب حالة التوثيق؛ نحترم الوجهة الأصلية إن وُجدت.
      navigate(from ?? "/hub", { replace: true });
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center-screen">
      <form className="card form-card" onSubmit={onSubmit} noValidate>
        <div className="form-head">
          <span className="logo-emoji">🎮</span>
          <h1>مركز الألعاب العائلي</h1>
          <p className="muted">سجّل الدخول للمتابعة</p>
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
          error={errors.email}
          disabled={busy}
        />

        <Field
          label="كلمة المرور"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={busy}
        />

        <button className="btn btn-block" type="submit" disabled={busy}>
          {busy ? "جارٍ الدخول…" : "دخول"}
        </button>

        <div className="form-links">
          <Link to="/reset">نسيت كلمة المرور؟</Link>
          <Link to="/register">إنشاء حساب جديد</Link>
        </div>
      </form>
    </div>
  );
}
