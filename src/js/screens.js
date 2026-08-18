// ============================================================
//  screens.js
//  رسم الشاشات (Dashboard, Tasks, Leaderboard, etc)
// ============================================================

import { $, $$, toast, confetti } from "./ui-utils.js";
import {
  COLLECTIONS,
  listenCollection,
  listenDoc,
  incrementField,
  createDoc,
  setDocById,
} from "./firebase-config.js";
import { GAMES } from "./games.js";

// ============================================================
//  Game Hub Screen (اختيار اللعبة)
// ============================================================
export function renderHub(el, onSelect) {
  el.innerHTML = GAMES.map((g) => `
    <div class="game-card" data-game="${g.id}">
      <span class="emoji">${g.icon}</span>
      <div class="nm">${g.name}</div>
      <p class="desc">${g.desc}</p>
      ${g.kind === "external" ? '<span class="badge">تبويب جديد</span>' : ""}
    </div>
  `).join("");

  $$(".game-card", el).forEach((card) => {
    card.addEventListener("click", () => onSelect(card.dataset.game));
  });
}

// ============================================================
//  Dashboard Screen
// ============================================================
export function renderDashboard(el, user) {
  if (!user) return;

  const nextXP = (user.level || 1) * 100;
  const xpPercent = ((user.xp || 0) / nextXP) * 100;

  el.innerHTML = `
    <div class="section-title">الرئيسية</div>
    
    <div class="card">
      <h3>صيف 2026 ☀️</h3>
      <p class="muted">الموسم الصيفي العائلي</p>
    </div>

    <div class="card">
      <div class="row" style="margin-bottom: 10px;">
        <div>
          <strong style="font-size: 24px;">${user.xp || 0} <small style="font-size: 12px;">XP</small></strong>
          <p class="muted" style="margin: 0; font-size: 12px;">نقاط الخبرة</p>
        </div>
        <div style="text-align: center;">
          <div style="font-weight: 900; font-size: 18px;">المستوى</div>
          <div style="font-weight: 900; font-size: 32px; color: var(--neon);">${user.level || 1}</div>
        </div>
      </div>
      <div class="xp-bar">
        <small class="muted">إلى المستوى التالي: ${nextXP} XP</small>
        <div class="progress"><span style="width: ${xpPercent}%"></span></div>
      </div>
    </div>

    <div class="card">
      <div class="row" style="font-weight: 800;">
        <span><i class="fa-solid fa-coins" style="color: var(--gold)"></i> ${user.coins ?? 0} كوينز</span>
        <span><i class="fa-solid fa-gem" style="color: var(--gem)"></i> ${user.gems ?? 0} جواهر</span>
      </div>
    </div>

    <div class="card">
      <h4 style="margin: 0 0 6px; font-weight: 800;">🔥 السلسلة اليومية</h4>
      <span class="streak-badge">${user.streak || 0} أيام متتالية</span>
    </div>

    <button class="btn" style="width: 100%; margin-top: 10px;" id="btn-logout">
      <i class="fa-solid fa-sign-out-alt"></i> تسجيل الخروج
    </button>
  `;
}

// ============================================================
//  Tasks Screen
// ============================================================
export function renderTasks(el, user) {
  el.innerHTML = `
    <div class="section-title">المهام</div>
    <div class="card"><p class="muted">جاري التحميل...</p></div>
  `;

  listenCollection(COLLECTIONS.tasks, (tasks) => {
    let html = '<div class="section-title">المهام</div>';
    
    if (!tasks.length) {
      html += '<div class="card"><p class="muted">لا توجد مهام حالياً</p></div>';
    } else {
      tasks.forEach(t => {
        const icon = t.icon || "✓";
        const diff = t.difficulty === "easy" ? "easy" : t.difficulty === "hard" ? "hard" : "med";
        html += `
          <div class="task-item">
            <span class="task-icon">${icon}</span>
            <div class="task-info">
              <h4>${t.name}</h4>
              <p>${t.desc || ""}</p>
              <div class="task-rewards">
                <span><i class="fa-solid fa-star"></i> ${t.xp || 0} XP</span>
                <span><i class="fa-solid fa-coins"></i> ${t.coins || 0}</span>
              </div>
              <span class="tag ${diff}">${diff === "easy" ? "سهل" : diff === "hard" ? "صعب" : "متوسط"}</span>
            </div>
            <button class="task-btn" data-task="${t.id}">
              <i class="fa-solid fa-check"></i>
            </button>
          </div>
        `;
      });
    }

    el.innerHTML = html;

    $$(".task-btn", el).forEach(btn => {
      btn.addEventListener("click", async () => {
        const taskId = btn.dataset.task;
        const task = tasks.find(t => t.id === taskId);
        if (!task || !user) return;

        try {
          await incrementField(COLLECTIONS.users, user.id, "coins", task.coins || 0);
          await incrementField(COLLECTIONS.users, user.id, "xp", task.xp || 0);
          await createDoc(COLLECTIONS.activityLogs, {
            type: "task_completed",
            message: `أكمل مهمة: ${task.name}`,
            meta: { taskId, userId: user.id },
          });
          toast(`✅ أكملت: ${task.name}`);
          confetti();
        } catch (e) {
          toast("خطأ: " + e.message);
        }
      });
    });
  }, { orderField: "name", dir: "asc" });
}

