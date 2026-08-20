import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../auth/useAuth";
import { useProfiles } from "../hooks/useProfiles";
import {
  createProfile,
  deleteProfile,
  updateProfileDoc,
} from "../lib/profiles";
import { Field } from "../components/Field";
import { Banner } from "../components/Banner";
import { AvatarPicker, DEFAULT_AVATAR } from "../components/AvatarPicker";
import { Spinner } from "../components/Spinner";
import { authErrorMessage } from "../lib/authErrors";
import { validateDisplayName } from "../lib/validation";
import { AGE_BANDS, type AgeBand, type ChildProfile } from "../types";

export function Account() {
  const { user, profile } = useAuth();
  const { profiles, loading } = useProfiles(user?.uid);

  return (
    <div className="page">
      <header className="topbar">
        <div className="tb-user">
          <span className="tb-avatar">{profile?.avatar ?? "🙂"}</span>
          <div>
            <strong>حسابي</strong>
            <small className="muted">{profile?.displayName}</small>
          </div>
        </div>
        <nav className="tb-actions">
          <Link className="btn-ghost" to="/hub">
            الألعاب
          </Link>
        </nav>
      </header>

      <main className="wrap stack">
        <GuardianSection />
        <section className="card">
          <h2 className="section-title">👨‍👩‍👧 ملفات الأبناء</h2>
          <p className="muted small">
            ملفات للعرض داخل حسابك — بلا بريد ولا كلمة مرور للطفل. تبديل الملف
            لا يغيّر أي صلاحية: كل الصلاحيات تبقى صلاحيات حسابك.
          </p>
          {loading ? (
            <Spinner label="جارٍ التحميل…" />
          ) : (
            <ProfileList uid={user!.uid} profiles={profiles} />
          )}
        </section>
      </main>
    </div>
  );
}

/* ── ملف ولي الأمر ─────────────────────────────────────────── */

function GuardianSection() {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar ?? DEFAULT_AVATAR);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const dirty =
    displayName !== (profile?.displayName ?? "") ||
    avatar !== (profile?.avatar ?? "");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const err = validateDisplayName(displayName);
    setFieldError(err);
    if (err || !user) return;

    setBusy(true);
    try {
      // الدور والحالة والمعرّف غير مذكورة عمدًا: القاعدة تشترط بقاءها
      // كما هي، والدمج يُبقيها من المستند الحالي.
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
        avatar,
      });
      setSaved(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit} noValidate>
      <h2 className="section-title">👤 ملفي</h2>

      {error && <Banner kind="error">{error}</Banner>}
      {saved && !dirty && <Banner kind="success">حُفظت التعديلات.</Banner>}

      <Field
        label="الاسم"
        type="text"
        maxLength={40}
        value={displayName}
        onChange={(e) => {
          setDisplayName(e.target.value);
          setSaved(false);
        }}
        error={fieldError}
        disabled={busy}
      />

      <AvatarPicker
        value={avatar}
        onChange={(a) => {
          setAvatar(a);
          setSaved(false);
        }}
      />

      <div className="readonly-row">
        <span className="muted">البريد</span>
        <strong dir="ltr">{user?.email}</strong>
      </div>
      <div className="readonly-row">
        <span className="muted">الدور</span>
        <span className="tag">
          {profile?.role === "admin" ? "مدير" : "عضو"}
        </span>
      </div>

      <button className="btn btn-block" type="submit" disabled={busy || !dirty}>
        {busy ? "جارٍ الحفظ…" : "حفظ"}
      </button>
    </form>
  );
}

/* ── قائمة ملفات الأبناء ───────────────────────────────────── */

function ProfileList({
  uid,
  profiles,
}: {
  uid: string;
  profiles: ChildProfile[];
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(p: ChildProfile) {
    if (!window.confirm(`حذف ملف «${p.displayName}»؟`)) return;
    setError(null);
    try {
      await deleteProfile(uid, p.id);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }

  return (
    <div className="stack">
      {error && <Banner kind="error">{error}</Banner>}

      {profiles.length === 0 && !adding && (
        <p className="muted small">لا توجد ملفات بعد.</p>
      )}

      <ul className="profile-list">
        {profiles.map((p) =>
          editing === p.id ? (
            <li key={p.id}>
              <ProfileForm
                uid={uid}
                existing={p}
                onDone={() => setEditing(null)}
              />
            </li>
          ) : (
            <li key={p.id} className="profile-row">
              <span className="profile-avatar">{p.avatar}</span>
              <div className="profile-meta">
                <strong>{p.displayName}</strong>
                {p.ageBand && (
                  <small className="muted">
                    {AGE_BANDS.find((b) => b.value === p.ageBand)?.label}
                  </small>
                )}
              </div>
              <div className="profile-actions">
                <button className="btn-ghost" onClick={() => setEditing(p.id)}>
                  تعديل
                </button>
                <button className="btn-ghost danger" onClick={() => remove(p)}>
                  حذف
                </button>
              </div>
            </li>
          )
        )}
      </ul>

      {adding ? (
        <ProfileForm uid={uid} onDone={() => setAdding(false)} />
      ) : (
        <button className="btn btn-block" onClick={() => setAdding(true)}>
          + إضافة ملف
        </button>
      )}
    </div>
  );
}

/* ── نموذج إضافة/تعديل ملف ─────────────────────────────────── */

function ProfileForm({
  uid,
  existing,
  onDone,
}: {
  uid: string;
  existing?: ChildProfile;
  onDone: () => void;
}) {
  const [displayName, setDisplayName] = useState(existing?.displayName ?? "");
  const [avatar, setAvatar] = useState(existing?.avatar ?? "🧒");
  const [ageBand, setAgeBand] = useState<AgeBand | "">(existing?.ageBand ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const err = validateDisplayName(displayName);
    setFieldError(err);
    if (err) return;

    setBusy(true);
    try {
      const input = {
        displayName,
        avatar,
        ageBand: ageBand === "" ? undefined : ageBand,
      };
      if (existing) await updateProfileDoc(uid, existing.id, input);
      else await createProfile(uid, input);
      onDone();
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form className="card inner-card stack" onSubmit={onSubmit} noValidate>
      <strong>{existing ? "تعديل الملف" : "ملف جديد"}</strong>

      {error && <Banner kind="error">{error}</Banner>}

      <Field
        label="الاسم"
        type="text"
        maxLength={40}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        error={fieldError}
        disabled={busy}
        autoFocus
      />

      <div className="field">
        <label htmlFor={`age-${existing?.id ?? "new"}`}>الفئة العمرية</label>
        <select
          id={`age-${existing?.id ?? "new"}`}
          value={ageBand}
          onChange={(e) => setAgeBand(e.target.value as AgeBand | "")}
          disabled={busy}
        >
          <option value="">غير محدّدة</option>
          {AGE_BANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <AvatarPicker value={avatar} onChange={setAvatar} />

      <div className="row-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "جارٍ الحفظ…" : "حفظ"}
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={onDone}
          disabled={busy}
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
