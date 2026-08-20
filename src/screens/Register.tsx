import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { Banner } from "../components/Banner";
import { AvatarPicker, DEFAULT_AVATAR } from "../components/AvatarPicker";
import { register } from "../auth/actions";
import { authErrorMessage } from "../lib/authErrors";
import {
  PASSWORD_MIN,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
} from "../lib/validation";

type Errors = Partial<
  Record<"displayName" | "email" | "password" | "confirm" | "guardian", string>
>;

export function Register() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [isGuardian, setIsGuardian] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const next: Errors = {
      displayName: validateDisplayName(displayName) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirm: validatePasswordConfirm(password, confirm) ?? undefined,
      guardian: isGuardian ? undefined : "أكّد أنك بالغ مسؤول عن هذا الحساب.",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setBusy(true);
    try {
      await register({ displayName, email, password, avatar });
      navigate("/verify", { replace: true });
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
          <span className="logo-emoji">✨</span>
          <h1>حساب جديد</h1>
          <p className="muted">
            الحساب لولي الأمر. يُضاف الأبناء كملفات داخله لاحقًا — بلا بريد لهم.
          </p>
        </div>

        {formError && <Banner kind="error">{formError}</Banner>}

        <Field
          label="الاسم"
          type="text"
          autoComplete="name"
          maxLength={40}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          disabled={busy}
        />

        <Field
          label="البريد الإلكتروني"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          hint="سنرسل إليه رسالة تحقق."
          disabled={busy}
        />

        <Field
          label="كلمة المرور"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={`${PASSWORD_MIN} أحرف فأكثر.`}
          disabled={busy}
        />

        <Field
          label="تأكيد كلمة المرور"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          disabled={busy}
        />

        <AvatarPicker value={avatar} onChange={setAvatar} />

        <div className="field">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isGuardian}
              onChange={(e) => setIsGuardian(e.target.checked)}
              disabled={busy}
            />
            <span>أُقرّ بأنني بالغ ومسؤول عن هذا الحساب ومن يُضاف تحته.</span>
          </label>
          {errors.guardian && (
            <p className="field-error" role="alert">
              {errors.guardian}
            </p>
          )}
        </div>

        <button className="btn btn-block" type="submit" disabled={busy}>
          {busy ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
        </button>

        <div className="form-links">
          <Link to="/login">لديك حساب؟ سجّل الدخول</Link>
        </div>
      </form>
    </div>
  );
}
