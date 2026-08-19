// ============================================================
//  firebase-config.js
//  Firebase Modular SDK Setup + CRUD + Realtime Helpers
// ============================================================

// ============================================================
//  إعدادات Firebase
//
//  ⚠️ المرحلة 0: فُصل هذا التطبيق عن مشروع marine-command-center
//  (المشترك مع أعمال Red Sea Marine). لا يجوز لتطبيق العائلة أن يشارك
//  مشروعًا مع بيانات أعمال.
//
//  للتشغيل: أنشئ مشروع Firebase مخصّصًا، ثم انسخ إعداداته إلى
//  src/js/firebase-config.local.js (الملف مستثنى من git):
//
//      export const firebaseConfig = {
//        apiKey: "...", authDomain: "...", projectId: "...",
//        storageBucket: "...", messagingSenderId: "...", appId: "...",
//      };
//
//  ملاحظة: مفتاح apiKey في Firebase ليس سرًّا — الحدّ الأمني الحقيقي هو
//  قواعد Firestore و App Check، وليس إخفاء الإعدادات.
//
//  لماذا الاستيراد ديناميكي أدناه؟ عبارات import الثابتة تُرفع وتُنفَّذ قبل
//  أي كود في الوحدة، فلو كانت ثابتة لانهار الملف عند أول سطر حين يكون
//  الـ CDN محجوبًا (شبكة مقيّدة، مانع إعلانات، أو انقطاع) — وتظهر شاشة
//  بيضاء بلا تفسير. الاستيراد الديناميكي يسمح بفحص الإعدادات أولًا،
//  وبإظهار رسالة مفهومة لكل حالة فشل على حدة.
// ============================================================

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";

function fatal(msg) {
  const show = () =>
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div style="position:fixed;inset-inline:0;top:0;z-index:999;padding:14px;
        background:#3a1220;color:#ffd9de;font:700 14px/1.7 system-ui;text-align:center">
        ⚠️ ${msg}</div>`
    );
  // الاستيراد الديناميكي أعلاه يجعل بقية الوحدة تُستأنف بعد إطلاق
  // DOMContentLoaded غالبًا، فلا نعتمد على المستمع وحده.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", show, { once: true });
  } else {
    show();
  }
  return new Error(msg);
}

// 1) الإعدادات المحلية أولًا — قبل أي طلب شبكة.
let firebaseConfig = null;
try {
  ({ firebaseConfig } = await import("./firebase-config.local.js"));
} catch {
  // لا يوجد ملف إعدادات محلي — يُعالَج أدناه.
}

if (!firebaseConfig?.projectId) {
  throw fatal(
    "لم تُضبط إعدادات Firebase بعد. أنشئ مشروعًا مخصّصًا وأضف " +
      "src/js/firebase-config.local.js — راجع docs/PHASE-0.md"
  );
}

// 2) ثم تحميل الـ SDK.
let initializeApp,
  getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment;

try {
  ({ initializeApp } = await import(`${SDK}/firebase-app.js`));
  ({
    getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc,
    updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot,
    serverTimestamp, increment,
  } = await import(`${SDK}/firebase-firestore.js`));
} catch {
  throw fatal(
    "تعذّر تحميل Firebase SDK من الإنترنت. تحقّق من الاتصال أو من مانع " +
      "الإعلانات، ثم أعد تحميل الصفحة."
  );
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================
//  Collection Names (مع بادئة واقية fam_)
// ============================================================
export const COLLECTIONS = {
  users:        "fam_users",
  tasks:        "fam_tasks",
  events:       "fam_events",
  notifications:"fam_notifications",
  rewards:      "fam_rewards",
  frozenCoins:  "fam_frozen_coins",
  achievements: "fam_achievements",
  seasons:      "fam_seasons",
  activityLogs: "fam_activity_logs",
};

// ============================================================
//  CRUD Helper Functions
// ============================================================

export async function createDoc(collName, data) {
  const ref = await addDoc(collection(db, collName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function setDocById(collName, id, data, merge = true) {
  await setDoc(doc(db, collName, id), data, { merge });
  return id;
}

export async function readDoc(collName, id) {
  const snap = await getDoc(doc(db, collName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function readAll(collName, orderField = null, dir = "desc") {
  const base = collection(db, collName);
  const q = orderField ? query(base, orderBy(orderField, dir)) : base;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateDocById(collName, id, data) {
  await updateDoc(doc(db, collName, id), data);
}

export async function incrementField(collName, id, field, by) {
  await updateDoc(doc(db, collName, id), { [field]: increment(by) });
}

export async function removeDoc(collName, id) {
  await deleteDoc(doc(db, collName, id));
}

// ============================================================
//  Realtime Listeners
// ============================================================

export function listenCollection(collName, callback, { orderField = null, dir = "desc", max = null } = {}) {
  const base = collection(db, collName);
  const clauses = [];
  if (orderField) clauses.push(orderBy(orderField, dir));
  if (max) clauses.push(limit(max));
  const q = clauses.length ? query(base, ...clauses) : base;

  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error(`[listen:${collName}]`, err)
  );
}

export function listenDoc(collName, id, callback) {
  return onSnapshot(
    doc(db, collName, id),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    (err) => console.error(`[listenDoc:${collName}/${id}]`, err)
  );
}

// ============================================================
//  Helper Functions
// ============================================================

export async function logActivity(type, message, meta = {}) {
  return createDoc(COLLECTIONS.activityLogs, { type, message, meta });
}

export async function pushNotification(text, type = "info", meta = {}) {
  return createDoc(COLLECTIONS.notifications, { text, type, meta, read: false });
}

export { db, serverTimestamp, increment, where, query, collection, orderBy, limit };
