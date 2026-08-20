import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { GAMES } from "../lib/games";

export function Hub() {
  const { profile, isAdmin } = useAuth();

  return (
    <div className="page">
      <header className="topbar">
        <div className="tb-user">
          <span className="tb-avatar">{profile?.avatar || "🙂"}</span>
          <div>
            <strong>{profile?.displayName || "—"}</strong>
            <small className="muted">اختر لعبة للبدء</small>
          </div>
        </div>
        <nav className="tb-actions">
          {isAdmin && (
            <Link className="btn-ghost" to="/admin">
              لوحة التحكم
            </Link>
          )}
          <Link className="btn-ghost" to="/account">
            حسابي
          </Link>
        </nav>
      </header>

      <main className="wrap">
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
      </main>
    </div>
  );
}
