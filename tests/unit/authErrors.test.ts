import { describe, expect, it, vi } from "vitest";
import { AUTH_ERROR_CODES, authErrorMessage } from "../../src/lib/authErrors";

const FALLBACK = "حدث خطأ غير متوقّع. أعد المحاولة، وإن تكرّر راجع المدير.";

describe("authErrorMessage", () => {
  it("يترجم كل كود معروف إلى رسالة عربية غير الرسالة العامة", () => {
    for (const code of AUTH_ERROR_CODES) {
      const msg = authErrorMessage({ code });
      expect(msg, code).not.toBe(FALLBACK);
      expect(msg, code).not.toContain("auth/");
    }
  });

  it("يُرجع الرسالة العامة لكود غير معروف", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(authErrorMessage({ code: "auth/some-future-code" })).toBe(FALLBACK);
    warn.mockRestore();
  });

  it("يتحمّل أشكال أخطاء غير متوقّعة بلا رمي استثناء", () => {
    for (const value of [null, undefined, "نص", 42, {}, new Error("boom"), { code: 7 }]) {
      expect(() => authErrorMessage(value)).not.toThrow();
      expect(authErrorMessage(value)).toBe(FALLBACK);
    }
  });
});

describe("منع تعداد البُرد الإلكترونية", () => {
  it("يوحّد رسالة بريد غير مسجّل وكلمة مرور خاطئة", () => {
    // اختلاف الرسالتين يكشف للمهاجم أي البُرد مسجّلة في النظام.
    const invalid = authErrorMessage({ code: "auth/invalid-credential" });
    const wrongPassword = authErrorMessage({ code: "auth/wrong-password" });
    const noUser = authErrorMessage({ code: "auth/user-not-found" });

    expect(wrongPassword).toBe(invalid);
    expect(noUser).toBe(invalid);
  });

  it("الرسالة الموحّدة لا تُلمّح إلى وجود الحساب أو غيابه", () => {
    const msg = authErrorMessage({ code: "auth/user-not-found" });
    for (const leak of ["غير مسجّل", "غير موجود", "لا يوجد", "غير مُسجل"]) {
      expect(msg).not.toContain(leak);
    }
  });
});
