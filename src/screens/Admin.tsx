import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useUsers } from "../hooks/useUsers";
import { setUserRole, setUserStatus } from "../lib/admin";
import { Banner } from "../components/Banner";
import { Spinner } from "../components/Spinner";
import { authErrorMessage } from "../lib/authErrors";
import type { UserDoc } from "../types";

export function Admin() {
  const { user, isAdmin } = useAuth();
  const { users, loading, error } = useUsers(isAdmin);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const admins = users.filter((u) => u.role === "admin").length;

  async function run(uid: string, fn: () => Promise<void>) {
    setActionError(null);
    setBusyUid(uid);
    try {
      await fn();
    } catch (err) {
      setActionError(authErrorMessage(err));
    } finally {
      setBusyUid(null);
    }
  }

  function toggleRole(u: UserDoc) {
    const next = u.role === "admin" ? "member" : "admin";
    const msg =
      next === "admin"
        ? `ترقية «${u.displayName}» إلى مدير؟ سيتمكّن من إدارة كل المستخدمين.`
        : `تنزيل «${u.displayName}» إلى عضو؟ سيفقد صلاحيات الإدارة.`;
    if (!window.confirm(msg)) return;
    void run(u.uid, () => setUserRole(u.uid, next));
  }

  function toggleStatus(u: UserDoc) {
    const next = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const msg =
      next === "SUSPENDED"
        ? `إيقاف «${u.displayName}»؟ لن يستطيع استخدام النظام حتى تُعيد تفعيله.`
        : `إعادة تفعيل «${u.displayName}»؟`;
    if (!window.confirm(msg)) return;
    void run(u.uid, () => setUserStatus(u.uid, next));
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="tb-user">
          <span className="tb-avatar">🛡️</span>
          <div>
            <strong>لوحة التحكم</strong>
            <small className="muted">
              {users.length} مستخدم · {admins} مدير
            </small>
          </div>
        </div>
        <nav className="tb-actions">
          <Link className="btn-ghost" to="/hub">
            الألعاب
          </Link>
        </nav>
      </header>

      <main className="wrap stack">
        {error && (
          <Banner kind="error">تعذّر تحميل المستخدمين ({error}).</Banner>
        )}
        {actionError && <Banner kind="error">{actionError}</Banner>}

        <p className="muted small">
          لا يمكنك تعديل دور حسابك أو حالته — الخادم يرفض ذلك. هذا ما يمنع
          بقاء النظام بلا مدير.
        </p>

        {loading ? (
          <Spinner label="جارٍ تحميل المستخدمين…" />
        ) : (
          <ul className="user-list">
            {users.map((u) => {
              const isSelf = u.uid === user?.uid;
              const busy = busyUid === u.uid;
              return (
                <li
                  key={u.uid}
                  className={
                    "user-row" +
                    (isSelf ? " is-self" : "") +
                    (u.status === "SUSPENDED" ? " is-suspended" : "")
                  }
                >
                  <span className="user-avatar">{u.avatar}</span>

                  <div className="user-meta">
                    <strong>
                      {u.displayName}
                      {isSelf && <span className="self-tag">أنت</span>}
                    </strong>
                    <small className="muted" dir="ltr">
                      {u.email}
                    </small>
                    <div className="badges">
                      <span
                        className={
                          "badge " + (u.role === "admin" ? "badge-gold" : "")
                        }
                      >
                        {u.role === "admin" ? "مدير" : "عضو"}
                      </span>
                      {u.status === "SUSPENDED" && (
                        <span className="badge badge-danger">موقوف</span>
                      )}
                    </div>
                  </div>

                  <div className="user-actions">
                    {isSelf ? (
                      <span className="muted small">حسابك</span>
                    ) : (
                      <>
                        <button
                          className="btn-ghost"
                          onClick={() => toggleRole(u)}
                          disabled={busy}
                        >
                          {u.role === "admin" ? "تنزيل لعضو" : "ترقية لمدير"}
                        </button>
                        <button
                          className={
                            "btn-ghost" +
                            (u.status === "ACTIVE" ? " danger" : "")
                          }
                          onClick={() => toggleStatus(u)}
                          disabled={busy}
                        >
                          {u.status === "ACTIVE" ? "إيقاف" : "تفعيل"}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
