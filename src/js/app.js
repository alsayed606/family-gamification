// ============================================================
//  app.js
//  منطق التطبيق الرئيسي (Main Controller)
// ============================================================

import { $, $$, toast } from "./ui-utils.js";
import { saveSession, loadSession, clearSession, getAdminPin } from "./auth.js";
import { renderLoginAvatars, setupLoginListener, openPin, setupPinPad } from "./login.js";
import { renderDashboard, renderTasks, renderLeaderboard, renderShop, renderAdmin } from "./screens.js";
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

  // Setup Navigation
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
  });

  $("#screen-login").classList.remove("active");
  $("#app-shell").hidden = false;
  $("#nav-admin").hidden = !isAdmin;
  switchView("dashboard");
}

function logout() {
  if (State.unsubMe) State.unsubMe();
  State.me = null;
  State.isAdmin = false;
  clearSession();
  $("#app-shell").hidden = true;
  $("#screen-login").classList.add("active");
}

function paintTopbar(u) {
  $("#tb-avatar").textContent = u.avatar || "🙂";
  $("#tb-name").textContent = u.name || "—";
  $("#tb-rank").textContent = `المستوى ${u.level || 1}`;
  $("#tb-coins").textContent = u.coins ?? 0;
  $("#tb-gems").textContent = u.gems ?? 0;
}

// ============================================================
//  Navigation
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
