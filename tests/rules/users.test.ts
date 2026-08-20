import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  ADMIN_UID,
  MEMBER_UID,
  OTHER_UID,
  anonymous,
  makeTestEnv,
  seed,
  unverified,
  userDoc,
  verified,
} from "./helpers";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await makeTestEnv();
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // تمهيد: مدير وعضوان — كما لو أُنشئوا من Console/بالتسجيل.
  await seed(env, async (db) => {
    await setDoc(doc(db, "users", ADMIN_UID), userDoc({
      uid: ADMIN_UID, email: "admin@example.com", displayName: "المدير", role: "admin",
    }));
    await setDoc(doc(db, "users", MEMBER_UID), userDoc());
    await setDoc(doc(db, "users", OTHER_UID), userDoc({
      uid: OTHER_UID, email: "other@example.com", displayName: "عضو آخر",
    }));
  });
});

// ============================================================
//  السلبيات أولًا — هذه هي التي تثبت أن الحدّ الأمني قائم فعلًا
// ============================================================

describe("الزائر غير المسجّل", () => {
  it("لا يقرأ أي مستند مستخدم", async () => {
    const db = anonymous(env);
    await assertFails(getDoc(doc(db, "users", MEMBER_UID)));
  });

  it("لا ينشئ مستخدمًا", async () => {
    const db = anonymous(env);
    await assertFails(setDoc(doc(db, "users", "uid_intruder"), userDoc()));
  });

  it("لا يقرأ ملفات الأبناء", async () => {
    const db = anonymous(env);
    await assertFails(getDoc(doc(db, "users", MEMBER_UID, "profiles", "p1")));
  });
});

describe("العزل بين المستخدمين", () => {
  it("العضو لا يقرأ مستند عضو آخر", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(getDoc(doc(db, "users", OTHER_UID)));
  });

  it("العضو لا يعدّل مستند عضو آخر", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      updateDoc(doc(db, "users", OTHER_UID), { displayName: "مُخترَق" })
    );
  });

  it("العضو لا ينشئ مستندًا باسم مستخدم آخر", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      setDoc(doc(db, "users", "uid_fabricated"), userDoc({ uid: "uid_fabricated" }))
    );
  });

  it("العضو لا يقرأ ملفات أبناء عضو آخر", async () => {
    await seed(env, async (db) => {
      await setDoc(doc(db, "users", OTHER_UID, "profiles", "p1"), {
        displayName: "ابن", avatar: "🧒",
      });
    });
    const db = verified(env, MEMBER_UID);
    await assertFails(getDoc(doc(db, "users", OTHER_UID, "profiles", "p1")));
  });
});

describe("منع تصعيد الصلاحيات", () => {
  it("العضو لا يرقّي نفسه إلى admin", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(updateDoc(doc(db, "users", MEMBER_UID), { role: "admin" }));
  });

  it("العضو لا يسجّل نفسه بدور admin ابتداءً", async () => {
    await env.clearFirestore();
    const db = verified(env, "uid_fresh");
    await assertFails(
      setDoc(doc(db, "users", "uid_fresh"), userDoc({ uid: "uid_fresh", role: "admin" }))
    );
  });

  it("العضو لا يغيّر حالة حسابه (تجاوز الإيقاف)", async () => {
    await seed(env, async (db) => {
      await setDoc(doc(db, "users", MEMBER_UID), userDoc({ status: "SUSPENDED" }));
    });
    const db = verified(env, MEMBER_UID);
    await assertFails(updateDoc(doc(db, "users", MEMBER_UID), { status: "ACTIVE" }));
  });

  it("العضو لا يغيّر uid داخل مستنده", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(updateDoc(doc(db, "users", MEMBER_UID), { uid: ADMIN_UID }));
  });

  it("المدير لا يعدّل دور نفسه (وقاية من قفل النظام)", async () => {
    const db = verified(env, ADMIN_UID);
    await assertFails(updateDoc(doc(db, "users", ADMIN_UID), { role: "member" }));
  });

  it("لا أحد يحذف مستند مستخدم — حتى المدير", async () => {
    const memberDb = verified(env, MEMBER_UID);
    await assertFails(deleteDoc(doc(memberDb, "users", MEMBER_UID)));

    const adminDb = verified(env, ADMIN_UID);
    await assertFails(deleteDoc(doc(adminDb, "users", OTHER_UID)));
  });
});

describe("ملف الابن ليس مسار تصعيد", () => {
  it("لا يمكن كتابة حقل role داخل ملف ابن", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      setDoc(doc(db, "users", MEMBER_UID, "profiles", "p1"), {
        displayName: "ابن", avatar: "🧒", role: "admin",
      })
    );
  });

  it("لا يمكن كتابة حقل status داخل ملف ابن", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      setDoc(doc(db, "users", MEMBER_UID, "profiles", "p1"), {
        displayName: "ابن", avatar: "🧒", status: "ACTIVE",
      })
    );
  });

  it("وجود ملف ابن لا يمنح صاحبه أي صلاحية إدارية", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(
      setDoc(doc(db, "users", MEMBER_UID, "profiles", "p1"), {
        displayName: "ابن", avatar: "🧒", ageBand: "6_8",
      })
    );
    // ما زال عاجزًا عن كل ما يخص الإدارة بعد امتلاك ملف.
    await assertFails(getDoc(doc(db, "users", OTHER_UID)));
    await assertFails(updateDoc(doc(db, "users", OTHER_UID), { role: "member" }));
    await assertFails(updateDoc(doc(db, "users", MEMBER_UID), { role: "admin" }));
  });

  it("يرفض ageBand خارج القيم المسموحة", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      setDoc(doc(db, "users", MEMBER_UID, "profiles", "p1"), {
        displayName: "ابن", avatar: "🧒", ageBand: "99_PLUS",
      })
    );
  });
});

