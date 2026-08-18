// ============================================================
//  app.js
//  منطق التطبيق الرئيسي (Main Controller)
// ============================================================

import { $, $$, toast } from "./ui-utils.js";
import { saveSession, loadSession, clearSession, getAdminPin } from "./auth.js";
import { renderLoginAvatars, setupLoginListener, openPin, setupPinPad } from "./login.js";
import { renderHub, renderDashboard, renderTasks, renderLeaderboard, renderShop, renderAdmin } from "./screens.js";
import { GAMES } from "./games.js";
import { COLLECTIONS, listenDoc } from "./firebase-config.js";

// ============================================================
//  App State
// ============================================================
const State = {
  me: null,
  unsubMe: null,
  isAdmin: false,
};

// ============================================================
//  Initialization
// ============================================================
async function boot() {
  // Setup PIN Pad
  setupPinPad();

  // Setup Navigation (داخل اللعبة الحالية)
  $$(".nav-btn").forEach(b => {
    b.addEventListener("click", () => switchView(b.dataset.view));
  });

  // Setup Admin Login
  $("#btn-admin-login").addEventListener("click", () => {
    openPin("رمز الإدارة", (entered) => {
      if (entered === getAdminPin()) {
        enterApp(loadSession()?.userId || "admin_session", true);
        toast("مرحبًا أيها المدير 👑");
        return true;
      }
      toast("رمز الإدارة خاطئ");
      return false;
    });
  });

  // Listen to Users List
  setupLoginListener((users) => {
    renderLoginAvatars(users, (uid) => enterApp(uid, false));
  });

  // Game Hub controls
  $("#btn-hub").addEventListener("click", showHub);
  $("#btn-hub-logout").addEventListener("click", logout);
  $("#btn-hub-admin").addEventListener("click", openControlPanel);

  // Restore Session
  const s = loadSession();
  if (s?.userId) enterApp(s.userId, !!s.isAdmin);
}

// ============================================================
//  App Entry & Exit
// ============================================================
function enterApp(userId, isAdmin) {
  saveSession(userId, isAdmin);
  State.isAdmin = isAdmin;

  if (State.unsubMe) State.unsubMe();

  State.unsubMe = listenDoc(COLLECTIONS.users, userId, (u) => {
    if (!u) { logout(); return; }
    State.me = u;
    paintTopbar(u);
    paintHubHeader(u);
  });

  $("#screen-login").classList.remove("active");
  $("#nav-admin").hidden = !isAdmin;
  $("#btn-hub-admin").hidden = !isAdmin;
  showHub();
}

function logout() {
  if (State.unsubMe) State.unsubMe();
  State.me = null;
  State.isAdmin = false;
  clearSession();
  $("#app-shell").hidden = true;
  $("#screen-hub").classList.remove("active");
  $("#screen-login").classList.add("active");
}

// ============================================================
//  Game Hub (اختيار اللعبة)
// ============================================================
function showHub() {
  $("#app-shell").hidden = true;
  $("#screen-hub").classList.add("active");
  renderHub($("#hub-grid"), enterGame);
}

function enterGame(gameId) {
  const game = GAMES.find((g) => g.id === gameId);
  if (!game) return;

  if (game.kind === "external") {
    window.open(game.url, "_blank", "noopener");
    return;
  }

  $("#screen-hub").classList.remove("active");
  $("#app-shell").hidden = false;
  switchView(game.view);
}

function openControlPanel() {
  $("#screen-hub").classList.remove("active");
  $("#app-shell").hidden = false;
  switchView("admin");
}

function paintTopbar(u) {
  $("#tb-avatar").textContent = u.avatar || "🙂";
  $("#tb-name").textContent = u.name || "—";
  $("#tb-rank").textContent = `المستوى ${u.level || 1}`;
  $("#tb-coins").textContent = u.coins ?? 0;
  $("#tb-gems").textContent = u.gems ?? 0;
}

function paintHubHeader(u) {
  $("#hub-avatar").textContent = u.avatar || "🙂";
  $("#hub-name").textContent = u.name || "—";
}

// ============================================================
//  Navigation (داخل لعبة المهام والمكافآت)
// ============================================================
function switchView(name) {
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  renderView(name);
}

function renderView(name) {
  const el = $(`#view-${name}`);
  if (el.dataset.built) return;
  el.dataset.built = "1";

  if (name === "dashboard") renderDashboard(el, State.me);
  else if (name === "tasks") renderTasks(el, State.me);
  else if (name === "leaderboard") renderLeaderboard(el);
  else if (name === "shop") renderShop(el);
  else if (name === "admin") renderAdmin(el);

  // Setup Logout Button
  const logoutBtn = $("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// Start App
document.addEventListener("DOMContentLoaded", boot);
