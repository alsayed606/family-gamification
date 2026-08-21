import { createHashRouter, Navigate } from "react-router-dom";
import {
  RedirectIfSignedIn,
  RequireAdmin,
  RequireAuth,
  RequireVerified,
} from "../auth/guards";
import { Hub } from "../screens/Hub";
import { Account } from "../screens/Account";
import { Admin } from "../screens/Admin";
import { QuestionBank } from "../screens/QuestionBank";
import { Suspended } from "../screens/Suspended";
import {
  ArabicWordChallengeRoute,
  FamilyQuizRoute,
} from "../screens/GameRoute";
import { Login } from "../screens/Login";
import { Register } from "../screens/Register";
import { Verify } from "../screens/Verify";
import { ResetPassword } from "../screens/ResetPassword";
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
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
          { path: "/reset", element: <ResetPassword /> },
        ],
      },

      // ── تتطلب دخولًا فقط (قبل توثيق البريد) ──
      {
        element: <RequireAuth />,
        children: [
          { path: "/verify", element: <Verify /> },
          { path: "/suspended", element: <Suspended /> },
        ],
      },

      // ── تتطلب توثيق البريد ──
      {
        element: <RequireVerified />,
        children: [
          { path: "/hub", element: <Hub /> },
          { path: "/account", element: <Account /> },
          // البنك مشترك بين الألعاب، فمكانه خارج /games/* عمدًا.
          { path: "/questions", element: <QuestionBank /> },
          {
            path: "/games/arabic-word-challenge",
            element: <ArabicWordChallengeRoute />,
          },
          { path: "/games/family-quiz", element: <FamilyQuizRoute /> },
        ],
      },

      // ── تتطلب دور admin ──
      {
        element: <RequireAdmin />,
        children: [
          { path: "/admin", element: <Admin /> },
        ],
      },

      { path: "*", element: <ErrorScreen notFound /> },
    ],
  },
]);
