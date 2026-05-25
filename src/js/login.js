// ============================================================
//  login.js
//  نظام الدخول (Login Screen, PIN Modal)
// ============================================================

import { $, $$, toast } from "./ui-utils.js";
import { COLLECTIONS, listenCollection } from "./firebase-config.js";

let pinBuffer = "";
let pinResolver = null;

// ============================================================
//  Render Login Screen
// ============================================================
export function renderLoginAvatars(users, onSelect) {
  const wrap = $("#login-avatars");
  if (!users.length) {
    wrap.innerHTML = `<p class="muted" style="grid-column:1/-1;text-align:center">
      لا يوجد أفراد بعد. ادخل كـ "الإدارة" لإضافة أفراد العائلة.</p>`;
    return;
  }
  
  wrap.innerHTML = users.map(u => `
    <div class="avatar-card" data-uid="${u.id}" data-pin="${u.pin || ""}">
      <span class="emoji">${u.avatar || "🙂"}</span>
      <div class="nm">${u.name || "—"}</div>
      <small class="muted">مستوى ${u.level || 1}</small>
    </div>`).join("");

  $$(".avatar-card", wrap).forEach(card => {
    card.addEventListener("click", () => {
      const uid = card.dataset.uid;
      const pin = card.dataset.pin;
      if (pin) {
        openPin("أدخل رمزك", (entered) => {
          if (entered === pin) { onSelect(uid); return true; }
          toast("رمز غير صحيح"); return false;
        });
      } else {
        onSelect(uid);
      }
    });
  });
}

export function setupLoginListener(onUsersUpdate) {
  return listenCollection(COLLECTIONS.users, onUsersUpdate, { orderField: "name", dir: "asc" });
}

// ============================================================
//  PIN Modal
// ============================================================
export function openPin(title, onSubmit) {
  pinBuffer = "";
  pinResolver = onSubmit;
  $("#pin-title").textContent = title;
  renderPinDots();
  $("#pin-modal").hidden = false;
}

export function closePin() {
  $("#pin-modal").hidden = true;
  pinBuffer = "";
  pinResolver = null;
}

function renderPinDots() {
  $("#pin-dots").innerHTML = "1234".split("")
    .map((_, i) => `<i class="${i < pinBuffer.length ? "on" : ""}"></i>`).join("");
}

export function setupPinPad() {
  $$("#pin-modal .pin-pad button").forEach(b => {
    b.addEventListener("click", () => {
      const act = b.dataset.act;
      if (act === "clear") pinBuffer = pinBuffer.slice(0, -1);
      else if (act === "ok") {
        if (pinResolver && pinResolver(pinBuffer)) closePin();
      } else if (!act && pinBuffer.length < 4) {
        pinBuffer += b.textContent.trim();
      }
      renderPinDots();
    });
  });
  $('[data-act="close-pin"]').addEventListener("click", closePin);
}
