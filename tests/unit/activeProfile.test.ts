import { describe, expect, it } from "vitest";
import { GUARDIAN_ID, resolveActiveId } from "../../src/lib/activeProfile";

describe("resolveActiveId", () => {
  const ids = ["p1", "p2", "p3"];

  it("يرجع لولي الأمر حين لا يوجد اختيار محفوظ", () => {
    expect(resolveActiveId(null, ids)).toBe(GUARDIAN_ID);
    expect(resolveActiveId(undefined, ids)).toBe(GUARDIAN_ID);
    expect(resolveActiveId("", ids)).toBe(GUARDIAN_ID);
  });

  it("يحترم اختيار ولي الأمر الصريح", () => {
    expect(resolveActiveId(GUARDIAN_ID, ids)).toBe(GUARDIAN_ID);
  });

  it("يحترم ملفًا موجودًا", () => {
    expect(resolveActiveId("p2", ids)).toBe("p2");
  });

  it("يرجع لولي الأمر إذا حُذف الملف المحفوظ من جهاز آخر", () => {
    expect(resolveActiveId("p9", ids)).toBe(GUARDIAN_ID);
  });

  it("يرجع لولي الأمر حين لا توجد ملفات إطلاقًا", () => {
    expect(resolveActiveId("p1", [])).toBe(GUARDIAN_ID);
  });

  it("لا يقبل قيمة عشوائية مدسوسة في التخزين", () => {
    // المستخدم يستطيع كتابة أي شيء في localStorage — يجب ألا يُقبل
    // إلا معرّف ملف موجود فعلًا، وإلا فولي الأمر.
    for (const junk of ["admin", "../../users", "{}", "__proto__"]) {
      expect(resolveActiveId(junk, ids)).toBe(GUARDIAN_ID);
    }
  });
});
