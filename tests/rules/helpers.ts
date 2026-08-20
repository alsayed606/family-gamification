import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

/**
 * نشتقّ النوع من المكتبة بدل استيراد Firestore المعياري: ctx.firestore()
 * يُرجع نسخة compat تعمل مع الدوال المعيارية وقت التشغيل لكن نوعها مختلف.
 */
type TestFirestore = ReturnType<RulesTestContext["firestore"]>;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

export const ADMIN_UID = "uid_admin";
export const MEMBER_UID = "uid_member";
export const OTHER_UID = "uid_other";

export async function makeTestEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    // بادئة demo- تجعل المحاكي يعمل بلا مشروع حقيقي ولا اعتمادات.
    projectId: "demo-family-game-center",
    firestore: {
      rules: readFileSync(resolve(repoRoot, "config/firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
}

/** مستخدم موثّق البريد — الحالة الطبيعية بعد التحقق. */
export function verified(env: RulesTestEnvironment, uid: string) {
  return env.authenticatedContext(uid, { email_verified: true }).firestore();
}

/** مستخدم سجّل ولم يوثّق بريده بعد. */
export function unverified(env: RulesTestEnvironment, uid: string) {
  return env.authenticatedContext(uid, { email_verified: false }).firestore();
}

export function anonymous(env: RulesTestEnvironment) {
  return env.unauthenticatedContext().firestore();
}

export function userDoc(overrides: Record<string, unknown> = {}) {
  return {
    uid: MEMBER_UID,
    email: "member@example.com",
    displayName: "عضو",
    avatar: "🙂",
    role: "member",
    status: "ACTIVE",
    ...overrides,
  };
}

/**
 * يزرع البيانات متجاوزًا القواعد — للتحضير فقط، لا للتأكيد.
 * يحاكي ما يفعله Firebase Console عند تمهيد المدير الأول.
 */
export async function seed(
  env: RulesTestEnvironment,
  writes: (db: TestFirestore) => Promise<void>
) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await writes(ctx.firestore());
  });
}
