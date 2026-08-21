import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { logout } from "../auth/actions";
import { useProfiles } from "../hooks/useProfiles";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { ProfileSwitcher } from "../components/ProfileSwitcher";
import { GAMES } from "../lib/games";

export function Hub() {
  const { user, profile, isAdmin } = useAuth();
  const { profiles, loading: profilesLoading } = useProfiles(user?.uid);
  const { active, activeId, select } = useActiveProfile(
    profile,
    profiles,
    !profilesLoading
  );

  return (
    <div className="page">
      <header className="topbar">
        <div className="tb-user">
          <span className="tb-avatar">{active.avatar}</span>
          <div>
            <strong>{active.displayName}</strong>
            <small className="muted">
              {active.isGuardian
                ? "اختر لعبة للبدء"
                : `ضمن حساب ${profile?.displayName ?? ""}`}
            </small>
          </div>
        </div>
        <nav className="tb-actions">
          {isAdmin && (
            <Link className="btn-ghost" to="/admin">
              لوحة التحكم
            </Link>
          )}
          <Link className="btn-ghost" to="/questions">
            بنك الأسئلة
          </Link>
          <Link className="btn-ghost" to="/account">
            حسابي
          </Link>
          <button className="btn-ghost" onClick={() => void logout()}>
            خروج
          </button>
        </nav>
      </header>

      <main className="wrap stack">
        {profile && (
          <ProfileSwitcher
            guardian={profile}
            profiles={profiles}
            activeId={activeId}
            onSelect={select}
          />
        )}

        <section>
          <h2 className="section-title">🎮 الألعاب</h2>
          <div className="hub-grid">
            {GAMES.map((game) =>
              game.disabledReason ? (
                <div key={game.id} className="hub-card is-disabled" aria-disabled="true">
                  <span className="hub-icon">{game.icon}</span>
                  <h3>{game.name}</h3>
                  <p className="muted">{game.desc}</p>
                  <span className="tag">{game.disabledReason}</span>
                </div>
              ) : game.external ? (
                <a
                  key={game.id}
                  className="hub-card"
                  href={game.to}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="hub-icon">{game.icon}</span>
                  <h3>{game.name}</h3>
                  <p className="muted">{game.desc}</p>
                </a>
              ) : (
                <Link key={game.id} className="hub-card" to={game.to}>
                  <span className="hub-icon">{game.icon}</span>
                  <h3>{game.name}</h3>
                  <p className="muted">{game.desc}</p>
                </Link>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
