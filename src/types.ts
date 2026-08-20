export type Role = "admin" | "member";
export type AccountStatus = "ACTIVE" | "SUSPENDED";

export type AgeBand = "UNDER_6" | "6_8" | "9_12" | "13_15" | "16_PLUS";

export const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: "UNDER_6", label: "أقل من 6" },
  { value: "6_8", label: "6 – 8" },
  { value: "9_12", label: "9 – 12" },
  { value: "13_15", label: "13 – 15" },
  { value: "16_PLUS", label: "16 فأكثر" },
];

/** مستند users/{uid} — يطابق ما تفرضه config/firestore.rules. */
export type UserDoc = {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
  role: Role;
  status: AccountStatus;
};

/**
 * مستند users/{uid}/profiles/{id} — ملف ابن.
 *
 * بيانات عرض بحتة: لا يحمل role ولا status، والقواعد ترفضهما عند الكتابة.
 * تبديل الملف النشط يحدث في المتصفح، فلا يصلح حدًّا أمنيًا بحال.
 */
export type ChildProfile = {
  id: string;
  displayName: string;
  avatar: string;
  ageBand?: AgeBand;
};
