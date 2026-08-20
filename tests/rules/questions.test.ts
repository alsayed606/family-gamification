import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  ADMIN_UID,
  MEMBER_UID,
  OTHER_UID,
  anonymous,
  makeTestEnv,
  questionDoc,
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

/** أسئلة ممهَّدة بمعرّفات ثابتة كي تشير إليها الاختبارات مباشرة. */
const PUBLISHED = "q_published";
const MY_DRAFT = "q_my_draft";
const OTHER_DRAFT = "q_other_draft";

beforeEach(async () => {
  await env.clearFirestore();
  await seed(env, async (db) => {
    await setDoc(doc(db, "users", ADMIN_UID), userDoc({
      uid: ADMIN_UID, email: "admin@example.com", displayName: "المدير", role: "admin",
    }));
    await setDoc(doc(db, "users", MEMBER_UID), userDoc());
    await setDoc(doc(db, "users", OTHER_UID), userDoc({
      uid: OTHER_UID, email: "other@example.com", displayName: "عضو آخر",
    }));

    await setDoc(doc(db, "questions", PUBLISHED), questionDoc({
      status: "PUBLISHED", createdBy: ADMIN_UID,
    }));
    await setDoc(doc(db, "questions", MY_DRAFT), questionDoc({
      createdBy: MEMBER_UID,
    }));
    await setDoc(doc(db, "questions", OTHER_DRAFT), questionDoc({
      createdBy: OTHER_UID,
    }));
  });
});

// ============================================================
//  السلبيات أولًا — هذه هي التي تثبت أن الحدّ قائم فعلًا
// ============================================================

describe("الزائر غير المسجّل", () => {
  it("لا يقرأ سؤالًا منشورًا", async () => {
    const db = anonymous(env);
    await assertFails(getDoc(doc(db, "questions", PUBLISHED)));
  });

  it("لا ينشئ سؤالًا", async () => {
    const db = anonymous(env);
    await assertFails(addDoc(collection(db, "questions"), questionDoc()));
  });
});

describe("العضو غير الموثّق بريده", () => {
  it("لا يقرأ ولا يكتب", async () => {
    const db = unverified(env, MEMBER_UID);
    await assertFails(getDoc(doc(db, "questions", PUBLISHED)));
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ createdBy: MEMBER_UID }))
    );
  });
});

describe("العضو الموقوف", () => {
  it("لا يقرأ ولا يقترح", async () => {
    await seed(env, async (db) => {
      await setDoc(doc(db, "users", MEMBER_UID), userDoc({ status: "SUSPENDED" }));
    });
    const db = verified(env, MEMBER_UID);
    await assertFails(getDoc(doc(db, "questions", PUBLISHED)));
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ createdBy: MEMBER_UID }))
    );
  });
});

describe("العضو لا يتجاوز دور المدير", () => {
  it("لا ينشئ سؤالًا منشورًا مباشرة", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({
        status: "PUBLISHED", createdBy: MEMBER_UID,
      }))
    );
  });

  it("لا ينشر مسوّدته بنفسه", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      updateDoc(doc(db, "questions", MY_DRAFT), { status: "PUBLISHED" })
    );
  });

  it("لا ينسب سؤالًا إلى غيره", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ createdBy: OTHER_UID }))
    );
  });

  it("لا يعدّل سؤالًا منشورًا", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      updateDoc(doc(db, "questions", PUBLISHED), { prompt: "نصّ مُبدَّل" })
    );
  });

  it("لا يعدّل مسوّدة عضو آخر", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      updateDoc(doc(db, "questions", OTHER_DRAFT), { prompt: "نصّ مُبدَّل" })
    );
  });

  it("لا يقرأ مسوّدة عضو آخر", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(getDoc(doc(db, "questions", OTHER_DRAFT)));
  });

  it("لا يحذف مسوّدة عضو آخر ولا سؤالًا منشورًا", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(deleteDoc(doc(db, "questions", OTHER_DRAFT)));
    await assertFails(deleteDoc(doc(db, "questions", PUBLISHED)));
  });

  it("لا يغيّر مُنشئ مسوّدته إلى غيره", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      updateDoc(doc(db, "questions", MY_DRAFT), { createdBy: OTHER_UID })
    );
  });
});

describe("المدير لا يزوّر النسبة", () => {
  it("لا يغيّر createdBy عند المراجعة", async () => {
    const db = verified(env, ADMIN_UID);
    await assertFails(
      updateDoc(doc(db, "questions", MY_DRAFT), { createdBy: ADMIN_UID })
    );
  });
});

// ── تحقّق الشكل: سؤال بلا إجابة صحيحة مستحيل ────────────────

