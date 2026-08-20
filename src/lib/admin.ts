import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { AccountStatus, Role } from "../types";

// ============================================================
//  عمليات المدير
//
//  الفرض الحقيقي في config/firestore.rules: المدير يعدّل غيره لا نفسه.
//  ما هنا مجرد استدعاء؛ الخادم هو من يقبل أو يرفض.
//
//  ── لماذا لا يمكن أن يبقى النظام بلا مدير ──
//  القاعدة تمنع المدير من تعديل مستنده هو (userId != request.auth.uid)،
//  والتعديل مقصور على المديرين. فالمدير الوحيد لا يستطيع تنزيل نفسه،
//  ولا أحد غيره يملك صلاحية تنزيله. الحماية بنيوية لا بفحص "آخر مدير".
// ============================================================

export async function setUserRole(uid: string, role: Role): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}

export async function setUserStatus(
  uid: string,
  status: AccountStatus
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { status });
}
