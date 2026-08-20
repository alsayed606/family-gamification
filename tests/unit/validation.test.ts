import { describe, expect, it } from "vitest";
import {
  NAME_MAX,
  PASSWORD_MIN,
  validateAvatar,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
} from "../../src/lib/validation";

describe("validateDisplayName", () => {
  it("يقبل اسمًا عاديًا", () => {
    expect(validateDisplayName("عبدالله")).toBeNull();
  });

  it("يرفض الفارغ والمسافات فقط", () => {
    expect(validateDisplayName("")).not.toBeNull();
    expect(validateDisplayName("   ")).not.toBeNull();
  });

  it("يقبل عند الحد الأقصى بالضبط ويرفض بعده بحرف", () => {
    expect(validateDisplayName("ا".repeat(NAME_MAX))).toBeNull();
    expect(validateDisplayName("ا".repeat(NAME_MAX + 1))).not.toBeNull();
  });

  it("يتجاهل المسافات الطرفية عند القياس", () => {
    expect(validateDisplayName(`  ${"ا".repeat(NAME_MAX)}  `)).toBeNull();
  });
});

describe("validateEmail", () => {
  it("يقبل صيغًا صحيحة", () => {
    for (const email of ["a@b.co", "user.name+tag@example.com", "x@y.z.example"]) {
      expect(validateEmail(email), email).toBeNull();
    }
  });

  it("يرفض صيغًا غير صحيحة", () => {
    for (const email of ["", "user", "user@", "@example.com", "user@site", "a b@c.co"]) {
      expect(validateEmail(email), email).not.toBeNull();
    }
  });
});

describe("validatePassword", () => {
  it("يقبل عند الحد الأدنى بالضبط", () => {
    expect(validatePassword("x".repeat(PASSWORD_MIN))).toBeNull();
  });

  it("يرفض ما دون الحد الأدنى بحرف", () => {
    expect(validatePassword("x".repeat(PASSWORD_MIN - 1))).not.toBeNull();
  });

  it("يرفض الفارغ", () => {
    expect(validatePassword("")).not.toBeNull();
  });

  it("لا يقصّ المسافات — المسافة محرف صالح في كلمة المرور", () => {
    expect(validatePassword("        ")).toBeNull();
  });
});

describe("validatePasswordConfirm", () => {
  it("يقبل المتطابقتين", () => {
    expect(validatePasswordConfirm("secret123", "secret123")).toBeNull();
  });

  it("يرفض غير المتطابقتين", () => {
    expect(validatePasswordConfirm("secret123", "secret124")).not.toBeNull();
  });

  it("يرفض التأكيد الفارغ", () => {
    expect(validatePasswordConfirm("secret123", "")).not.toBeNull();
  });
});

describe("validateAvatar", () => {
  it("يقبل رمزًا ويرفض الفراغ", () => {
    expect(validateAvatar("🦊")).toBeNull();
    expect(validateAvatar("  ")).not.toBeNull();
  });
});

describe("توافق الحدود مع قواعد Firestore", () => {
  it("حد الاسم يطابق ما تفرضه القواعد (40)", () => {
    // القاعدة: isValidName يشترط size() > 0 و <= 40.
    // اختلاف الحدّين يعني رفضًا من الخادم بعد قبول النموذج.
    expect(NAME_MAX).toBe(40);
  });

  it("حد كلمة المرور لا يقل عن حدّ Firebase (6)", () => {
    expect(PASSWORD_MIN).toBeGreaterThanOrEqual(6);
  });
});
