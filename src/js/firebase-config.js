// ============================================================
//  firebase-config.js
//  Firebase Modular SDK Setup + CRUD + Realtime Helpers
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCW-9S1RLNnIa12oAdikFSKg4Y4Bpsl7os",
  authDomain: "marine-command-center.firebaseapp.com",
  projectId: "marine-command-center",
  storageBucket: "marine-command-center.firebasestorage.app",
  messagingSenderId: "781767817474",
  appId: "1:781767817474:web:4a965e8b21cbfdd1dbaa1b",
};

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