describe("توثيق البريد مطلوب للأفعال المؤثّرة", () => {
  it("غير الموثّق لا يعدّل ملفه الشخصي", async () => {
    const db = unverified(env, MEMBER_UID);
    await assertFails(updateDoc(doc(db, "users", MEMBER_UID), { displayName: "اسم" }));
  });

  it("غير الموثّق لا ينشئ ملف ابن", async () => {
    const db = unverified(env, MEMBER_UID);
    await assertFails(
      setDoc(doc(db, "users", MEMBER_UID, "profiles", "p1"), {
        displayName: "ابن", avatar: "🧒",
      })
    );
  });

  it("مدير غير موثّق البريد لا يُعامَل كمدير", async () => {
    const db = unverified(env, ADMIN_UID);
    await assertFails(getDoc(doc(db, "users", OTHER_UID)));
  });

  it("مدير موقوف الحساب لا يُعامَل كمدير", async () => {
    await seed(env, async (db) => {
      await setDoc(doc(db, "users", ADMIN_UID), userDoc({
        uid: ADMIN_UID, email: "admin@example.com", displayName: "المدير",
        role: "admin", status: "SUSPENDED",
      }));
    });
    const db = verified(env, ADMIN_UID);
    await assertFails(getDoc(doc(db, "users", OTHER_UID)));
  });
});

describe("التحقق من صحة المدخلات", () => {
  it("يرفض اسمًا فارغًا", async () => {
    await env.clearFirestore();
    const db = verified(env, "uid_fresh");
    await assertFails(
      setDoc(doc(db, "users", "uid_fresh"), userDoc({ uid: "uid_fresh", displayName: "" }))
    );
  });

  it("يرفض اسمًا يتجاوز 40 حرفًا", async () => {
    await env.clearFirestore();
    const db = verified(env, "uid_fresh");
    await assertFails(
      setDoc(doc(db, "users", "uid_fresh"), userDoc({
        uid: "uid_fresh", displayName: "ا".repeat(41),
      }))
    );
  });

  it("يرفض uid لا يطابق مسار المستند", async () => {
    await env.clearFirestore();
    const db = verified(env, "uid_fresh");
    await assertFails(
      setDoc(doc(db, "users", "uid_fresh"), userDoc({ uid: "uid_someone_else" }))
    );
  });
});

describe("المجموعات غير المعرّفة مرفوضة", () => {
  it("لا يقرأ العضو مجموعة لا قاعدة لها", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(getDoc(doc(db, "scoreLedger", "entry1")));
  });

  it("لا يكتب المدير في مجموعة لا قاعدة لها", async () => {
    const db = verified(env, ADMIN_UID);
    await assertFails(setDoc(doc(db, "auditLogs", "log1"), { anything: true }));
  });

  it("مجموعات fam_* القديمة مرفوضة تمامًا", async () => {
    const db = verified(env, ADMIN_UID);
    await assertFails(getDoc(doc(db, "fam_users", "u_dad")));
    await assertFails(setDoc(doc(db, "fam_tasks", "t1"), { name: "مهمة" }));
  });
});

// ============================================================
//  الإيجابيات — ما يجب أن يعمل فعلًا
// ============================================================

describe("ما يُسمح به", () => {
  it("العضو يقرأ مستند نفسه", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(getDoc(doc(db, "users", MEMBER_UID)));
  });

  it("العضو غير الموثّق يقرأ مستند نفسه (لعرض شاشة التحقق)", async () => {
    const db = unverified(env, MEMBER_UID);
    await assertSucceeds(getDoc(doc(db, "users", MEMBER_UID)));
  });

  it("مستخدم جديد يسجّل نفسه بدور member", async () => {
    await env.clearFirestore();
    const db = verified(env, "uid_fresh");
    await assertSucceeds(
      setDoc(doc(db, "users", "uid_fresh"), userDoc({ uid: "uid_fresh" }))
    );
  });

  it("العضو يعدّل اسمه وصورته", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(
      updateDoc(doc(db, "users", MEMBER_UID), { displayName: "اسم جديد", avatar: "😀" })
    );
  });

  it("المدير يقرأ مستند أي مستخدم", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(getDoc(doc(db, "users", MEMBER_UID)));
  });

  it("المدير يرقّي عضوًا آخر إلى admin", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(
      updateDoc(doc(db, "users", MEMBER_UID), { role: "admin" })
    );
  });

  it("المدير يوقف عضوًا آخر", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(
      updateDoc(doc(db, "users", MEMBER_UID), { status: "SUSPENDED" })
    );
  });

  it("المدير يعدّل اسمه هو (دون مساس بدوره)", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(
      updateDoc(doc(db, "users", ADMIN_UID), { displayName: "المدير العام" })
    );
  });

  it("ولي الأمر ينشئ ويقرأ ويحذف ملفات أبنائه", async () => {
    const db = verified(env, MEMBER_UID);
    const ref = doc(db, "users", MEMBER_UID, "profiles", "p1");
    await assertSucceeds(
      setDoc(ref, { displayName: "سارة", avatar: "👧", ageBand: "9_12" })
    );
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(deleteDoc(ref));
  });

  it("المدير يقرأ ملفات أبناء أي مستخدم", async () => {
    await seed(env, async (db) => {
      await setDoc(doc(db, "users", MEMBER_UID, "profiles", "p1"), {
        displayName: "سارة", avatar: "👧",
      });
    });
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(getDoc(doc(db, "users", MEMBER_UID, "profiles", "p1")));
  });
});
