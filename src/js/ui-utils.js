// ============================================================
//  ui-utils.js
//  مساعدات واجهة المستخدم (Toasts, Confetti, etc)
// ============================================================

export function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.getElementById("toast-stack").appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

export function confetti(n = 40) {
  const layer = document.getElementById("fx-layer");
  const colors = ["#00e5ff", "#7c3aed", "#ffce4d", "#ff5fa2", "#36e07f"];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("i");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[(Math.random() * colors.length) | 0];
    c.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
    layer.appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
}

// DOM Helpers
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
