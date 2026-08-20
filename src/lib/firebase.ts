import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// ============================================================
//  تهيئة Firebase
//
//  الإعدادات تأتي من متغيّرات بيئة Vite في ملف .env.local (مستثنى من
//  git). راجع .env.example للصيغة، و docs/PHASE-0.md لإنشاء المشروع.
//
//  ملاحظة: apiKey في Firebase ليس سرًّا — يُرسل للمتصفح بالضرورة.
//  الحدّ الأمني هو قواعد Firestore و App Check، لا إخفاء الإعدادات.
//  نستخدم متغيّرات البيئة للفصل بين البيئات (محاكي/إنتاج) لا للإخفاء.
// ============================================================

const USE_EMULATOR = import.meta.env.VITE_USE_EMULATOR === "true";

/**
 * عند العمل على المحاكي لا نحتاج مشروعًا حقيقيًا: أي projectId ببادئة
 * demo- يجعل المحاكي يعمل بلا اعتمادات. هذا يسمح ببناء التطبيق واختباره
 * كاملًا قبل إنشاء مشروع Firebase الحقيقي.
 */
const EMULATOR_CONFIG: FirebaseOptions = {
  apiKey: "demo-api-key",
  authDomain: "demo-family-game-center.firebaseapp.com",
  projectId: "demo-family-game-center",
};

function readEnvConfig(): FirebaseOptions {
  const env = import.meta.env;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error(
      "لم تُضبط إعدادات Firebase. أنشئ ملف .env.local انطلاقًا من " +
        ".env.example — أو شغّل على المحاكي بـ VITE_USE_EMULATOR=true. " +
        "راجع docs/PHASE-0.md"
    );
  }

  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
}

const app = initializeApp(USE_EMULATOR ? EMULATOR_CONFIG : readEnvConfig());

export const auth = getAuth(app);
export const db = getFirestore(app);

if (USE_EMULATOR) {
  // disableWarnings يكتم لافتة المحاكي الحمراء في الطرفية فقط؛
  // الاتصال نفسه واضح في السجل أدناه.
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  console.info("[firebase] متصل بالمحاكي المحلي — لا بيانات حقيقية.");
}

export const isEmulator = USE_EMULATOR;
