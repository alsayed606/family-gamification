import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AgeBand } from "../types";

// ملفات الأبناء: مجموعة فرعية داخل مستند ولي الأمر.
//
// الملكية مضمونة بالمسار نفسه (users/{uid}/profiles/*)، فلا يمكن أن
// يصبح ملف يتيمًا ولا أن يُنسب لولي أمر آخر. لا حاجة لحقل guardianId
// ولا للتحقق منه في القواعد.

function profilesRef(uid: string) {
  return collection(db, "users", uid, "profiles");
}

export type ProfileInput = {
  displayName: string;
  avatar: string;
  ageBand?: AgeBand;
};

export async function createProfile(uid: string, input: ProfileInput) {
  const data: Record<string, unknown> = {
    displayName: input.displayName.trim(),
    avatar: input.avatar,
  };
  // يُحذف الحقل بالكامل إن لم تُختَر فئة عمرية: القاعدة تقبل غيابه،
  // لكنها ترفض قيمة خارج القائمة — و null من ضمنها.
  if (input.ageBand) data.ageBand = input.ageBand;

  const ref = await addDoc(profilesRef(uid), data);
  return ref.id;
}

export async function updateProfileDoc(
  uid: string,
  profileId: string,
  input: ProfileInput
) {
  const data: Record<string, unknown> = {
    displayName: input.displayName.trim(),
    avatar: input.avatar,
    // عند التعديل لا يكفي حذف المفتاح: updateDoc يدمج، فتبقى القيمة
    // القديمة. deleteField هو ما يزيلها فعلًا من المستند.
    ageBand: input.ageBand ?? deleteField(),
  };
  await updateDoc(doc(db, "users", uid, "profiles", profileId), data);
}

export async function deleteProfile(uid: string, profileId: string) {
  await deleteDoc(doc(db, "users", uid, "profiles", profileId));
}