describe("سلامة السؤال مفروضة في القواعد", () => {
  it("يرفض إجابة ليست ضمن الخيارات", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ answer: "أبها" }))
    );
  });

  it("يرفض خيارًا واحدًا فقط", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({
        choices: ["الرياض"], answer: "الرياض",
      }))
    );
  });

  it("يرفض أكثر من ستة خيارات", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({
        choices: ["1", "2", "3", "4", "5", "6", "7"], answer: "1",
      }))
    );
  });

  it("يرفض نوعًا غير معروف", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ type: "ESSAY" }))
    );
  });

  it("يرفض صعوبة غير معروفة", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ difficulty: "INSANE" }))
    );
  });

  it("يرفض نصًّا فارغًا أو أطول من الحدّ", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ prompt: "" }))
    );
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ prompt: "س".repeat(301) }))
    );
  });

  it("يرفض صح/خطأ بخيارات غير الخيارين المثبَّتين", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({
        type: "TRUE_FALSE", choices: ["نعم", "لا"], answer: "نعم",
      }))
    );
  });

  it("يرفض كلمة مبعثرة تحمل خيارات", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({
        type: "WORD_SCRAMBLE", choices: ["أ", "ب"], answer: "مدرسة",
      }))
    );
  });

  it("يرفض حالة غير معروفة", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      addDoc(collection(db, "questions"), questionDoc({ status: "ARCHIVED" }))
    );
  });

  it("يرفض إفساد سؤال صالح إلى شكل غير صالح بالتعديل", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      updateDoc(doc(db, "questions", MY_DRAFT), { answer: "ليست خيارًا" })
    );
  });
});

// ── الاستعلامات: القواعد ليست مرشِّحات ──────────────────────

describe("استعلامات القائمة", () => {
  it("يرفض سرد كل الأسئلة بلا قيد", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(getDocs(collection(db, "questions")));
  });

  it("يرفض سرد المسوّدات كلها", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      getDocs(query(collection(db, "questions"), where("status", "==", "DRAFT")))
    );
  });

  it("يسمح بسرد المنشور", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(
      getDocs(
        query(collection(db, "questions"), where("status", "==", "PUBLISHED"))
      )
    );
  });

  it("يسمح للعضو بسرد مسوّداته هو", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(
      getDocs(
        query(collection(db, "questions"), where("createdBy", "==", MEMBER_UID))
      )
    );
  });

  it("يرفض سرد مسوّدات عضو آخر", async () => {
    const db = verified(env, MEMBER_UID);
    await assertFails(
      getDocs(
        query(collection(db, "questions"), where("createdBy", "==", OTHER_UID))
      )
    );
  });

  it("يسمح للمدير بسرد كل شيء", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(getDocs(collection(db, "questions")));
  });
});

// ============================================================
//  الإيجابيات — المسار الذي يجب أن يعمل
// ============================================================

describe("المسار الصحيح", () => {
  it("العضو يقترح مسوّدة باسمه", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(
      addDoc(collection(db, "questions"), questionDoc({ createdBy: MEMBER_UID }))
    );
  });

  it("العضو يعدّل مسوّدته ويحذفها", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(
      updateDoc(doc(db, "questions", MY_DRAFT), { prompt: "صياغة أوضح؟" })
    );
    await assertSucceeds(deleteDoc(doc(db, "questions", MY_DRAFT)));
  });

  it("العضو يقرأ المنشور ومسوّدته", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(getDoc(doc(db, "questions", PUBLISHED)));
    await assertSucceeds(getDoc(doc(db, "questions", MY_DRAFT)));
  });

  it("المدير ينشر مسوّدة عضو", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(
      updateDoc(doc(db, "questions", MY_DRAFT), { status: "PUBLISHED" })
    );
  });

  it("المدير يسحب منشورًا إلى مسوّدة", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(
      updateDoc(doc(db, "questions", PUBLISHED), { status: "DRAFT" })
    );
  });

  it("المدير ينشئ سؤالًا منشورًا مباشرة", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(
      addDoc(collection(db, "questions"), questionDoc({
        status: "PUBLISHED", createdBy: ADMIN_UID,
      }))
    );
  });

  it("المدير يقرأ ويحذف مسوّدة أي عضو", async () => {
    const db = verified(env, ADMIN_UID);
    await assertSucceeds(getDoc(doc(db, "questions", OTHER_DRAFT)));
    await assertSucceeds(deleteDoc(doc(db, "questions", OTHER_DRAFT)));
  });

  it("يقبل كلمة مبعثرة بلا خيارات", async () => {
    const db = verified(env, MEMBER_UID);
    const { choices: _drop, ...rest } = questionDoc({
      type: "WORD_SCRAMBLE", answer: "مدرسة", createdBy: MEMBER_UID,
    });
    await assertSucceeds(addDoc(collection(db, "questions"), rest));
  });

  it("يقبل صح/خطأ بالخيارين المثبَّتين", async () => {
    const db = verified(env, MEMBER_UID);
    await assertSucceeds(
      addDoc(collection(db, "questions"), questionDoc({
        type: "TRUE_FALSE", choices: ["صح", "خطأ"], answer: "صح",
        createdBy: MEMBER_UID,
      }))
    );
  });
});
