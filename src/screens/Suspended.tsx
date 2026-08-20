import { useAuth } from "../auth/useAuth";
import { logout } from "../auth/actions";
import { Banner } from "../components/Banner";

export function Suspended() {
  const { profile, user } = useAuth();

  return (
    <div className="center-screen">
      <div className="card form-card">
        <div className="form-head">
          <span className="logo-emoji">⛔</span>
          <h1>الحساب موقوف</h1>
        </div>

        <Banner kind="error">
          أوقف المدير حساب <strong>{profile?.displayName ?? user?.email}</strong>.
          راجعه لإعادة التفعيل.
        </Banner>

        <p className="muted small">
          تبقى بياناتك وملفات أبنائك كما هي — الإيقاف يمنع الاستخدام ولا يحذف
          شيئًا. تُستعاد صلاحيتك فور إعادة التفعيل دون الحاجة لتسجيل دخول جديد.
        </p>

        <button className="btn btn-block" onClick={() => void logout()}>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
