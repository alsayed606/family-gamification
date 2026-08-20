import { createHashRouter, Navigate } from "react-router-dom";
import {
  RedirectIfSignedIn,
  RequireAdmin,
  RequireAuth,
  RequireVerified,
} from "../auth/guards";
import { Hub } from "../screens/Hub";
import { Placeholder } from "../screens/Placeholder";
import { ErrorScreen } from "../screens/ErrorScreen";

// ============================================================
//  التوجيه
//
//  HashRouter لا BrowserRouter: التوجيه من طرف العميل يحتاج من الخادم
//  إعادة كل المسارات إلى index.html، وGitHub Pages لا تفعل ذلك (تُرجع
//  404 عند تحديث /admin مثلًا). الـ hash يُحلّ في المتصفح فيعمل على
//  GitHub Pages وFirebase Hosting وفتح الملف محليًا — بلا إعداد خادم.
//  الثمن: شكل الرابط /#/hub. مقايضة مقبولة لنظام خاص.
// ============================================================

export const router = createHashRouter([
  {
    errorElement: <ErrorScreen />,
    children: [
      { index: true, element: <Navigate to="/hub" replace /> },

      // ── عامة: للزائر غير المسجَّل ──
      {
        element: <RedirectIfSignedIn />,
        children: [
          {
            path: "/login",
            element: (
              <Placeholder
                title="تسجيل الدخول"
                note="الدخول بالبريد وكلمة المرور، مع إنشاء حساب واستعادة كلمة المرور."
                step="الخطوة 4"
              />
            ),
          },
          {
            path: "/register",
            element: (
              <Placeholder
                title="حساب جديد"
                note="تسجيل ولي أمر ببريد إلكتروني، ثم توثيق البريد."
                step="الخطوة 4"
              />
            ),
          },
        ],
      },

      // ── تتطلب دخولًا فقط (قبل توثيق البريد) ──
      {
        element: <RequireAuth />,
        children: [
          {
            path: "/verify",
            element: (
              <Placeholder
                title="وثّق بريدك"
                note="أُرسلت رسالة تحقق. بعد التوثيق تُفتح بقية أقسام النظام."
                step="الخطوة 4"
              />
            ),
          },
          {
            path: "/suspended",
            element: (
              <Placeholder
                title="الحساب موقوف"
                note="أوقف المدير هذا الحساب. راجعه لإعادة تفعيله."
                step="الخطوة 6"
              />
            ),
          },
        ],
      },

      // ── تتطلب توثيق البريد ──
      {
        element: <RequireVerified />,
        children: [
          { path: "/hub", element: <Hub /> },
          {
            path: "/account",
            element: (
              <Placeholder
                title="حسابي"
                note="الاسم والصورة، وإدارة ملفات الأبناء."
                step="الخطوة 5"
              />
            ),
          },
        ],
      },

      // ── تتطلب دور admin ──
      {
        element: <RequireAdmin />,
        children: [
          {
            path: "/admin",
            element: (
              <Placeholder
                title="لوحة التحكم"
                note="عرض المستخدمين، وتغيير الأدوار والحالات."
                step="الخطوة 6"
              />
            ),
          },
        ],
      },

      { path: "*", element: <ErrorScreen notFound /> },
    ],
  },
]);
