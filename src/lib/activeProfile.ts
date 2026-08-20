// ============================================================
//  الملف النشط — عرض فقط، لا صلاحية
//
//  ⚠️ ثابت لا يجوز كسره: تبديل الملف النشط لا يمنح ولا يمنع أي صلاحية.
//  الاختيار مخزّن في localStorage على الجهاز، أي أن أي مستخدم يستطيع
//  تعديله بحرّية — فلا يصلح حدًّا أمنيًا بحال. كل الصلاحيات تبقى
//  صلاحيات حساب ولي الأمر مهما كان الملف النشط.
//
//  هذا بالضبط الخطأ الذي وقع فيه النظام القديم حين عامل PIN الطفل
//  كأنه حماية.
// ============================================================

/** معرّف محجوز لولي الأمر نفسه ضمن قائمة الملفات. */
export const GUARDIAN_ID = "__guardian__";

export const ACTIVE_PROFILE_KEY = "fgc:active-profile";

/**
 * يحسم الملف النشط مقابل القائمة الحيّة.
 *
 * الحالة المهمّة: مُعرّف مخزَّن لملف حُذف من جهاز آخر. الرجوع إلى ولي
 * الأمر يمنع بقاء التطبيق يشير إلى ملف غير موجود.
 */
export function resolveActiveId(
  storedId: string | null | undefined,
  availableIds: readonly string[]
): string {
  if (!storedId) return GUARDIAN_ID;
  if (storedId === GUARDIAN_ID) return GUARDIAN_ID;
  return availableIds.includes(storedId) ? storedId : GUARDIAN_ID;
}

export function readStoredActiveId(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredActiveId(id: string): void {
  try {
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch {
    // التخزين قد يكون معطّلًا (تصفّح خاص) — الاختيار يبقى للجلسة فقط.
  }
}
