import ReactDOM from "react-dom/client";
import { FatalError } from "./app/FatalError";
import "./styles/global.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("عنصر #root غير موجود في index.html");

// استيراد ديناميكي مع catch: تهيئة Firebase تقع أثناء تقييم الوحدة، فإعدادات
// ناقصة كانت تُلقي خطأً قبل أن يُركَّب React أصلًا — فتظهر صفحة بيضاء تمامًا
// بلا أي تفسير للمستخدم. هنا نلتقط الفشل ونعرض سببه.
//
// سلسلة وعود لا await على المستوى الأعلى: الأخير غير مدعوم في هدف البناء
// الافتراضي (es2020)، ورفعُه لأجل هذا السطر وحده يضيّق دعم المتصفحات بلا داعٍ.
import("./app/mount")
  .then(({ mount }) => mount(rootEl))
  .catch((err: unknown) => {
    console.error("[bootstrap] فشل إقلاع التطبيق:", err);
    const message =
      err instanceof Error ? err.message : "خطأ غير معروف أثناء الإقلاع.";
    ReactDOM.createRoot(rootEl).render(<FatalError message={message} />);
  });
