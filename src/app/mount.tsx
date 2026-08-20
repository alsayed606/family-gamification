import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "../auth/AuthProvider";
import { router } from "./router";

/**
 * الإقلاع الفعلي. مفصول عن main.tsx كي يُستورد ديناميكيًا: تهيئة Firebase
 * تقع أثناء تقييم الوحدة، فلو استُوردت ثابتًا لانهار الملف قبل أن يعمل أي
 * كود — ولا ErrorBoundary يلتقط ذلك، لأن React لم يبدأ بعد.
 */
export function mount(rootEl: HTMLElement) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>
  );
}
