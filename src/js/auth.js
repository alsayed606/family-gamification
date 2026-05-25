// ============================================================
//  auth.js
//  نظام الجلسة والتسجيل (Session Management)
// ============================================================

const SESSION_KEY = "fam_session_v1";
const ADMIN_PIN = "343516"; // ✅ PIN محدّث

// ============================================================
//  Session Management
// ============================================================

export function saveSession(userId, isAdmin) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, isAdmin }));
}

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAdminPin() {
  return ADMIN_PIN;
}