// ============================================================
//  Leaderboard Screen
// ============================================================
export function renderLeaderboard(el) {
  el.innerHTML = '<div class="section-title">لوحة الترتيب</div><div class="card"><p class="muted">جاري التحميل...</p></div>';

  listenCollection(COLLECTIONS.users, (users) => {
    const sorted = [...users].sort((a, b) => (b.coins || 0) - (a.coins || 0));
    
    let html = '<div class="section-title">لوحة الترتيب</div>';
    if (!sorted.length) {
      html += '<div class="card"><p class="muted">لا يوجد أفراد</p></div>';
    } else {
      sorted.forEach((u, i) => {
        const isFilled = i === 0 ? "first" : "";
        const crown = i === 0 ? "👑 " : `${i + 1}. `;
        html += `
          <div class="lb-row ${isFilled}">
            <span class="lb-rank">${crown}</span>
            <span style="font-size: 24px;">${u.avatar || "🙂"}</span>
            <div style="flex: 1;">
              <strong>${u.name || "—"}</strong>
              <div class="muted" style="font-size: 12px;">مستوى ${u.level || 1}</div>
            </div>
            <div style="text-align: center;">
              <strong>${u.coins || 0}</strong>
              <div class="muted" style="font-size: 11px;">كوينز</div>
            </div>
          </div>
        `;
      });
    }
    el.innerHTML = html;
  }, { orderField: "coins", dir: "desc" });
}

// ============================================================
//  Shop Screen
// ============================================================
export function renderShop(el) {
  el.innerHTML = `
    <div class="section-title">متجر المكافآت</div>
    <div class="card">
      <h4>🎁 المكافآت المتاحة</h4>
      <p class="muted">قريباً: شراء مكافآت بالكوينز!</p>
    </div>
  `;
}

// ============================================================
//  Admin Panel Screen
// ============================================================
export function renderAdmin(el) {
  el.innerHTML = `
    <div class="section-title">🛡️ لوحة الإدارة</div>
    <div class="card">
      <h4>إضافة عضو جديد</h4>
      <label>الاسم</label>
      <input type="text" id="adm-name" placeholder="الاسم الكامل" />
      <label>الرمز (Emoji)</label>
      <input type="text" id="adm-emoji" placeholder="👨" />
      <label>رمز دخول (PIN) - اترك فارغاً للدخول بنقرة</label>
      <input type="text" id="adm-pin" placeholder="1234" />
      <label>الدور</label>
      <select id="adm-role">
        <option value="user">عضو</option>
        <option value="admin">مدير</option>
      </select>
      <button class="btn" style="width: 100%;" id="btn-add-user">
        <i class="fa-solid fa-user-plus"></i> إضافة
      </button>
    </div>

    <div class="card">
      <h4>إضافة مهمة</h4>
      <label>اسم المهمة</label>
      <input type="text" id="adm-task-name" placeholder="ترتيب الغرفة" />
      <label>الوصف</label>
      <input type="text" id="adm-task-desc" placeholder="وصف المهمة" />
      <label>مكافأة XP</label>
      <input type="number" id="adm-task-xp" placeholder="50" value="50" />
      <label>مكافأة كوينز</label>
      <input type="number" id="adm-task-coins" placeholder="10" value="10" />
      <label>الرمز</label>
      <input type="text" id="adm-task-icon" placeholder="🧹" value="✓" />
      <button class="btn" style="width: 100%;" id="btn-add-task">
        <i class="fa-solid fa-list-plus"></i> إضافة مهمة
      </button>
    </div>
  `;

  $("#btn-add-user").addEventListener("click", async () => {
    const name = $("#adm-name").value.trim();
    const emoji = $("#adm-emoji").value.trim() || "🙂";
    const pin = $("#adm-pin").value.trim();
    const role = $("#adm-role").value;

    if (!name) { toast("أدخل الاسم"); return; }

    const id = "u_" + Date.now();
    try {
      await setDocById(COLLECTIONS.users, id, {
        name, avatar: emoji, pin, role,
        level: 1, xp: 0, coins: 20, gems: 0, frozen: 0, streak: 0, rank: "عضو",
      }, false);
      toast(`✅ تم إضافة ${name}`);
      $("#adm-name").value = "";
      $("#adm-emoji").value = "";
      $("#adm-pin").value = "";
    } catch (e) {
      toast("خطأ: " + e.message);
    }
  });

  $("#btn-add-task").addEventListener("click", async () => {
    const name = $("#adm-task-name").value.trim();
    const desc = $("#adm-task-desc").value.trim();
    const xp = parseInt($("#adm-task-xp").value) || 0;
    const coins = parseInt($("#adm-task-coins").value) || 0;
    const icon = $("#adm-task-icon").value.trim() || "✓";

    if (!name) { toast("أدخل اسم المهمة"); return; }

    try {
      await createDoc(COLLECTIONS.tasks, {
        name, desc, xp, coins, icon, difficulty: "easy", type: "daily", active: true,
      });
      toast(`✅ تم إضافة مهمة: ${name}`);
      $("#adm-task-name").value = "";
      $("#adm-task-desc").value = "";
      $("#adm-task-xp").value = "50";
      $("#adm-task-coins").value = "10";
    } catch (e) {
      toast("خطأ: " + e.message);
    }
  });
}
