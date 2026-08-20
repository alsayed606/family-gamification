import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { Spinner } from "../components/Spinner";

// ============================================================
//  حرّاس المسارات
//
//  ⚠️ هذه الحراسة للتجربة لا للأمان. أي شخص يستطيع تعديل حالة المتصفح
//  والوصول إلى أي مسار. ما يحمي البيانات فعلًا هو قواعد Firestore التي
//  تُنفَّذ على خوادم Google. الحارس هنا يمنع عرض شاشة لا معنى لها فقط.
// ============================================================

/**
 * يمنع المرور قبل استقرار حالة الدخول *والدور* معًا.
 *
 * لا يكفي انتهاء onAuthStateChanged: يبقى الدور مجهولًا حتى تصل أول لقطة
 * من مستند المستخدم. لو مرَّ الحارس في تلك الفجوة لقرأ "بلا دور" كأنه
 * قرار نهائي، فيُطرد المدير من /admin كلما فتح الرابط مباشرةً.
 */
function useAuthSettled() {
  const { loading, profileResolved, user } = useAuth();
  return !loading && (!user || profileResolved);
}

export function RequireAuth() {
  const { user } = useAuth();
  const settled = useAuthSettled();
  const location = useLocation();

  if (!settled) return <Spinner label="جارٍ التحقق من الجلسة…" />;
  if (!user) {
    // نحفظ الوجهة كي نعيده إليها بعد الدخول بدل رميه في الصفحة الرئيسية.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireVerified() {
  const { user, isVerified, isSuspended } = useAuth();
  const settled = useAuthSettled();

  if (!settled) return <Spinner label="جارٍ التحقق من الجلسة…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isVerified) return <Navigate to="/verify" replace />;
  if (isSuspended) return <Navigate to="/suspended" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, isVerified, isAdmin } = useAuth();
  const settled = useAuthSettled();

  if (!settled) return <Spinner label="جارٍ التحقق من الصلاحية…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isVerified) return <Navigate to="/verify" replace />;
  if (!isAdmin) return <Navigate to="/hub" replace />;
  return <Outlet />;
}

/** يبعد المستخدم المسجَّل عن شاشات الدخول والتسجيل. */
export function RedirectIfSignedIn() {
  const { user, isVerified } = useAuth();
  const settled = useAuthSettled();

  if (!settled) return <Spinner label="جارٍ التحميل…" />;
  if (user) return <Navigate to={isVerified ? "/hub" : "/verify"} replace />;
  return <Outlet />;
}
